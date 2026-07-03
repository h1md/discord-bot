const { cmd, P } = require('../lib/command');
const store = require('../lib/store');
const E = require('../lib/embeds');

const CAT = 'Admin';

module.exports = [
  cmd({ name: 'announce', description: 'Envoie une annonce dans un salon', category: CAT, permission: P.ManageGuild,
    options: [
      { type: 'channel', name: 'salon', description: 'Salon cible', required: true },
      { type: 'string', name: 'message', description: 'Contenu de l\'annonce', required: true },
    ],
    execute: async (interaction) => {
      const ch = interaction.options.getChannel('salon', true);
      await ch.send({ embeds: [E.info('📢 Annonce', interaction.options.getString('message', true))] });
      await interaction.reply({ embeds: [E.success('Annonce envoyée', `Publié dans <#${ch.id}>.`)], ephemeral: true });
    } }),

  cmd({ name: 'poll', description: 'Crée un sondage à réactions', category: CAT, permission: P.ManageMessages,
    options: [{ type: 'string', name: 'question', description: 'Question du sondage', required: true }],
    execute: async (interaction) => {
      const msg = await interaction.channel.send({ embeds: [E.info('📊 Sondage', interaction.options.getString('question', true))] });
      await msg.react('👍'); await msg.react('👎'); await msg.react('🤷');
      await interaction.reply({ embeds: [E.success('Sondage créé', 'Votez avec les réactions.')], ephemeral: true });
    } }),

  cmd({ name: 'welcome', description: 'Envoie un message de bienvenue de test', category: CAT, permission: P.ManageGuild,
    execute: async (interaction) => {
      const tpl = store.get(interaction.guildId, 'welcome_message', 'Bienvenue {user} sur {server} !');
      const text = tpl.replace('{user}', `<@${interaction.user.id}>`).replace('{server}', interaction.guild.name);
      await interaction.reply({ embeds: [E.success('👋 Bienvenue', text)] });
    } }),

  cmd({ name: 'autorole', description: 'Définit rapidement l\'autorole', category: CAT, permission: P.ManageRoles,
    options: [{ type: 'role', name: 'role', description: 'Rôle automatique', required: true }],
    execute: async (interaction) => {
      store.set(interaction.guildId, 'autorole', interaction.options.getRole('role', true).id);
      await interaction.reply({ embeds: [E.success('Autorole défini', 'Le rôle sera attribué aux nouveaux membres.')] });
    } }),

  cmd({ name: 'embed', description: 'Envoie un embed personnalisé', category: CAT, permission: P.ManageMessages,
    options: [
      { type: 'string', name: 'titre', description: 'Titre', required: true },
      { type: 'string', name: 'description', description: 'Description', required: true },
    ],
    execute: async (interaction) => {
      await interaction.channel.send({ embeds: [E.info(interaction.options.getString('titre', true), interaction.options.getString('description', true))] });
      await interaction.reply({ embeds: [E.success('Embed envoyé', 'Embed publié.')], ephemeral: true });
    } }),

  cmd({ name: 'say', description: 'Fait parler le bot', category: CAT, permission: P.ManageMessages,
    options: [{ type: 'string', name: 'message', description: 'Message', required: true }],
    execute: async (interaction) => {
      await interaction.channel.send(interaction.options.getString('message', true));
      await interaction.reply({ embeds: [E.success('Envoyé', 'Message publié.')], ephemeral: true });
    } }),

  cmd({ name: 'dm', description: 'Envoie un DM à un membre', category: CAT, permission: P.ManageGuild,
    options: [
      { type: 'user', name: 'cible', description: 'Destinataire', required: true },
      { type: 'string', name: 'message', description: 'Message', required: true },
    ],
    execute: async (interaction) => {
      const user = interaction.options.getUser('cible', true);
      await user.send(interaction.options.getString('message', true)).catch(() => {});
      await interaction.reply({ embeds: [E.success('DM envoyé', `Message envoyé à ${user.tag}.`)], ephemeral: true });
    } }),

  cmd({ name: 'giveaway', description: 'Lance un giveaway simple à réaction', category: CAT, permission: P.ManageGuild,
    options: [{ type: 'string', name: 'lot', description: 'Lot à gagner', required: true }],
    execute: async (interaction) => {
      const msg = await interaction.channel.send({ embeds: [E.info('🎉 GIVEAWAY', `Lot : **${interaction.options.getString('lot', true)}**\nRéagis avec 🎉 pour participer !`)] });
      await msg.react('🎉');
      await interaction.reply({ embeds: [E.success('Giveaway lancé', 'Bonne chance à tous !')], ephemeral: true });
    } }),
];
