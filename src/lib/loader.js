const fs = require('fs');
const path = require('path');

const COMMANDS_DIR = path.join(__dirname, '..', 'commands');

/**
 * Charge tous les fichiers de src/commands. Chaque fichier exporte soit un
 * objet commande, soit un tableau d'objets commande. Renvoie un tableau plat.
 */
function loadCommands() {
  const commands = [];
  const seen = new Set();

  const files = fs
    .readdirSync(COMMANDS_DIR)
    .filter((f) => f.endsWith('.js'))
    .sort();

  for (const file of files) {
    const mod = require(path.join(COMMANDS_DIR, file));
    const list = Array.isArray(mod) ? mod : [mod];
    for (const command of list) {
      if (!command || !command.data || typeof command.execute !== 'function') {
        throw new Error(`Commande invalide dans ${file}: ${JSON.stringify(command?.data?.name)}`);
      }
      const name = command.data.name;
      if (seen.has(name)) {
        throw new Error(`Nom de commande en double: /${name} (fichier ${file})`);
      }
      seen.add(name);
      commands.push(command);
    }
  }

  return commands;
}

module.exports = { loadCommands, COMMANDS_DIR };
