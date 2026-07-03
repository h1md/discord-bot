const { AttachmentBuilder } = require('discord.js');
const { cmd, P, setChannel, toggle, addToList, removeFromList } = require('../lib/command');
const store = require('../lib/store');
const E = require('../lib/embeds');

const CAT = 'Logs';
const perm = P.ManageGuild;

/** Commande "log-X-set" qui enregistre un salon de logs. */
function logChannel(base, key, label) {
  return cmd({ name: `log-${base}-set`, description: `Définit le salon des logs ${label}`, category: CAT, permission: perm,
    options: [{ type: 'channel', name: 'salon', description: 'Salon de logs', required: true }],
    execute: setChannel(key, `Logs ${label}`) });
}

/** Commande "log-X-toggle" qui active/desactive un type de log. */
function logToggle(base, key, label) {
  return cmd({ name: `log-${base}-toggle`, description: `Active/désactive les logs ${label}`, category: CAT, permission: perm,
    execute: async (interaction) => {
      const cur = store.get(interaction.guildId, key, false);
      store.set(interaction.guildId, key, !cur);
      await interaction.reply({ embeds: [E.success(`Logs ${label}`, `État : **${!cur ? 'ON' : 'OFF'}**`)] });
    } });
}

module.exports = [
  logChannel('mod', 'log_mod', 'de modération'),
  logChannel('message', 'log_message', 'des messages'),
  logChannel('member', 'log_member', 'des membres'),
  logChannel('voice', 'log_voice', 'vocaux'),
  logChannel('role', 'log_role', 'des rôles'),
  logChannel('channel', 'log_channel', 'des salons'),
  logChannel('server', 'log_server', 'du serveur'),
  logChannel('invite', 'log_invite', 'des invitations'),
  logChannel('ban', 'log_ban', 'des bannissements'),
  logChannel('kick', 'log_kick', 'des expulsions'),
  logChannel('join', 'log_join', 'des arrivées'),
  logChannel('leave', 'log_leave', 'des départs'),
  logChannel('emoji', 'log_emoji', 'des emojis'),
  logChannel('nickname', 'log_nickname', 'des pseudos'),
  logChannel('boost', 'log_boost', 'des boosts'),
  logChannel('thread', 'log_thread', 'des fils'),
  logChannel('reaction', 'log_reaction', 'des réactions'),

  logToggle('mod', 'log_mod_on', 'de modération'),
  logToggle('message', 'log_message_on', 'des messages'),
  logToggle('member', 'log_member_on', 'des membres'),
  logToggle('voice', 'log_voice_on', 'vocaux'),
  logToggle('role', 'log_role_on', 'des rôles'),
  logToggle('invite', 'log_invite_on', 'des invitations'),

  cmd({ name: 'log-all-on', description: 'Active tous les types de logs', category: CAT, permission: perm,
    execute: async (interaction) => {
      ['log_mod_on', 'log_message_on', 'log_member_on', 'log_voice_on', 'log_role_on', 'log_invite_on'].forEach((k) => store.set(interaction.guildId, k, true));
      await interaction.reply({ embeds: [E.success('Logs', 'Tous les logs sont activés.')] });
    } }),

  cmd({ name: 'log-all-off', description: 'Désactive tous les types de logs', category: CAT, permission: perm,
    execute: async (interaction) => {
      ['log_mod_on', 'log_message_on', 'log_member_on', 'log_voice_on', 'log_role_on', 'log_invite_on'].forEach((k) => store.set(interaction.guildId, k, false));
      await interaction.reply({ embeds: [E.warning('Logs', 'Tous les logs sont désactivés.')] });
    } }),

  cmd({ name: 'logs-recent', description: 'Affiche les événements récents enregistrés', category: CAT, permission: perm,
    execute: async (interaction) => {
      const logs = store.get(interaction.guildId, 'log_history', []) || [];
      const lines = logs.slice(-10).reverse().map((l) => `• ${l}`).join('\n');
      await interaction.reply({ embeds: [E.info('🕑 Logs récents', lines || '*aucun événement*')], ephemeral: true });
    } }),

  cmd({ name: 'logs-export', description: 'Exporte l\'historique des logs', category: CAT, permission: perm,
    execute: async (interaction) => {
      const logs = store.get(interaction.guildId, 'log_history', []) || [];
      const file = new AttachmentBuilder(Buffer.from(logs.join('\n') || 'vide'), { name: `logs-${interaction.guildId}.txt` });
      await interaction.reply({ embeds: [E.info('Logs exportés', 'Fichier en pièce jointe.')], files: [file] });
    } }),

  cmd({ name: 'log-test', description: 'Envoie un log de test dans le salon configuré', category: CAT, permission: perm,
    execute: async (interaction) => {
      const id = store.get(interaction.guildId, 'log_mod');
      const ch = id && interaction.guild.channels.cache.get(id);
      if (ch) await ch.send({ embeds: [E.info('🔧 Log de test', `Déclenché par ${interaction.user.tag}.`)] }).catch(() => {});
      await interaction.reply({ embeds: [E.success('Test envoyé', ch ? `Log envoyé dans <#${ch.id}>.` : 'Aucun salon de logs mod défini (`/log-mod-set`).')], ephemeral: true });
    } }),

  cmd({ name: 'log-ignore-channel', description: 'Ignore un salon dans les logs', category: CAT, permission: perm,
    options: [{ type: 'channel', name: 'salon', description: 'Salon à ignorer', required: true }],
    execute: addToList('log_ignored_channels', 'les salons ignorés', 'channel', 'salon') }),

  cmd({ name: 'log-unignore-channel', description: 'Ne plus ignorer un salon', category: CAT, permission: perm,
    options: [{ type: 'channel', name: 'salon', description: 'Salon', required: true }],
    execute: removeFromList('log_ignored_channels', 'les salons ignorés', 'channel', 'salon') }),

  cmd({ name: 'log-ignore-user', description: 'Ignore un utilisateur dans les logs', category: CAT, permission: perm,
    options: [{ type: 'user', name: 'cible', description: 'Utilisateur', required: true }],
    execute: addToList('log_ignored_users', 'les utilisateurs ignorés', 'user') }),

  cmd({ name: 'log-unignore-user', description: 'Ne plus ignorer un utilisateur', category: CAT, permission: perm,
    options: [{ type: 'user', name: 'cible', description: 'Utilisateur', required: true }],
    execute: removeFromList('log_ignored_users', 'les utilisateurs ignorés', 'user') }),

  cmd({ name: 'logs-search', description: 'Recherche dans l\'historique des logs', category: CAT, permission: perm,
    options: [{ type: 'string', name: 'terme', description: 'Terme à rechercher', required: true }],
    execute: async (interaction) => {
      const term = interaction.options.getString('terme', true).toLowerCase();
      const logs = (store.get(interaction.guildId, 'log_history', []) || []).filter((l) => l.toLowerCase().includes(term));
      await interaction.reply({ embeds: [E.info(`🔎 Résultats (${logs.length})`, logs.slice(-10).map((l) => `• ${l}`).join('\n') || '*aucun résultat*')], ephemeral: true });
    } }),

  cmd({ name: 'logs-clear', description: 'Efface l\'historique des logs enregistré', category: CAT, permission: P.Administrator,
    execute: async (interaction) => {
      store.set(interaction.guildId, 'log_history', []);
      await interaction.reply({ embeds: [E.warning('Logs effacés', 'L\'historique interne des logs a été vidé.')] });
    } }),

  cmd({ name: 'log-webhook-set', description: 'Définit une URL de webhook pour les logs', category: CAT, permission: perm,
    options: [{ type: 'string', name: 'valeur', description: 'URL du webhook', required: true }],
    execute: async (interaction) => {
      store.set(interaction.guildId, 'log_webhook', interaction.options.getString('valeur', true));
      await interaction.reply({ embeds: [E.success('Webhook défini', 'Webhook de logs enregistré.')], ephemeral: true });
    } }),

  cmd({ name: 'logs-status', description: 'Affiche la configuration des logs', category: CAT, permission: perm,
    execute: async (interaction) => {
      const g = interaction.guildId;
      const line = (k, label) => `${store.get(g, k, false) ? '🟢' : '🔴'} ${label}`;
      const desc = [
        line('log_mod_on', 'Modération'), line('log_message_on', 'Messages'), line('log_member_on', 'Membres'),
        line('log_voice_on', 'Vocaux'), line('log_role_on', 'Rôles'), line('log_invite_on', 'Invitations'),
      ].join('\n');
      await interaction.reply({ embeds: [E.info('📑 État des logs', desc)], ephemeral: true });
    } }),
];
