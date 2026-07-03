const { loadCommands } = require('../src/lib/loader');

const EXPECTED = {
  'Anti-Raid': 61,
  'Owner Bot': 19,
  'Gestion Serveur': 25,
  'Configuration': 25,
  'Logs': 36,
  'Paramètres Mod': 30,
  'Modération': 38,
  'Admin': 8,
  'Info': 7,
  'Utilitaires': 5,
};

const commands = loadCommands();
const counts = {};
for (const c of commands) counts[c.category] = (counts[c.category] || 0) + 1;

const total = commands.length;
const check = process.argv.includes('--check');
let ok = true;

console.log('Commandes par catégorie :');
for (const [cat, expected] of Object.entries(EXPECTED)) {
  const got = counts[cat] || 0;
  const mark = got === expected ? '✓' : '✗';
  if (got !== expected) ok = false;
  console.log(`  ${mark} ${cat.padEnd(18)} ${got} / ${expected}`);
}

// Categories inattendues
for (const cat of Object.keys(counts)) {
  if (!(cat in EXPECTED)) { ok = false; console.log(`  ✗ Catégorie inconnue: ${cat} (${counts[cat]})`); }
}

const expectedTotal = Object.values(EXPECTED).reduce((a, b) => a + b, 0);
console.log(`\nTotal : ${total} / ${expectedTotal}`);

if (check) {
  if (!ok || total !== expectedTotal) {
    console.error('\n❌ Les compteurs ne correspondent pas.');
    process.exit(1);
  }
  console.log('✅ Tous les compteurs correspondent.');
}
