const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'guilds.json');

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '{}');
}

function readAll() {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8') || '{}');
  } catch {
    return {};
  }
}

function writeAll(data) {
  ensureFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

/**
 * Renvoie l'objet de configuration d'un serveur (cree si absent).
 */
function getGuild(guildId) {
  const all = readAll();
  if (!all[guildId]) all[guildId] = {};
  return all[guildId];
}

/**
 * Lit une valeur de config avec fallback.
 */
function get(guildId, key, fallback = null) {
  const g = getGuild(guildId);
  return key in g ? g[key] : fallback;
}

/**
 * Ecrit une valeur de config et persiste.
 */
function set(guildId, key, value) {
  const all = readAll();
  if (!all[guildId]) all[guildId] = {};
  all[guildId][key] = value;
  writeAll(all);
  return value;
}

/**
 * Ajoute un element unique dans un tableau de config.
 */
function pushUnique(guildId, key, value) {
  const arr = get(guildId, key, []) || [];
  if (!arr.includes(value)) arr.push(value);
  return set(guildId, key, arr);
}

/**
 * Retire un element d'un tableau de config.
 */
function pull(guildId, key, value) {
  const arr = get(guildId, key, []) || [];
  return set(guildId, key, arr.filter((v) => v !== value));
}

module.exports = { getGuild, get, set, pushUnique, pull, readAll, writeAll };
