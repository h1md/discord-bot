const { cmd } = require('../lib/command');
const store = require('../lib/store');
const config = require('../config');
const E = require('../lib/embeds');

const CAT_ORDER = ['Anti-Raid', 'Owner Bot', 'Gestion Serveur', 'Configuration', 'Logs', 'Paramètres Mod', 'Modération', 'Admin', 'Info', 'Utilitaires'];
const CAT_EMOJI = {
  'Anti-Raid': '🛡️', 'Owner Bot': '👑', 'Gestion Serveur': '🏠', 'Configuration': '⚙️', 'Logs': '📋',
  'Paramètres Mod': '🔧', 'Modération': '🔨', 'Admin': '📣', 'Info': 'ℹ️', 'Utilitaires': '🎮',
};

/** Découpe un texte en morceaux <= max caractères sur les sauts de ligne. */
function chunk(text, max = 4000) {
  const out = [];
  let cur = '';
  for (const line of text.split('\n')) {
    if ((cur + line + '\n').length > max) { out.push(cur); cur = ''; }
    cur += line + '\n';
  }
  if (cur) out.push(cur);
  return out;
}

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

  cmd({ name: 'help', description: 'Affiche toutes les commandes du bot', category: CAT,
    options: [{ type: 'string', name: 'categorie', description: 'Filtrer par catégorie' }],
    execute: async (interaction, client) => {
      const prefix = store.get(interaction.guildId, 'prefix', config.defaultPrefix) || config.defaultPrefix;
      const filter = interaction.options.getString('categorie');

      // Regroupe les commandes par catégorie
      const byCat = {};
      for (const c of client.commands.values()) {
        (byCat[c.category] = byCat[c.category] || []).push(c.data.name);
      }

      const cats = CAT_ORDER.filter((cat) => byCat[cat] && (!filter || cat.toLowerCase().includes(filter.toLowerCase())));
      const embeds = [];
      for (const cat of cats) {
        const names = byCat[cat].sort();
        const body = names.map((n) => `\`${prefix}${n}\``).join(' · ');
        for (const part of chunk(body)) {
          embeds.push(E.info(`${CAT_EMOJI[cat] || ''} ${cat} — ${names.length}`, part));
        }
      }

      if (!embeds.length) {
        return interaction.reply({ embeds: [E.error('Aucune catégorie', 'Catégorie introuvable.')], ephemeral: true });
      }

      embeds[0].setDescription(`**${client.commands.size} commandes** · préfixe \`${prefix}\` ou \`/\`\n\n${embeds[0].data.description}`);
      embeds[embeds.length - 1].setFooter({ text: `Ex: ${prefix}ban @membre raison  •  ou tape /` });

      // Discord limite à 10 embeds par message
      await interaction.reply({ embeds: embeds.slice(0, 10) });
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
