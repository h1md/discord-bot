const { ChannelType, PermissionsBitField } = require('discord.js');
const { cmd, P } = require('../lib/command');
const E = require('../lib/embeds');

const CAT = 'Gestion Serveur';

module.exports = [
  cmd({ name: 'salon-create', description: 'Crée un salon textuel', category: CAT, permission: P.ManageChannels,
    options: [{ type: 'string', name: 'nom', description: 'Nom du salon', required: true }],
    execute: async (interaction) => {
      const ch = await interaction.guild.channels.create({ name: interaction.options.getString('nom', true), type: ChannelType.GuildText });
      await interaction.reply({ embeds: [E.success('Salon créé', `<#${ch.id}> a été créé.`)] });
    } }),

  cmd({ name: 'salon-delete', description: 'Supprime un salon', category: CAT, permission: P.ManageChannels,
    options: [{ type: 'channel', name: 'salon', description: 'Salon à supprimer', required: true }],
    execute: async (interaction) => {
      const ch = interaction.options.getChannel('salon', true);
      const name = ch.name;
      await ch.delete();
      await interaction.reply({ embeds: [E.success('Salon supprimé', `Le salon **${name}** a été supprimé.`)] });
    } }),

  cmd({ name: 'salon-rename', description: 'Renomme un salon', category: CAT, permission: P.ManageChannels,
    options: [
      { type: 'channel', name: 'salon', description: 'Salon', required: true },
      { type: 'string', name: 'nom', description: 'Nouveau nom', required: true },
    ],
    execute: async (interaction) => {
      const ch = interaction.options.getChannel('salon', true);
      await ch.setName(interaction.options.getString('nom', true));
      await interaction.reply({ embeds: [E.success('Salon renommé', `Le salon est maintenant <#${ch.id}>.`)] });
    } }),

  cmd({ name: 'salon-nuke', description: 'Clone et recrée un salon (efface tout)', category: CAT, permission: P.ManageChannels,
    options: [{ type: 'channel', name: 'salon', description: 'Salon à nuke (défaut: courant)' }],
    execute: async (interaction) => {
      const ch = interaction.options.getChannel('salon') || interaction.channel;
      const clone = await ch.clone();
      const pos = ch.position;
      await ch.delete();
      await clone.setPosition(pos);
      await clone.send({ embeds: [E.success('Salon nuke', 'Salon recréé, messages effacés. 💥')] });
      if (interaction.channelId !== ch.id) {
        await interaction.reply({ embeds: [E.success('Salon nuke', `<#${clone.id}> a été recréé.`)] });
      }
    } }),

  cmd({ name: 'salon-clone', description: 'Clone un salon', category: CAT, permission: P.ManageChannels,
    options: [{ type: 'channel', name: 'salon', description: 'Salon à cloner', required: true }],
    execute: async (interaction) => {
      const clone = await interaction.options.getChannel('salon', true).clone();
      await interaction.reply({ embeds: [E.success('Salon cloné', `<#${clone.id}> a été créé.`)] });
    } }),

  cmd({ name: 'salon-topic', description: 'Définit le sujet d\'un salon', category: CAT, permission: P.ManageChannels,
    options: [
      { type: 'channel', name: 'salon', description: 'Salon', required: true },
      { type: 'string', name: 'sujet', description: 'Nouveau sujet', required: true },
    ],
    execute: async (interaction) => {
      await interaction.options.getChannel('salon', true).setTopic(interaction.options.getString('sujet', true));
      await interaction.reply({ embeds: [E.success('Sujet modifié', 'Le sujet du salon a été mis à jour.')] });
    } }),

  cmd({ name: 'salon-slowmode', description: 'Définit le mode lent d\'un salon', category: CAT, permission: P.ManageChannels,
    options: [
      { type: 'channel', name: 'salon', description: 'Salon', required: true },
      { type: 'int', name: 'secondes', description: 'Délai en secondes (0 = off)', required: true, min: 0, max: 21600 },
    ],
    execute: async (interaction) => {
      const s = interaction.options.getInteger('secondes', true);
      await interaction.options.getChannel('salon', true).setRateLimitPerUser(s);
      await interaction.reply({ embeds: [E.success('Mode lent', `Délai réglé à ${s}s.`)] });
    } }),

  cmd({ name: 'salon-nsfw', description: 'Active/désactive le NSFW d\'un salon', category: CAT, permission: P.ManageChannels,
    options: [{ type: 'channel', name: 'salon', description: 'Salon', required: true }],
    execute: async (interaction) => {
      const ch = interaction.options.getChannel('salon', true);
      await ch.setNSFW(!ch.nsfw);
      await interaction.reply({ embeds: [E.success('NSFW', `NSFW : **${!ch.nsfw ? 'ON' : 'OFF'}**`)] });
    } }),

  cmd({ name: 'role-create', description: 'Crée un rôle', category: CAT, permission: P.ManageRoles,
    options: [{ type: 'string', name: 'nom', description: 'Nom du rôle', required: true }],
    execute: async (interaction) => {
      const role = await interaction.guild.roles.create({ name: interaction.options.getString('nom', true) });
      await interaction.reply({ embeds: [E.success('Rôle créé', `<@&${role.id}> a été créé.`)] });
    } }),

  cmd({ name: 'role-delete', description: 'Supprime un rôle', category: CAT, permission: P.ManageRoles,
    options: [{ type: 'role', name: 'role', description: 'Rôle à supprimer', required: true }],
    execute: async (interaction) => {
      const role = interaction.options.getRole('role', true);
      const name = role.name;
      await role.delete();
      await interaction.reply({ embeds: [E.success('Rôle supprimé', `Le rôle **${name}** a été supprimé.`)] });
    } }),

  cmd({ name: 'role-rename', description: 'Renomme un rôle', category: CAT, permission: P.ManageRoles,
    options: [
      { type: 'role', name: 'role', description: 'Rôle', required: true },
      { type: 'string', name: 'nom', description: 'Nouveau nom', required: true },
    ],
    execute: async (interaction) => {
      await interaction.options.getRole('role', true).setName(interaction.options.getString('nom', true));
      await interaction.reply({ embeds: [E.success('Rôle renommé', 'Le nom du rôle a été mis à jour.')] });
    } }),

  cmd({ name: 'role-color', description: 'Change la couleur d\'un rôle', category: CAT, permission: P.ManageRoles,
    options: [
      { type: 'role', name: 'role', description: 'Rôle', required: true },
      { type: 'string', name: 'couleur', description: 'Couleur hex (ex: #ff0000)', required: true },
    ],
    execute: async (interaction) => {
      await interaction.options.getRole('role', true).setColor(interaction.options.getString('couleur', true));
      await interaction.reply({ embeds: [E.success('Couleur modifiée', 'La couleur du rôle a été mise à jour.')] });
    } }),

  cmd({ name: 'role-give', description: 'Attribue un rôle à un membre', category: CAT, permission: P.ManageRoles,
    options: [
      { type: 'user', name: 'cible', description: 'Membre', required: true },
      { type: 'role', name: 'role', description: 'Rôle', required: true },
    ],
    execute: async (interaction) => {
      const member = await interaction.guild.members.fetch(interaction.options.getUser('cible', true).id);
      await member.roles.add(interaction.options.getRole('role', true).id);
      await interaction.reply({ embeds: [E.success('Rôle attribué', `Rôle ajouté à ${member.user.tag}.`)] });
    } }),

  cmd({ name: 'role-remove', description: 'Retire un rôle à un membre', category: CAT, permission: P.ManageRoles,
    options: [
      { type: 'user', name: 'cible', description: 'Membre', required: true },
      { type: 'role', name: 'role', description: 'Rôle', required: true },
    ],
    execute: async (interaction) => {
      const member = await interaction.guild.members.fetch(interaction.options.getUser('cible', true).id);
      await member.roles.remove(interaction.options.getRole('role', true).id);
      await interaction.reply({ embeds: [E.success('Rôle retiré', `Rôle retiré à ${member.user.tag}.`)] });
    } }),

  cmd({ name: 'role-hoist', description: 'Affiche/masque un rôle séparément', category: CAT, permission: P.ManageRoles,
    options: [{ type: 'role', name: 'role', description: 'Rôle', required: true }],
    execute: async (interaction) => {
      const role = interaction.options.getRole('role', true);
      await role.setHoist(!role.hoist);
      await interaction.reply({ embeds: [E.success('Hoist', `Affichage séparé : **${!role.hoist ? 'ON' : 'OFF'}**`)] });
    } }),

  cmd({ name: 'voice-move', description: 'Déplace un membre dans un salon vocal', category: CAT, permission: P.MoveMembers,
    options: [
      { type: 'user', name: 'cible', description: 'Membre', required: true },
      { type: 'channel', name: 'salon', description: 'Salon vocal', required: true },
    ],
    execute: async (interaction) => {
      const member = await interaction.guild.members.fetch(interaction.options.getUser('cible', true).id);
      await member.voice.setChannel(interaction.options.getChannel('salon', true).id);
      await interaction.reply({ embeds: [E.success('Déplacé', `${member.user.tag} a été déplacé.`)] });
    } }),

  cmd({ name: 'voice-kick', description: 'Déconnecte un membre du vocal', category: CAT, permission: P.MoveMembers,
    options: [{ type: 'user', name: 'cible', description: 'Membre', required: true }],
    execute: async (interaction) => {
      const member = await interaction.guild.members.fetch(interaction.options.getUser('cible', true).id);
      await member.voice.disconnect();
      await interaction.reply({ embeds: [E.success('Déconnecté', `${member.user.tag} a été déconnecté du vocal.`)] });
    } }),

  cmd({ name: 'voice-mute', description: 'Rend muet en vocal', category: CAT, permission: P.MuteMembers,
    options: [{ type: 'user', name: 'cible', description: 'Membre', required: true }],
    execute: async (interaction) => {
      const member = await interaction.guild.members.fetch(interaction.options.getUser('cible', true).id);
      await member.voice.setMute(true);
      await interaction.reply({ embeds: [E.success('Muet', `${member.user.tag} est muet en vocal.`)] });
    } }),

  cmd({ name: 'voice-unmute', description: 'Rend la parole en vocal', category: CAT, permission: P.MuteMembers,
    options: [{ type: 'user', name: 'cible', description: 'Membre', required: true }],
    execute: async (interaction) => {
      const member = await interaction.guild.members.fetch(interaction.options.getUser('cible', true).id);
      await member.voice.setMute(false);
      await interaction.reply({ embeds: [E.success('Démuet', `${member.user.tag} peut à nouveau parler.`)] });
    } }),

  cmd({ name: 'category-create', description: 'Crée une catégorie', category: CAT, permission: P.ManageChannels,
    options: [{ type: 'string', name: 'nom', description: 'Nom de la catégorie', required: true }],
    execute: async (interaction) => {
      const cat = await interaction.guild.channels.create({ name: interaction.options.getString('nom', true), type: ChannelType.GuildCategory });
      await interaction.reply({ embeds: [E.success('Catégorie créée', `**${cat.name}** a été créée.`)] });
    } }),

  cmd({ name: 'category-delete', description: 'Supprime une catégorie', category: CAT, permission: P.ManageChannels,
    options: [{ type: 'channel', name: 'salon', description: 'Catégorie', required: true }],
    execute: async (interaction) => {
      const cat = interaction.options.getChannel('salon', true);
      const name = cat.name;
      await cat.delete();
      await interaction.reply({ embeds: [E.success('Catégorie supprimée', `**${name}** a été supprimée.`)] });
    } }),

  cmd({ name: 'emoji-add', description: 'Ajoute un emoji depuis une URL', category: CAT, permission: P.ManageGuildExpressions,
    options: [
      { type: 'string', name: 'nom', description: 'Nom de l\'emoji', required: true },
      { type: 'string', name: 'url', description: 'URL de l\'image', required: true },
    ],
    execute: async (interaction) => {
      const emoji = await interaction.guild.emojis.create({ attachment: interaction.options.getString('url', true), name: interaction.options.getString('nom', true) });
      await interaction.reply({ embeds: [E.success('Emoji ajouté', `${emoji} a été ajouté.`)] });
    } }),

  cmd({ name: 'emoji-delete', description: 'Supprime un emoji', category: CAT, permission: P.ManageGuildExpressions,
    options: [{ type: 'string', name: 'nom', description: 'Nom de l\'emoji', required: true }],
    execute: async (interaction) => {
      const name = interaction.options.getString('nom', true);
      const emoji = interaction.guild.emojis.cache.find((e) => e.name === name);
      if (!emoji) return interaction.reply({ embeds: [E.error('Introuvable', 'Emoji non trouvé.')], ephemeral: true });
      await emoji.delete();
      await interaction.reply({ embeds: [E.success('Emoji supprimé', `**${name}** a été supprimé.`)] });
    } }),

  cmd({ name: 'sticker-list', description: 'Liste les stickers du serveur', category: CAT, permission: P.ManageGuildExpressions,
    execute: async (interaction) => {
      const stickers = interaction.guild.stickers.cache.map((s) => `• ${s.name}`).join('\n');
      await interaction.reply({ embeds: [E.info('Stickers', stickers || '*aucun*')] });
    } }),

  cmd({ name: 'audit-log', description: 'Affiche les dernières entrées d\'audit', category: CAT, permission: P.ViewAuditLog,
    execute: async (interaction) => {
      await interaction.deferReply({ ephemeral: true });
      const logs = await interaction.guild.fetchAuditLogs({ limit: 8 });
      const lines = logs.entries.map((e) => `• **${e.action}** par ${e.executor?.tag || '?'}`).join('\n');
      await interaction.editReply({ embeds: [E.info('📜 Journal d\'audit', lines || '*vide*')] });
    } }),
];
