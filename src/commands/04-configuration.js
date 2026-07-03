const { AttachmentBuilder } = require('discord.js');
const { cmd, P, setChannel, setRole, setNumber, setText } = require('../lib/command');
const store = require('../lib/store');
const E = require('../lib/embeds');

const CAT = 'Configuration';
const perm = P.ManageGuild;

module.exports = [
  cmd({ name: 'langue-set', description: 'Définit la langue du bot', category: CAT, permission: perm,
    options: [{ type: 'string', name: 'valeur', description: 'Langue', required: true, choices: ['fr', 'en', 'es', 'de'] }],
    execute: setText('langue', 'Langue') }),

  cmd({ name: 'prefix-set', description: 'Définit le préfixe des commandes texte', category: CAT, permission: perm,
    options: [{ type: 'string', name: 'valeur', description: 'Nouveau préfixe', required: true }],
    execute: setText('prefix', 'Préfixe') }),

  cmd({ name: 'xp-taux', description: 'Définit le taux d\'XP par message', category: CAT, permission: perm,
    options: [{ type: 'int', name: 'valeur', description: 'XP par message', required: true, min: 1, max: 100 }],
    execute: setNumber('xp_rate', 'Taux d\'XP') }),

  cmd({ name: 'xp-toggle', description: 'Active/désactive le système d\'XP', category: CAT, permission: perm,
    execute: async (interaction) => {
      const cur = store.get(interaction.guildId, 'xp_enabled', true);
      store.set(interaction.guildId, 'xp_enabled', !cur);
      await interaction.reply({ embeds: [E.success('Système XP', `XP : **${!cur ? 'ON' : 'OFF'}**`)] });
    } }),

  cmd({ name: 'modrole-add', description: 'Ajoute un rôle modérateur', category: CAT, permission: perm,
    options: [{ type: 'role', name: 'role', description: 'Rôle modérateur', required: true }],
    execute: async (interaction) => {
      store.pushUnique(interaction.guildId, 'mod_roles', interaction.options.getRole('role', true).id);
      await interaction.reply({ embeds: [E.success('Rôle mod ajouté', 'Rôle modérateur enregistré.')] });
    } }),

  cmd({ name: 'modrole-remove', description: 'Retire un rôle modérateur', category: CAT, permission: perm,
    options: [{ type: 'role', name: 'role', description: 'Rôle', required: true }],
    execute: async (interaction) => {
      store.pull(interaction.guildId, 'mod_roles', interaction.options.getRole('role', true).id);
      await interaction.reply({ embeds: [E.success('Rôle mod retiré', 'Rôle modérateur retiré.')] });
    } }),

  cmd({ name: 'adminrole-add', description: 'Ajoute un rôle administrateur', category: CAT, permission: perm,
    options: [{ type: 'role', name: 'role', description: 'Rôle admin', required: true }],
    execute: async (interaction) => {
      store.pushUnique(interaction.guildId, 'admin_roles', interaction.options.getRole('role', true).id);
      await interaction.reply({ embeds: [E.success('Rôle admin ajouté', 'Rôle administrateur enregistré.')] });
    } }),

  cmd({ name: 'adminrole-remove', description: 'Retire un rôle administrateur', category: CAT, permission: perm,
    options: [{ type: 'role', name: 'role', description: 'Rôle', required: true }],
    execute: async (interaction) => {
      store.pull(interaction.guildId, 'admin_roles', interaction.options.getRole('role', true).id);
      await interaction.reply({ embeds: [E.success('Rôle admin retiré', 'Rôle administrateur retiré.')] });
    } }),

  cmd({ name: 'ticket-categorie', description: 'Définit la catégorie des tickets', category: CAT, permission: perm,
    options: [{ type: 'channel', name: 'salon', description: 'Catégorie', required: true }],
    execute: setChannel('ticket_category', 'Catégorie des tickets') }),

  cmd({ name: 'ticket-toggle', description: 'Active/désactive le système de tickets', category: CAT, permission: perm,
    execute: async (interaction) => {
      const cur = store.get(interaction.guildId, 'tickets_enabled', false);
      store.set(interaction.guildId, 'tickets_enabled', !cur);
      await interaction.reply({ embeds: [E.success('Tickets', `Tickets : **${!cur ? 'ON' : 'OFF'}**`)] });
    } }),

  cmd({ name: 'ticket-role', description: 'Rôle du staff qui gère les tickets', category: CAT, permission: perm,
    options: [{ type: 'role', name: 'role', description: 'Rôle staff', required: true }],
    execute: setRole('ticket_role', 'Rôle staff tickets') }),

  cmd({ name: 'config-export', description: 'Exporte la configuration du serveur', category: CAT, permission: perm,
    execute: async (interaction) => {
      const data = JSON.stringify(store.getGuild(interaction.guildId), null, 2);
      const file = new AttachmentBuilder(Buffer.from(data), { name: `config-${interaction.guildId}.json` });
      await interaction.reply({ embeds: [E.info('Configuration exportée', 'Fichier JSON en pièce jointe.')], files: [file] });
    } }),

  cmd({ name: 'config-import', description: 'Importe une configuration (JSON)', category: CAT, permission: perm,
    options: [{ type: 'string', name: 'valeur', description: 'JSON de configuration', required: true }],
    execute: async (interaction) => {
      try {
        const obj = JSON.parse(interaction.options.getString('valeur', true));
        for (const [k, v] of Object.entries(obj)) store.set(interaction.guildId, k, v);
        await interaction.reply({ embeds: [E.success('Config importée', `${Object.keys(obj).length} clés importées.`)] });
      } catch {
        await interaction.reply({ embeds: [E.error('JSON invalide', 'Impossible de parser le JSON fourni.')], ephemeral: true });
      }
    } }),

  cmd({ name: 'config-reset', description: 'Réinitialise la configuration du serveur', category: CAT, permission: P.Administrator,
    execute: async (interaction) => {
      const all = store.readAll();
      delete all[interaction.guildId];
      store.writeAll(all);
      await interaction.reply({ embeds: [E.warning('Config réinitialisée', 'Toute la configuration a été effacée.')] });
    } }),

  cmd({ name: 'config-show', description: 'Affiche la configuration du serveur', category: CAT, permission: perm,
    execute: async (interaction) => {
      const g = store.getGuild(interaction.guildId);
      const keys = Object.keys(g);
      await interaction.reply({ embeds: [E.info('⚙️ Configuration', keys.length ? keys.map((k) => `• \`${k}\``).join('\n').slice(0, 3900) : '*aucune configuration*')], ephemeral: true });
    } }),

  cmd({ name: 'welcome-channel', description: 'Salon de bienvenue', category: CAT, permission: perm,
    options: [{ type: 'channel', name: 'salon', description: 'Salon', required: true }],
    execute: setChannel('welcome_channel', 'Salon de bienvenue') }),

  cmd({ name: 'welcome-message', description: 'Message de bienvenue ({user}, {server})', category: CAT, permission: perm,
    options: [{ type: 'string', name: 'valeur', description: 'Message', required: true }],
    execute: setText('welcome_message', 'Message de bienvenue') }),

  cmd({ name: 'leave-channel', description: 'Salon des départs', category: CAT, permission: perm,
    options: [{ type: 'channel', name: 'salon', description: 'Salon', required: true }],
    execute: setChannel('leave_channel', 'Salon des départs') }),

  cmd({ name: 'leave-message', description: 'Message de départ ({user}, {server})', category: CAT, permission: perm,
    options: [{ type: 'string', name: 'valeur', description: 'Message', required: true }],
    execute: setText('leave_message', 'Message de départ') }),

  cmd({ name: 'autorole-set', description: 'Rôle attribué automatiquement à l\'arrivée', category: CAT, permission: perm,
    options: [{ type: 'role', name: 'role', description: 'Rôle', required: true }],
    execute: setRole('autorole', 'Autorole') }),

  cmd({ name: 'levelup-channel', description: 'Salon des annonces de niveau', category: CAT, permission: perm,
    options: [{ type: 'channel', name: 'salon', description: 'Salon', required: true }],
    execute: setChannel('levelup_channel', 'Salon des niveaux') }),

  cmd({ name: 'levelup-message', description: 'Message de montée de niveau', category: CAT, permission: perm,
    options: [{ type: 'string', name: 'valeur', description: 'Message', required: true }],
    execute: setText('levelup_message', 'Message de niveau') }),

  cmd({ name: 'mute-role', description: 'Rôle utilisé pour le mute', category: CAT, permission: perm,
    options: [{ type: 'role', name: 'role', description: 'Rôle mute', required: true }],
    execute: setRole('mute_role', 'Rôle mute') }),

  cmd({ name: 'timezone-set', description: 'Fuseau horaire du serveur', category: CAT, permission: perm,
    options: [{ type: 'string', name: 'valeur', description: 'Ex: Europe/Paris', required: true }],
    execute: setText('timezone', 'Fuseau horaire') }),

  cmd({ name: 'dashboard', description: 'Résumé de la configuration principale', category: CAT, permission: perm,
    execute: async (interaction) => {
      const g = interaction.guildId;
      const b = (k) => (store.get(g, k, false) ? '🟢' : '🔴');
      const desc = [
        `${b('antiraid')} Anti-raid`,
        `${b('antispam')} Anti-spam`,
        `${b('xp_enabled')} Système XP`,
        `${b('tickets_enabled')} Tickets`,
        `Salon bienvenue : ${store.get(g, 'welcome_channel') ? `<#${store.get(g, 'welcome_channel')}>` : '*non défini*'}`,
        `Autorole : ${store.get(g, 'autorole') ? `<@&${store.get(g, 'autorole')}>` : '*non défini*'}`,
      ].join('\n');
      await interaction.reply({ embeds: [E.info('📋 Dashboard', desc)] });
    } }),
];
