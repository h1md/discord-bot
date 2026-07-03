const { cmd } = require('../lib/command');
const store = require('../lib/store');
const E = require('../lib/embeds');

const CAT = 'Utilitaires';

module.exports = [
  cmd({ name: 'rank', description: 'Affiche ton niveau et ton XP', category: CAT,
    options: [{ type: 'user', name: 'cible', description: 'Utilisateur (défaut: toi)' }],
    execute: async (interaction) => {
      const user = interaction.options.getUser('cible') || interaction.user;
      const xp = store.get(interaction.guildId, `xp_${user.id}`, 0) || 0;
      const level = Math.floor(0.1 * Math.sqrt(xp));
      await interaction.reply({ embeds: [E.info(`📈 Rang de ${user.username}`, `Niveau : **${level}**\nXP : **${xp}**`)] });
    } }),

  cmd({ name: 'leaderboard', description: 'Classement XP du serveur', category: CAT,
    execute: async (interaction) => {
      const g = store.getGuild(interaction.guildId);
      const entries = Object.entries(g)
        .filter(([k]) => k.startsWith('xp_'))
        .map(([k, v]) => ({ id: k.slice(3), xp: v }))
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 10);
      const lines = entries.map((e, i) => `**${i + 1}.** <@${e.id}> — ${e.xp} XP`).join('\n');
      await interaction.reply({ embeds: [E.info('🏆 Classement', lines || '*aucune donnée*')] });
    } }),

  cmd({ name: 'help', description: 'Affiche l\'aide et les catégories de commandes', category: CAT,
    execute: async (interaction, client) => {
      const counts = {};
      for (const c of client.commands.values()) counts[c.category] = (counts[c.category] || 0) + 1;
      const lines = Object.entries(counts).map(([cat, n]) => `**${cat}** — ${n} commandes`).join('\n');
      const embed = E.info(`📚 Aide — ${client.commands.size} commandes`, lines)
        .setFooter({ text: 'Tape / pour voir toutes les commandes disponibles.' });
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } }),

  cmd({ name: 'remind', description: 'Programme un rappel personnel', category: CAT,
    options: [
      { type: 'int', name: 'minutes', description: 'Dans combien de minutes', required: true, min: 1, max: 1440 },
      { type: 'string', name: 'texte', description: 'Contenu du rappel', required: true },
    ],
    execute: async (interaction) => {
      const min = interaction.options.getInteger('minutes', true);
      const txt = interaction.options.getString('texte', true);
      setTimeout(() => { interaction.user.send(`⏰ Rappel : ${txt}`).catch(() => {}); }, min * 60000);
      await interaction.reply({ embeds: [E.success('Rappel programmé', `Je te rappellerai dans ${min} min en DM.`)], ephemeral: true });
    } }),

  cmd({ name: 'calc', description: 'Calcule une expression mathématique simple', category: CAT,
    options: [{ type: 'string', name: 'expression', description: 'Ex: 2 + 3 * 4', required: true }],
    execute: async (interaction) => {
      const expr = interaction.options.getString('expression', true);
      if (!/^[-+*/().\d\s]+$/.test(expr)) {
        return interaction.reply({ embeds: [E.error('Expression invalide', 'Utilise seulement des chiffres et + - * / ( ).')], ephemeral: true });
      }
      let result;
      try { result = Function(`"use strict"; return (${expr})`)(); } catch { result = 'erreur'; }
      await interaction.reply({ embeds: [E.info('🧮 Calcul', `\`${expr}\` = **${result}**`)] });
    } }),
];
