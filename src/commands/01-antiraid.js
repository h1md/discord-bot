const { cmd, P, toggle, setChannel, setRole, setNumber, setText, addToList, removeFromList, show } = require('../lib/command');
const store = require('../lib/store');
const E = require('../lib/embeds');

const CAT = 'Anti-Raid';
const perm = P.ManageGuild;

/** Raccourci pour une paire de commandes on/off liees a une cle. */
function onOff(base, key, label) {
  return [
    cmd({ name: `${base}-on`, description: `Active ${label}`, category: CAT, permission: perm, execute: toggle(key, true, label) }),
    cmd({ name: `${base}-off`, description: `Désactive ${label}`, category: CAT, permission: perm, execute: toggle(key, false, label) }),
  ];
}

module.exports = [
  ...onOff('antispam', 'antispam', 'la protection anti-spam'),
  ...onOff('antilink', 'antilink', 'la protection anti-lien'),
  ...onOff('antiinvite', 'antiinvite', 'la protection anti-invitations'),
  ...onOff('antimention', 'antimention', 'la protection anti-mention'),
  ...onOff('anticaps', 'anticaps', 'la protection anti-majuscules'),
  ...onOff('antiraid', 'antiraid', 'la protection anti-raid'),
  ...onOff('antibot', 'antibot', 'le blocage des bots non autorisés'),
  ...onOff('antinuke', 'antinuke', 'la protection anti-nuke'),
  ...onOff('antiwebhook', 'antiwebhook', 'la protection anti-webhook'),
  ...onOff('antighostping', 'antighostping', 'la détection des ghost pings'),
  ...onOff('antiflood', 'antiflood', 'la protection anti-flood'),
  ...onOff('antiemoji', 'antiemoji', 'la limite d\'emojis'),
  ...onOff('antiselfbot', 'antiselfbot', 'la détection de selfbots'),
  ...onOff('antinewaccount', 'antinewaccount', 'le blocage des comptes récents'),
  ...onOff('antimassmention', 'antimassmention', 'la protection anti-mention de masse'),
  ...onOff('antitoken', 'antitoken', 'la détection de tokens/webhooks leak'),
  ...onOff('lockdown', 'lockdown', 'le mode confinement du serveur'),
  ...onOff('raidmode', 'raidmode', 'le mode raid'),
  ...onOff('joinlock', 'joinlock', 'le verrouillage des arrivées'),
  ...onOff('verifgate', 'verifgate', 'la porte de vérification'),
  ...onOff('autoquarantine', 'autoquarantine', 'la mise en quarantaine automatique'),

  cmd({ name: 'whitelist-add', description: 'Ajoute un membre à la whitelist anti-raid', category: CAT, permission: perm,
    options: [{ type: 'user', name: 'cible', description: 'Membre à whitelister', required: true }],
    execute: addToList('whitelist', 'la whitelist', 'user') }),
  cmd({ name: 'whitelist-remove', description: 'Retire un membre de la whitelist', category: CAT, permission: perm,
    options: [{ type: 'user', name: 'cible', description: 'Membre à retirer', required: true }],
    execute: removeFromList('whitelist', 'la whitelist', 'user') }),
  cmd({ name: 'whitelist-list', description: 'Affiche la whitelist anti-raid', category: CAT, permission: perm,
    execute: show('whitelist', 'Whitelist anti-raid') }),

  cmd({ name: 'blacklist-add', description: 'Ajoute un membre à la blacklist', category: CAT, permission: perm,
    options: [{ type: 'user', name: 'cible', description: 'Membre à blacklister', required: true }],
    execute: addToList('blacklist', 'la blacklist', 'user') }),
  cmd({ name: 'blacklist-remove', description: 'Retire un membre de la blacklist', category: CAT, permission: perm,
    options: [{ type: 'user', name: 'cible', description: 'Membre à retirer', required: true }],
    execute: removeFromList('blacklist', 'la blacklist', 'user') }),
  cmd({ name: 'blacklist-list', description: 'Affiche la blacklist', category: CAT, permission: perm,
    execute: show('blacklist', 'Blacklist') }),

  cmd({ name: 'antispam-limit', description: 'Définit le nb de messages/5s avant sanction', category: CAT, permission: perm,
    options: [{ type: 'int', name: 'valeur', description: 'Messages autorisés par 5s', required: true, min: 1, max: 30 }],
    execute: setNumber('antispam_limit', 'Limite anti-spam') }),
  cmd({ name: 'antispam-action', description: 'Définit la sanction anti-spam', category: CAT, permission: perm,
    options: [{ type: 'string', name: 'valeur', description: 'Sanction', required: true, choices: ['mute', 'kick', 'ban', 'warn'] }],
    execute: setText('antispam_action', 'Action anti-spam') }),
  cmd({ name: 'antilink-whitelist', description: 'Autorise un domaine malgré l\'anti-lien', category: CAT, permission: perm,
    options: [{ type: 'string', name: 'cible', description: 'Domaine (ex: youtube.com)', required: true }],
    execute: addToList('antilink_whitelist', 'les domaines autorisés', 'string') }),
  cmd({ name: 'raid-threshold', description: 'Seuil d\'arrivées/10s déclenchant le raidmode', category: CAT, permission: perm,
    options: [{ type: 'int', name: 'valeur', description: 'Arrivées par 10s', required: true, min: 2, max: 100 }],
    execute: setNumber('raid_threshold', 'Seuil anti-raid') }),
  cmd({ name: 'raid-action', description: 'Sanction appliquée pendant un raid', category: CAT, permission: perm,
    options: [{ type: 'string', name: 'valeur', description: 'Sanction', required: true, choices: ['kick', 'ban', 'quarantine'] }],
    execute: setText('raid_action', 'Action anti-raid') }),
  cmd({ name: 'newaccount-age', description: 'Âge minimum (jours) des comptes autorisés', category: CAT, permission: perm,
    options: [{ type: 'int', name: 'valeur', description: 'Âge minimum en jours', required: true, min: 1, max: 365 }],
    execute: setNumber('newaccount_age', 'Âge minimum des comptes') }),
  cmd({ name: 'antinuke-punishment', description: 'Sanction anti-nuke', category: CAT, permission: perm,
    options: [{ type: 'string', name: 'valeur', description: 'Sanction', required: true, choices: ['ban', 'kick', 'strip-roles'] }],
    execute: setText('antinuke_punishment', 'Sanction anti-nuke') }),
  cmd({ name: 'antinuke-whitelist', description: 'Whiteliste un membre pour l\'anti-nuke', category: CAT, permission: perm,
    options: [{ type: 'user', name: 'cible', description: 'Membre de confiance', required: true }],
    execute: addToList('antinuke_whitelist', 'la whitelist anti-nuke', 'user') }),
  cmd({ name: 'antispam-exempt-role', description: 'Rôle exempté de l\'anti-spam', category: CAT, permission: perm,
    options: [{ type: 'role', name: 'role', description: 'Rôle exempté', required: true }],
    execute: setRole('antispam_exempt_role', 'Rôle exempté anti-spam') }),
  cmd({ name: 'antilink-exempt-channel', description: 'Salon exempté de l\'anti-lien', category: CAT, permission: perm,
    options: [{ type: 'channel', name: 'salon', description: 'Salon exempté', required: true }],
    execute: addToList('antilink_exempt_channels', 'les salons exemptés', 'channel', 'salon') }),
  cmd({ name: 'raidlog-channel', description: 'Salon des alertes anti-raid', category: CAT, permission: perm,
    options: [{ type: 'channel', name: 'salon', description: 'Salon des alertes', required: true }],
    execute: setChannel('raidlog_channel', 'Salon des alertes anti-raid') }),

  cmd({ name: 'panic-mode', description: 'Active immédiatement le confinement total', category: CAT, permission: perm,
    execute: async (interaction) => {
      store.set(interaction.guildId, 'lockdown', true);
      store.set(interaction.guildId, 'raidmode', true);
      store.set(interaction.guildId, 'joinlock', true);
      await interaction.reply({ embeds: [E.warning('Mode panique activé', 'Lockdown + raidmode + joinlock activés. Utilise `/lockdown-off` pour lever.')] });
    } }),

  cmd({ name: 'antiraid-status', description: 'Affiche l\'état des protections anti-raid', category: CAT, permission: perm,
    execute: async (interaction) => {
      const keys = ['antispam', 'antilink', 'antiinvite', 'antiraid', 'antinuke', 'lockdown', 'raidmode', 'joinlock'];
      const lines = keys.map((k) => `• \`${k}\` : **${store.get(interaction.guildId, k, false) ? 'ON' : 'OFF'}**`);
      await interaction.reply({ embeds: [E.info('🛡️ État Anti-Raid', lines.join('\n'))] });
    } }),
];
