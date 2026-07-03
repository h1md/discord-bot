const { version } = require('discord.js');
const { cmd } = require('../lib/command');
const E = require('../lib/embeds');

const CAT = 'Info';

module.exports = [
  cmd({ name: 'ping', description: 'Affiche la latence du bot', category: CAT,
    execute: async (interaction, client) => {
      await interaction.reply({ embeds: [E.info('🏓 Pong', `Latence WebSocket : **${Math.round(client.ws.ping)}ms**`)] });
    } }),

  cmd({ name: 'serverinfo', description: 'Informations sur le serveur', category: CAT,
    execute: async (interaction) => {
      const g = interaction.guild;
      const desc = [
        `Nom : **${g.name}**`,
        `ID : \`${g.id}\``,
        `Membres : **${g.memberCount}**`,
        `Salons : **${g.channels.cache.size}**`,
        `Rôles : **${g.roles.cache.size}**`,
        `Créé le : <t:${Math.floor(g.createdTimestamp / 1000)}:D>`,
      ].join('\n');
      const embed = E.info(`ℹ️ ${g.name}`, desc);
      if (g.iconURL()) embed.setThumbnail(g.iconURL());
      await interaction.reply({ embeds: [embed] });
    } }),

  cmd({ name: 'userinfo', description: 'Informations sur un utilisateur', category: CAT,
    options: [{ type: 'user', name: 'cible', description: 'Utilisateur (défaut: toi)' }],
    execute: async (interaction) => {
      const user = interaction.options.getUser('cible') || interaction.user;
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      const desc = [
        `Tag : **${user.tag}**`,
        `ID : \`${user.id}\``,
        `Compte créé : <t:${Math.floor(user.createdTimestamp / 1000)}:D>`,
        member ? `A rejoint : <t:${Math.floor(member.joinedTimestamp / 1000)}:D>` : '',
        member ? `Rôles : **${member.roles.cache.size - 1}**` : '',
      ].filter(Boolean).join('\n');
      const embed = E.info(`👤 ${user.username}`, desc).setThumbnail(user.displayAvatarURL());
      await interaction.reply({ embeds: [embed] });
    } }),

  cmd({ name: 'roleinfo', description: 'Informations sur un rôle', category: CAT,
    options: [{ type: 'role', name: 'role', description: 'Rôle', required: true }],
    execute: async (interaction) => {
      const r = interaction.options.getRole('role', true);
      const desc = [
        `Nom : **${r.name}**`,
        `ID : \`${r.id}\``,
        `Couleur : \`${r.hexColor}\``,
        `Membres : **${r.members.size}**`,
        `Mentionnable : **${r.mentionable ? 'oui' : 'non'}**`,
      ].join('\n');
      await interaction.reply({ embeds: [E.info(`🎭 ${r.name}`, desc)] });
    } }),

  cmd({ name: 'channelinfo', description: 'Informations sur un salon', category: CAT,
    options: [{ type: 'channel', name: 'salon', description: 'Salon (défaut: courant)' }],
    execute: async (interaction) => {
      const ch = interaction.options.getChannel('salon') || interaction.channel;
      const desc = [
        `Nom : **${ch.name}**`,
        `ID : \`${ch.id}\``,
        `Type : **${ch.type}**`,
        `Créé le : <t:${Math.floor(ch.createdTimestamp / 1000)}:D>`,
      ].join('\n');
      await interaction.reply({ embeds: [E.info(`💬 ${ch.name}`, desc)] });
    } }),

  cmd({ name: 'avatar', description: 'Affiche l\'avatar d\'un utilisateur', category: CAT,
    options: [{ type: 'user', name: 'cible', description: 'Utilisateur (défaut: toi)' }],
    execute: async (interaction) => {
      const user = interaction.options.getUser('cible') || interaction.user;
      await interaction.reply({ embeds: [E.info(`🖼️ Avatar de ${user.username}`, null).setImage(user.displayAvatarURL({ size: 1024 }))] });
    } }),

  cmd({ name: 'botinfo', description: 'Informations sur le bot', category: CAT,
    execute: async (interaction, client) => {
      const desc = [
        `Serveurs : **${client.guilds.cache.size}**`,
        `Commandes : **${client.commands.size}**`,
        `Ping : **${Math.round(client.ws.ping)}ms**`,
        `discord.js : **v${version}**`,
        `Node : **${process.version}**`,
        `Uptime : **${Math.floor(process.uptime())}s**`,
      ].join('\n');
      await interaction.reply({ embeds: [E.info('🤖 Bot Info', desc)] });
    } }),
];
