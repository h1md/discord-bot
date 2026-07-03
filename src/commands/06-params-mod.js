const { cmd, P, setChannel, setRole, setNumber, setText, toggle, addToList, removeFromList, show } = require('../lib/command');
const store = require('../lib/store');

const CAT = 'Paramètres Mod';
const perm = P.ManageGuild;

function onOff(base, key, label) {
  return [
    cmd({ name: `${base}-on`, description: `Active ${label}`, category: CAT, permission: perm, execute: toggle(key, true, label) }),
    cmd({ name: `${base}-off`, description: `Désactive ${label}`, category: CAT, permission: perm, execute: toggle(key, false, label) }),
  ];
}

module.exports = [
  cmd({ name: 'warn-limit-set', description: 'Nombre d\'avertissements avant sanction auto', category: CAT, permission: perm,
    options: [{ type: 'int', name: 'valeur', description: 'Nombre max d\'avertissements', required: true, min: 1, max: 20 }],
    execute: setNumber('warn_limit', 'Limite d\'avertissements') }),

  cmd({ name: 'filter-add', description: 'Ajoute un mot au filtre', category: CAT, permission: perm,
    options: [{ type: 'string', name: 'cible', description: 'Mot à filtrer', required: true }],
    execute: addToList('word_filter', 'le filtre de mots', 'string') }),

  cmd({ name: 'filter-remove', description: 'Retire un mot du filtre', category: CAT, permission: perm,
    options: [{ type: 'string', name: 'cible', description: 'Mot à retirer', required: true }],
    execute: removeFromList('word_filter', 'le filtre de mots', 'string') }),

  cmd({ name: 'filter-list', description: 'Affiche le filtre de mots', category: CAT, permission: perm,
    execute: show('word_filter', 'Filtre de mots') }),

  ...onOff('auto-ban-warns', 'auto_ban_warns', 'le ban auto après limite d\'avertissements'),
  ...onOff('caps-filter', 'caps_filter', 'le filtre de majuscules'),
  ...onOff('link-filter', 'link_filter', 'le filtre de liens'),
  ...onOff('word-filter', 'word_filter_on', 'le filtre de mots'),
  ...onOff('spam-filter', 'spam_filter', 'le filtre anti-spam'),
  ...onOff('invite-filter', 'invite_filter', 'le filtre d\'invitations'),
  ...onOff('auto-mute-warns', 'auto_mute_warns', 'le mute auto après avertissements'),
  ...onOff('auto-kick-warns', 'auto_kick_warns', 'le kick auto après avertissements'),
  ...onOff('mod-dm', 'mod_dm', 'les DM de notification de sanction'),

  cmd({ name: 'mute-duration-set', description: 'Durée par défaut du mute (minutes)', category: CAT, permission: perm,
    options: [{ type: 'int', name: 'valeur', description: 'Minutes', required: true, min: 1, max: 40320 }],
    execute: setNumber('mute_duration', 'Durée de mute') }),

  cmd({ name: 'warn-expire-set', description: 'Durée avant expiration d\'un avertissement (jours)', category: CAT, permission: perm,
    options: [{ type: 'int', name: 'valeur', description: 'Jours (0 = jamais)', required: true, min: 0, max: 365 }],
    execute: setNumber('warn_expire', 'Expiration des avertissements') }),

  cmd({ name: 'filter-action-set', description: 'Sanction appliquée par les filtres', category: CAT, permission: perm,
    options: [{ type: 'string', name: 'valeur', description: 'Sanction', required: true, choices: ['delete', 'warn', 'mute', 'kick', 'ban'] }],
    execute: setText('filter_action', 'Action des filtres') }),

  cmd({ name: 'filter-exempt-role', description: 'Rôle exempté des filtres', category: CAT, permission: perm,
    options: [{ type: 'role', name: 'role', description: 'Rôle exempté', required: true }],
    execute: setRole('filter_exempt_role', 'Rôle exempté des filtres') }),

  cmd({ name: 'filter-exempt-channel', description: 'Salon exempté des filtres', category: CAT, permission: perm,
    options: [{ type: 'channel', name: 'salon', description: 'Salon exempté', required: true }],
    execute: addToList('filter_exempt_channels', 'les salons exemptés', 'channel', 'salon') }),

  cmd({ name: 'warn-punishment-set', description: 'Sanction auto une fois la limite atteinte', category: CAT, permission: perm,
    options: [{ type: 'string', name: 'valeur', description: 'Sanction', required: true, choices: ['mute', 'kick', 'ban'] }],
    execute: setText('warn_punishment', 'Sanction sur limite d\'avertissements') }),

  cmd({ name: 'modlog-channel-set', description: 'Salon des logs de modération', category: CAT, permission: perm,
    options: [{ type: 'channel', name: 'salon', description: 'Salon', required: true }],
    execute: setChannel('modlog_channel', 'Salon des logs mod') }),

  cmd({ name: 'mod-settings-show', description: 'Affiche les paramètres de modération', category: CAT, permission: perm,
    execute: async (interaction) => {
      const g = interaction.guildId;
      const E = require('../lib/embeds');
      const desc = [
        `Limite avert. : **${store.get(g, 'warn_limit', '—')}**`,
        `Sanction limite : **${store.get(g, 'warn_punishment', '—')}**`,
        `Durée mute : **${store.get(g, 'mute_duration', '—')} min**`,
        `Action filtres : **${store.get(g, 'filter_action', '—')}**`,
        `Filtre mots : **${(store.get(g, 'word_filter', []) || []).length}** mot(s)`,
      ].join('\n');
      await interaction.reply({ embeds: [E.info('🔧 Paramètres Mod', desc)], ephemeral: true });
    } }),
];
