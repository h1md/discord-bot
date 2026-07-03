const { REST, Routes } = require('discord.js');
const config = require('./config');
const { loadCommands } = require('./lib/loader');

// Discord limite le nombre de commandes slash par serveur (~100).
// Toutes les autres commandes restent utilisables via le préfixe texte (ex: +ban).
const SLASH_LIMIT = parseInt(process.env.SLASH_LIMIT || '100', 10);

// Ordre de priorité : les catégories les plus utiles sont enregistrées en slash en premier.
const PRIORITY = ['Modération', 'Utilitaires', 'Info', 'Admin', 'Gestion Serveur', 'Configuration', 'Anti-Raid', 'Paramètres Mod', 'Logs', 'Owner Bot'];

function selectForSlash(commands) {
  const sorted = [...commands].sort((a, b) => {
    const pa = PRIORITY.indexOf(a.category);
    const pb = PRIORITY.indexOf(b.category);
    return (pa === -1 ? 999 : pa) - (pb === -1 ? 999 : pb);
  });
  return sorted.slice(0, SLASH_LIMIT);
}

async function main() {
  const args = process.argv.slice(2);
  const global = args.includes('--global');
  const clear = args.includes('--clear');

  if (!config.token || !config.clientId) {
    console.error('❌ DISCORD_TOKEN et CLIENT_ID sont requis dans .env.');
    process.exitCode = 1;
    return;
  }

  const rest = new REST({ version: '10' }).setToken(config.token);
  const all = loadCommands();
  const selected = selectForSlash(all);
  const body = clear ? [] : selected.map((c) => c.data.toJSON());

  if (!clear && all.length > body.length) {
    console.log(`ℹ️  ${all.length} commandes au total, mais Discord limite les slash à ${SLASH_LIMIT} par serveur.`);
    console.log(`ℹ️  ${body.length} enregistrées en slash (/). Les ${all.length - body.length} autres restent utilisables via le préfixe texte (ex: +ban). Tape +help pour tout voir.`);
  }

  try {
    if (global) {
      await rest.put(Routes.applicationCommands(config.clientId), { body });
      console.log(`✅ ${body.length} commandes slash déployées GLOBALEMENT (propagation jusqu'à 1h).`);
    } else {
      if (!config.guildId) {
        console.error('❌ GUILD_ID requis pour un déploiement de serveur (ou utilise --global).');
        process.exitCode = 1;
        return;
      }
      await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body });
      console.log(`✅ ${body.length} commandes slash déployées sur le serveur ${config.guildId}.`);
    }
  } catch (err) {
    console.error('❌ Échec du déploiement:', err?.rawError ? JSON.stringify(err.rawError, null, 2) : err);
    process.exitCode = 1;
  }
}

main();
