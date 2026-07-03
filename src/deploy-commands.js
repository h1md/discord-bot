const { REST, Routes } = require('discord.js');
const config = require('./config');
const { loadCommands } = require('./lib/loader');

async function main() {
  const args = process.argv.slice(2);
  const global = args.includes('--global');
  const clear = args.includes('--clear');

  if (!config.token || !config.clientId) {
    console.error('❌ DISCORD_TOKEN et CLIENT_ID sont requis dans .env.');
    process.exit(1);
  }

  const rest = new REST({ version: '10' }).setToken(config.token);
  const body = clear ? [] : loadCommands().map((c) => c.data.toJSON());

  try {
    if (global) {
      await rest.put(Routes.applicationCommands(config.clientId), { body });
      console.log(`✅ ${body.length} commandes déployées GLOBALEMENT (propagation jusqu'à 1h).`);
    } else {
      if (!config.guildId) {
        console.error('❌ GUILD_ID requis pour un déploiement de serveur (ou utilise --global).');
        process.exit(1);
      }
      await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body });
      console.log(`✅ ${body.length} commandes déployées sur le serveur ${config.guildId}.`);
    }
  } catch (err) {
    console.error('❌ Échec du déploiement:', err);
    process.exit(1);
  }
}

main();
