const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const store = require('./store');
const E = require('./embeds');

/**
 * Ajoute une option a un SlashCommandBuilder a partir d'une spec simple.
 */
function addOption(builder, opt) {
  const apply = (o) => {
    o.setName(opt.name).setDescription(opt.description || opt.name);
    if (opt.required) o.setRequired(true);
    if (opt.choices && o.addChoices) {
      o.addChoices(...opt.choices.map((c) => ({ name: String(c), value: String(c) })));
    }
    if (opt.min != null && o.setMinValue) o.setMinValue(opt.min);
    if (opt.max != null && o.setMaxValue) o.setMaxValue(opt.max);
    return o;
  };
  switch (opt.type) {
    case 'string':
      return builder.addStringOption(apply);
    case 'int':
      return builder.addIntegerOption(apply);
    case 'number':
      return builder.addNumberOption(apply);
    case 'bool':
      return builder.addBooleanOption(apply);
    case 'user':
      return builder.addUserOption(apply);
    case 'role':
      return builder.addRoleOption(apply);
    case 'channel':
      return builder.addChannelOption(apply);
    case 'mentionable':
      return builder.addMentionableOption(apply);
    case 'attachment':
      return builder.addAttachmentOption(apply);
    default:
      return builder;
  }
}

/**
 * Construit un objet commande complet.
 * @param {object} spec
 * @param {string} spec.name
 * @param {string} spec.description
 * @param {string} spec.category
 * @param {Array}  [spec.options]
 * @param {bigint} [spec.permission] PermissionFlagsBits requis
 * @param {boolean}[spec.ownerOnly]
 * @param {Function} spec.execute (interaction) => Promise
 */
function cmd(spec) {
  const builder = new SlashCommandBuilder()
    .setName(spec.name)
    .setDescription((spec.description || spec.name).slice(0, 100));

  if (spec.permission != null) builder.setDefaultMemberPermissions(spec.permission);
  if (Array.isArray(spec.options)) {
    for (const opt of spec.options) addOption(builder, opt);
  }

  return {
    data: builder,
    category: spec.category,
    ownerOnly: Boolean(spec.ownerOnly),
    permission: spec.permission || null,
    execute: spec.execute,
  };
}

/* ------------------------------------------------------------------ *
 * Handlers generiques reutilisables (persistance via le store JSON). *
 * ------------------------------------------------------------------ */

const P = PermissionFlagsBits;

/** Active/desactive un booleen de config. */
function toggle(key, value, label) {
  return async (interaction) => {
    store.set(interaction.guildId, key, value);
    await interaction.reply({
      embeds: [
        E.success(
          `${label} ${value ? 'activé' : 'désactivé'}`,
          `Le paramètre \`${key}\` est maintenant **${value ? 'ON' : 'OFF'}**.`,
        ),
      ],
    });
  };
}

/** Enregistre un salon depuis l'option "salon". */
function setChannel(key, label, optName = 'salon') {
  return async (interaction) => {
    const channel = interaction.options.getChannel(optName, true);
    store.set(interaction.guildId, key, channel.id);
    await interaction.reply({
      embeds: [E.success(`${label} défini`, `Salon configuré : <#${channel.id}>`)],
    });
  };
}

/** Enregistre un role depuis l'option "role". */
function setRole(key, label, optName = 'role') {
  return async (interaction) => {
    const role = interaction.options.getRole(optName, true);
    store.set(interaction.guildId, key, role.id);
    await interaction.reply({
      embeds: [E.success(`${label} défini`, `Rôle configuré : <@&${role.id}>`)],
    });
  };
}

/** Enregistre un nombre depuis l'option "valeur". */
function setNumber(key, label, optName = 'valeur') {
  return async (interaction) => {
    const value = interaction.options.getInteger(optName, true);
    store.set(interaction.guildId, key, value);
    await interaction.reply({
      embeds: [E.success(`${label} mis à jour`, `\`${key}\` = **${value}**`)],
    });
  };
}

/** Enregistre une chaine depuis l'option "valeur". */
function setText(key, label, optName = 'valeur') {
  return async (interaction) => {
    const value = interaction.options.getString(optName, true);
    store.set(interaction.guildId, key, value);
    await interaction.reply({
      embeds: [E.success(`${label} mis à jour`, `\`${key}\` = **${value}**`)],
    });
  };
}

/** Ajoute une valeur (user/role/channel/string) a une liste de config. */
function addToList(key, label, optType = 'user', optName = 'cible') {
  return async (interaction) => {
    let value;
    if (optType === 'user') value = interaction.options.getUser(optName, true).id;
    else if (optType === 'role') value = interaction.options.getRole(optName, true).id;
    else if (optType === 'channel') value = interaction.options.getChannel(optName, true).id;
    else value = interaction.options.getString(optName, true);
    store.pushUnique(interaction.guildId, key, value);
    const list = store.get(interaction.guildId, key, []);
    await interaction.reply({
      embeds: [E.success(`Ajouté à ${label}`, `La liste \`${key}\` contient ${list.length} élément(s).`)],
    });
  };
}

/** Retire une valeur d'une liste de config. */
function removeFromList(key, label, optType = 'user', optName = 'cible') {
  return async (interaction) => {
    let value;
    if (optType === 'user') value = interaction.options.getUser(optName, true).id;
    else if (optType === 'role') value = interaction.options.getRole(optName, true).id;
    else if (optType === 'channel') value = interaction.options.getChannel(optName, true).id;
    else value = interaction.options.getString(optName, true);
    store.pull(interaction.guildId, key, value);
    const list = store.get(interaction.guildId, key, []);
    await interaction.reply({
      embeds: [E.warning(`Retiré de ${label}`, `La liste \`${key}\` contient ${list.length} élément(s).`)],
    });
  };
}

/** Affiche la valeur courante d'une cle de config. */
function show(key, label) {
  return async (interaction) => {
    const value = store.get(interaction.guildId, key, null);
    let display;
    if (value === null || value === undefined) display = '*non défini*';
    else if (Array.isArray(value)) display = value.length ? value.map((v) => `\`${v}\``).join(', ') : '*vide*';
    else if (typeof value === 'boolean') display = value ? 'ON' : 'OFF';
    else display = `\`${value}\``;
    await interaction.reply({ embeds: [E.info(`${label}`, `${display}`)] });
  };
}

module.exports = {
  cmd,
  addOption,
  P,
  toggle,
  setChannel,
  setRole,
  setNumber,
  setText,
  addToList,
  removeFromList,
  show,
};
