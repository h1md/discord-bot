const { Client, GatewayIntentBits, Partials, Collection, Events, ActivityType } = require('discord.js');
const config = require('./config');
const { loadCommands } = require('./lib/loader');
const { buildInteraction } = require('./lib/messageAdapter');
const store = require('./lib/store');
const E = require('./lib/embeds');

if (!config.token) {
  console.error('❌ DISCORD_TOKEN manquant. Copie .env.example vers .env et remplis-le.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildInvites,
  ],
  partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.User],
});

client.commands = new Collection();
const commands = loadCommands();
for (const command of commands) client.commands.set(command.data.name, command);

console.log(`📦 ${commands.length} commandes chargées.`);

client.once(Events.ClientReady, (c) => {
  console.log(`✅ Connecté en tant que ${c.user.tag}`);
  c.user.setActivity(`${commands.length} cmds | ${config.defaultPrefix}help`, { type: ActivityType.Watching });
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  // Restriction proprietaire du bot
  if (command.ownerOnly && !config.ownerIds.includes(interaction.user.id)) {
    return interaction.reply({
      embeds: [E.error('Accès refusé', 'Cette commande est réservée aux propriétaires du bot.')],
      ephemeral: true,
    });
  }

  try {
    await command.execute(interaction, client);
  } catch (err) {
    console.error(`Erreur sur /${interaction.commandName}:`, err);
    const payload = {
      embeds: [E.error('Erreur', 'Une erreur est survenue pendant l\'exécution de la commande.')],
      ephemeral: true,
    };
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(payload).catch(() => {});
    } else {
      await interaction.reply(payload).catch(() => {});
    }
  }
});

// Commandes texte via préfixe (par défaut "+", modifiable avec /prefix-set)
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || !message.guild) return;
  const prefix = store.get(message.guildId, 'prefix', config.defaultPrefix) || config.defaultPrefix;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const name = (args.shift() || '').toLowerCase();
  const command = client.commands.get(name);
  if (!command) return;

  if (command.ownerOnly && !config.ownerIds.includes(message.author.id)) {
    return message.reply({ embeds: [E.error('Accès refusé', 'Commande réservée aux propriétaires du bot.')] }).catch(() => {});
  }
  if (command.permission && message.member && !message.member.permissions.has(command.permission)) {
    return message.reply({ embeds: [E.error('Permission manquante', 'Tu n\'as pas la permission pour cette commande.')] }).catch(() => {});
  }

  try {
    const fake = await buildInteraction(command, message, args, client);
    if (!fake) return;
    await command.execute(fake, client);
  } catch (err) {
    console.error(`Erreur sur ${prefix}${name}:`, err);
    await message.reply({ embeds: [E.error('Erreur', 'Une erreur est survenue pendant l\'exécution de la commande.')] }).catch(() => {});
  }
});

// Serveur HTTP optionnel (keepalive) — requis par certains hébergeurs
// (Alwaysdata, Render, Replit...) qui attendent une écoute sur un port.
if (process.env.PORT) {
  const http = require('http');
  const host = process.env.HOST || '0.0.0.0';
  http
    .createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`Bot en ligne — ${client.user ? client.user.tag : 'démarrage...'}`);
    })
    .listen(process.env.PORT, host, () => {
      console.log(`🌐 Serveur keepalive en écoute sur ${host}:${process.env.PORT}`);
    });
}

client.login(config.token);
