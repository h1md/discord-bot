const { Client, GatewayIntentBits, Partials, Collection, Events, ActivityType } = require('discord.js');
const config = require('./config');
const { loadCommands } = require('./lib/loader');
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
  c.user.setActivity(`${commands.length} commandes | /help`, { type: ActivityType.Watching });
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

client.login(config.token);
