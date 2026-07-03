const { ActivityType } = require('discord.js');
const { cmd } = require('../lib/command');
const store = require('../lib/store');
const config = require('../config');
const E = require('../lib/embeds');
const { loadCommands } = require('../lib/loader');
const util = require('util');

const CAT = 'Owner Bot';
const owner = { category: CAT, ownerOnly: true };

module.exports = [
  cmd({ ...owner, name: 'owner-exec', description: 'Exécute du code JavaScript (dangereux, owner only)',
    options: [{ type: 'string', name: 'code', description: 'Code JS à évaluer', required: true }],
    execute: async (interaction) => {
      await interaction.deferReply({ ephemeral: true });
      const code = interaction.options.getString('code', true);
      try {
        // eslint-disable-next-line no-eval
        let result = await eval(code);
        if (typeof result !== 'string') result = util.inspect(result, { depth: 1 }).slice(0, 1800);
        await interaction.editReply({ embeds: [E.success('Exécuté', '```js\n' + String(result).slice(0, 1900) + '\n```')] });
      } catch (err) {
        await interaction.editReply({ embeds: [E.error('Erreur', '```\n' + String(err).slice(0, 1900) + '\n```')] });
      }
    } }),

  cmd({ ...owner, name: 'owner-shutdown', description: 'Éteint le bot',
    execute: async (interaction) => {
      await interaction.reply({ embeds: [E.warning('Arrêt', 'Le bot s\'éteint...')], ephemeral: true });
      setTimeout(() => process.exit(0), 500);
    } }),

  cmd({ ...owner, name: 'owner-restart', description: 'Redémarre le processus du bot',
    execute: async (interaction) => {
      await interaction.reply({ embeds: [E.warning('Redémarrage', 'Redémarrage en cours (nécessite un gestionnaire de process type pm2)...')], ephemeral: true });
      setTimeout(() => process.exit(1), 500);
    } }),

  cmd({ ...owner, name: 'owner-broadcast', description: 'Envoie un message dans tous les serveurs',
    options: [{ type: 'string', name: 'message', description: 'Message à diffuser', required: true }],
    execute: async (interaction, client) => {
      await interaction.deferReply({ ephemeral: true });
      const msg = interaction.options.getString('message', true);
      let ok = 0;
      for (const guild of client.guilds.cache.values()) {
        const ch = guild.systemChannel || guild.channels.cache.find((c) => c.isTextBased && c.isTextBased());
        if (ch) { await ch.send({ embeds: [E.info('📢 Annonce', msg)] }).then(() => ok++).catch(() => {}); }
      }
      await interaction.editReply({ embeds: [E.success('Diffusé', `Message envoyé dans ${ok} serveur(s).`)] });
    } }),

  cmd({ ...owner, name: 'owner-setname', description: 'Change le pseudo du bot',
    options: [{ type: 'string', name: 'nom', description: 'Nouveau nom', required: true }],
    execute: async (interaction, client) => {
      await client.user.setUsername(interaction.options.getString('nom', true));
      await interaction.reply({ embeds: [E.success('Nom modifié', 'Le pseudo du bot a été mis à jour.')], ephemeral: true });
    } }),

  cmd({ ...owner, name: 'owner-setavatar', description: 'Change l\'avatar du bot',
    options: [{ type: 'string', name: 'url', description: 'URL de l\'image', required: true }],
    execute: async (interaction, client) => {
      await client.user.setAvatar(interaction.options.getString('url', true));
      await interaction.reply({ embeds: [E.success('Avatar modifié', 'Le nouvel avatar est appliqué.')], ephemeral: true });
    } }),

  cmd({ ...owner, name: 'owner-setstatus', description: 'Change le statut de présence',
    options: [{ type: 'string', name: 'statut', description: 'Statut', required: true, choices: ['online', 'idle', 'dnd', 'invisible'] }],
    execute: async (interaction, client) => {
      client.user.setStatus(interaction.options.getString('statut', true));
      await interaction.reply({ embeds: [E.success('Statut modifié', 'Présence mise à jour.')], ephemeral: true });
    } }),

  cmd({ ...owner, name: 'owner-setactivity', description: 'Change l\'activité affichée',
    options: [{ type: 'string', name: 'texte', description: 'Texte de l\'activité', required: true }],
    execute: async (interaction, client) => {
      client.user.setActivity(interaction.options.getString('texte', true), { type: ActivityType.Playing });
      await interaction.reply({ embeds: [E.success('Activité modifiée', 'Activité mise à jour.')], ephemeral: true });
    } }),

  cmd({ ...owner, name: 'owner-guilds', description: 'Liste les serveurs du bot',
    execute: async (interaction, client) => {
      const list = client.guilds.cache.map((g) => `• ${g.name} — \`${g.id}\` (${g.memberCount})`).slice(0, 30).join('\n');
      await interaction.reply({ embeds: [E.info(`🌐 ${client.guilds.cache.size} serveur(s)`, list || '*aucun*')], ephemeral: true });
    } }),

  cmd({ ...owner, name: 'owner-leaveguild', description: 'Fait quitter un serveur au bot',
    options: [{ type: 'string', name: 'id', description: 'ID du serveur', required: true }],
    execute: async (interaction, client) => {
      const g = client.guilds.cache.get(interaction.options.getString('id', true));
      if (!g) return interaction.reply({ embeds: [E.error('Introuvable', 'Serveur non trouvé.')], ephemeral: true });
      await g.leave();
      await interaction.reply({ embeds: [E.success('Quitté', `Le bot a quitté ${g.name}.`)], ephemeral: true });
    } }),

  cmd({ ...owner, name: 'owner-blacklist-user', description: 'Blackliste globalement un utilisateur',
    options: [{ type: 'user', name: 'cible', description: 'Utilisateur', required: true }],
    execute: async (interaction) => {
      store.pushUnique('global', 'blacklist_users', interaction.options.getUser('cible', true).id);
      await interaction.reply({ embeds: [E.success('Blacklisté', 'Utilisateur ajouté à la blacklist globale.')], ephemeral: true });
    } }),

  cmd({ ...owner, name: 'owner-unblacklist-user', description: 'Retire un utilisateur de la blacklist globale',
    options: [{ type: 'user', name: 'cible', description: 'Utilisateur', required: true }],
    execute: async (interaction) => {
      store.pull('global', 'blacklist_users', interaction.options.getUser('cible', true).id);
      await interaction.reply({ embeds: [E.success('Retiré', 'Utilisateur retiré de la blacklist globale.')], ephemeral: true });
    } }),

  cmd({ ...owner, name: 'owner-addowner', description: 'Ajoute un propriétaire du bot (session courante)',
    options: [{ type: 'user', name: 'cible', description: 'Utilisateur', required: true }],
    execute: async (interaction) => {
      const id = interaction.options.getUser('cible', true).id;
      if (!config.ownerIds.includes(id)) config.ownerIds.push(id);
      await interaction.reply({ embeds: [E.success('Owner ajouté', 'Pense à l\'ajouter aussi dans OWNER_IDS du .env.')], ephemeral: true });
    } }),

  cmd({ ...owner, name: 'owner-removeowner', description: 'Retire un propriétaire du bot (session courante)',
    options: [{ type: 'user', name: 'cible', description: 'Utilisateur', required: true }],
    execute: async (interaction) => {
      const id = interaction.options.getUser('cible', true).id;
      config.ownerIds = config.ownerIds.filter((o) => o !== id);
      await interaction.reply({ embeds: [E.success('Owner retiré', 'Modification appliquée pour la session.')], ephemeral: true });
    } }),

  cmd({ ...owner, name: 'owner-stats', description: 'Statistiques globales du bot',
    execute: async (interaction, client) => {
      const users = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
      const desc = `Serveurs : **${client.guilds.cache.size}**\nUtilisateurs : **${users}**\nPing : **${Math.round(client.ws.ping)}ms**\nUptime : **${Math.floor(client.uptime / 1000)}s**`;
      await interaction.reply({ embeds: [E.info('📊 Stats globales', desc)], ephemeral: true });
    } }),

  cmd({ ...owner, name: 'owner-eval-toggle', description: 'Active/désactive les évaluations de code',
    execute: async (interaction) => {
      const cur = store.get('global', 'eval_enabled', true);
      store.set('global', 'eval_enabled', !cur);
      await interaction.reply({ embeds: [E.success('Basculé', `Eval : **${!cur ? 'ON' : 'OFF'}**`)], ephemeral: true });
    } }),

  cmd({ ...owner, name: 'owner-maintenance', description: 'Active/désactive le mode maintenance',
    execute: async (interaction) => {
      const cur = store.get('global', 'maintenance', false);
      store.set('global', 'maintenance', !cur);
      await interaction.reply({ embeds: [E.warning('Maintenance', `Mode maintenance : **${!cur ? 'ON' : 'OFF'}**`)], ephemeral: true });
    } }),

  cmd({ ...owner, name: 'owner-dm', description: 'Envoie un DM à un utilisateur',
    options: [
      { type: 'user', name: 'cible', description: 'Destinataire', required: true },
      { type: 'string', name: 'message', description: 'Message', required: true },
    ],
    execute: async (interaction) => {
      const user = interaction.options.getUser('cible', true);
      await user.send(interaction.options.getString('message', true)).catch(() => {});
      await interaction.reply({ embeds: [E.success('Envoyé', `DM envoyé à ${user.tag}.`)], ephemeral: true });
    } }),

  cmd({ ...owner, name: 'owner-reload', description: 'Recharge les commandes en mémoire',
    execute: async (interaction, client) => {
      try {
        for (const key of Object.keys(require.cache)) {
          if (key.includes('/commands/')) delete require.cache[key];
        }
        client.commands.clear();
        for (const c of loadCommands()) client.commands.set(c.data.name, c);
        await interaction.reply({ embeds: [E.success('Rechargé', `${client.commands.size} commandes rechargées.`)], ephemeral: true });
      } catch (err) {
        await interaction.reply({ embeds: [E.error('Erreur', String(err).slice(0, 500))], ephemeral: true });
      }
    } }),
];
