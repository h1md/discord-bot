const { cmd, P } = require('../lib/command');
const store = require('../lib/store');
const E = require('../lib/embeds');

const CAT = 'Modération';

/** Ajoute une entree "case" et renvoie son numero. */
function addCase(guildId, entry) {
  const cases = store.get(guildId, 'cases', []) || [];
  const id = cases.length + 1;
  cases.push({ id, ...entry, at: Date.now() });
  store.set(guildId, 'cases', cases);
  return id;
}

async function fetchMember(interaction, opt = 'cible') {
  const user = interaction.options.getUser(opt, true);
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);
  return { user, member };
}

module.exports = [
  cmd({ name: 'ban', description: 'Bannit un membre', category: CAT, permission: P.BanMembers,
    options: [
      { type: 'user', name: 'cible', description: 'Membre à bannir', required: true },
      { type: 'string', name: 'raison', description: 'Raison' },
    ],
    execute: async (interaction) => {
      const { user } = await fetchMember(interaction);
      const reason = interaction.options.getString('raison') || 'Aucune raison';
      await interaction.guild.members.ban(user.id, { reason });
      const id = addCase(interaction.guildId, { type: 'ban', user: user.id, mod: interaction.user.id, reason });
      await interaction.reply({ embeds: [E.success(`Banni (case #${id})`, `${user.tag} a été banni.\nRaison : ${reason}`)] });
    } }),

  cmd({ name: 'unban', description: 'Débannit un utilisateur par ID', category: CAT, permission: P.BanMembers,
    options: [{ type: 'string', name: 'id', description: 'ID de l\'utilisateur', required: true }],
    execute: async (interaction) => {
      const id = interaction.options.getString('id', true);
      await interaction.guild.members.unban(id).catch(() => null);
      await interaction.reply({ embeds: [E.success('Débanni', `L'utilisateur \`${id}\` a été débanni.`)] });
    } }),

  cmd({ name: 'tempban', description: 'Bannit temporairement un membre', category: CAT, permission: P.BanMembers,
    options: [
      { type: 'user', name: 'cible', description: 'Membre', required: true },
      { type: 'int', name: 'minutes', description: 'Durée en minutes', required: true, min: 1 },
      { type: 'string', name: 'raison', description: 'Raison' },
    ],
    execute: async (interaction) => {
      const { user } = await fetchMember(interaction);
      const minutes = interaction.options.getInteger('minutes', true);
      const reason = interaction.options.getString('raison') || 'Tempban';
      await interaction.guild.members.ban(user.id, { reason });
      const id = addCase(interaction.guildId, { type: 'tempban', user: user.id, mod: interaction.user.id, reason, minutes });
      setTimeout(() => interaction.guild.members.unban(user.id).catch(() => {}), minutes * 60000);
      await interaction.reply({ embeds: [E.success(`Tempban (case #${id})`, `${user.tag} banni pour ${minutes} min.`)] });
    } }),

  cmd({ name: 'hackban', description: 'Bannit un utilisateur absent du serveur (par ID)', category: CAT, permission: P.BanMembers,
    options: [
      { type: 'string', name: 'id', description: 'ID de l\'utilisateur', required: true },
      { type: 'string', name: 'raison', description: 'Raison' },
    ],
    execute: async (interaction) => {
      const uid = interaction.options.getString('id', true);
      const reason = interaction.options.getString('raison') || 'Hackban';
      await interaction.guild.members.ban(uid, { reason });
      const id = addCase(interaction.guildId, { type: 'hackban', user: uid, mod: interaction.user.id, reason });
      await interaction.reply({ embeds: [E.success(`Hackban (case #${id})`, `\`${uid}\` a été banni.`)] });
    } }),

  cmd({ name: 'softban', description: 'Ban puis unban pour nettoyer les messages', category: CAT, permission: P.BanMembers,
    options: [
      { type: 'user', name: 'cible', description: 'Membre', required: true },
      { type: 'string', name: 'raison', description: 'Raison' },
    ],
    execute: async (interaction) => {
      const { user } = await fetchMember(interaction);
      const reason = interaction.options.getString('raison') || 'Softban';
      await interaction.guild.members.ban(user.id, { reason, deleteMessageSeconds: 604800 });
      await interaction.guild.members.unban(user.id).catch(() => {});
      const id = addCase(interaction.guildId, { type: 'softban', user: user.id, mod: interaction.user.id, reason });
      await interaction.reply({ embeds: [E.success(`Softban (case #${id})`, `${user.tag} softban (messages nettoyés).`)] });
    } }),

  cmd({ name: 'massban', description: 'Bannit plusieurs IDs (séparés par espaces)', category: CAT, permission: P.BanMembers,
    options: [{ type: 'string', name: 'ids', description: 'IDs séparés par des espaces', required: true }],
    execute: async (interaction) => {
      await interaction.deferReply();
      const ids = interaction.options.getString('ids', true).split(/\s+/).filter(Boolean);
      let ok = 0;
      for (const uid of ids) { await interaction.guild.members.ban(uid, { reason: 'Massban' }).then(() => ok++).catch(() => {}); }
      await interaction.editReply({ embeds: [E.success('Massban', `${ok}/${ids.length} utilisateurs bannis.`)] });
    } }),

  cmd({ name: 'kick', description: 'Expulse un membre', category: CAT, permission: P.KickMembers,
    options: [
      { type: 'user', name: 'cible', description: 'Membre', required: true },
      { type: 'string', name: 'raison', description: 'Raison' },
    ],
    execute: async (interaction) => {
      const { user, member } = await fetchMember(interaction);
      const reason = interaction.options.getString('raison') || 'Aucune raison';
      if (member) await member.kick(reason);
      const id = addCase(interaction.guildId, { type: 'kick', user: user.id, mod: interaction.user.id, reason });
      await interaction.reply({ embeds: [E.success(`Expulsé (case #${id})`, `${user.tag} a été expulsé.`)] });
    } }),

  cmd({ name: 'masskick', description: 'Expulse plusieurs membres (IDs)', category: CAT, permission: P.KickMembers,
    options: [{ type: 'string', name: 'ids', description: 'IDs séparés par des espaces', required: true }],
    execute: async (interaction) => {
      await interaction.deferReply();
      const ids = interaction.options.getString('ids', true).split(/\s+/).filter(Boolean);
      let ok = 0;
      for (const uid of ids) {
        const m = await interaction.guild.members.fetch(uid).catch(() => null);
        if (m) await m.kick('Masskick').then(() => ok++).catch(() => {});
      }
      await interaction.editReply({ embeds: [E.success('Masskick', `${ok}/${ids.length} membres expulsés.`)] });
    } }),

  cmd({ name: 'mute', description: 'Rend muet (timeout) un membre', category: CAT, permission: P.ModerateMembers,
    options: [
      { type: 'user', name: 'cible', description: 'Membre', required: true },
      { type: 'string', name: 'raison', description: 'Raison' },
    ],
    execute: async (interaction) => {
      const { user, member } = await fetchMember(interaction);
      const dur = (store.get(interaction.guildId, 'mute_duration', 60) || 60) * 60000;
      if (member) await member.timeout(dur, interaction.options.getString('raison') || 'Mute');
      const id = addCase(interaction.guildId, { type: 'mute', user: user.id, mod: interaction.user.id });
      await interaction.reply({ embeds: [E.success(`Muet (case #${id})`, `${user.tag} est muet.`)] });
    } }),

  cmd({ name: 'unmute', description: 'Retire le mute (timeout)', category: CAT, permission: P.ModerateMembers,
    options: [{ type: 'user', name: 'cible', description: 'Membre', required: true }],
    execute: async (interaction) => {
      const { user, member } = await fetchMember(interaction);
      if (member) await member.timeout(null);
      await interaction.reply({ embeds: [E.success('Démuet', `${user.tag} peut à nouveau parler.`)] });
    } }),

  cmd({ name: 'tempmute', description: 'Mute pour une durée précise (minutes)', category: CAT, permission: P.ModerateMembers,
    options: [
      { type: 'user', name: 'cible', description: 'Membre', required: true },
      { type: 'int', name: 'minutes', description: 'Durée en minutes', required: true, min: 1, max: 40320 },
    ],
    execute: async (interaction) => {
      const { user, member } = await fetchMember(interaction);
      const minutes = interaction.options.getInteger('minutes', true);
      if (member) await member.timeout(minutes * 60000, 'Tempmute');
      await interaction.reply({ embeds: [E.success('Tempmute', `${user.tag} muet pour ${minutes} min.`)] });
    } }),

  cmd({ name: 'warn', description: 'Avertit un membre', category: CAT, permission: P.ModerateMembers,
    options: [
      { type: 'user', name: 'cible', description: 'Membre', required: true },
      { type: 'string', name: 'raison', description: 'Raison', required: true },
    ],
    execute: async (interaction) => {
      const { user } = await fetchMember(interaction);
      const reason = interaction.options.getString('raison', true);
      const key = `warns_${user.id}`;
      const warns = store.get(interaction.guildId, key, []) || [];
      warns.push({ mod: interaction.user.id, reason, at: Date.now() });
      store.set(interaction.guildId, key, warns);
      addCase(interaction.guildId, { type: 'warn', user: user.id, mod: interaction.user.id, reason });
      await interaction.reply({ embeds: [E.warning('Averti', `${user.tag} a reçu un avertissement (total: ${warns.length}).\nRaison : ${reason}`)] });
    } }),

  cmd({ name: 'unwarn', description: 'Retire le dernier avertissement', category: CAT, permission: P.ModerateMembers,
    options: [{ type: 'user', name: 'cible', description: 'Membre', required: true }],
    execute: async (interaction) => {
      const { user } = await fetchMember(interaction);
      const key = `warns_${user.id}`;
      const warns = store.get(interaction.guildId, key, []) || [];
      warns.pop();
      store.set(interaction.guildId, key, warns);
      await interaction.reply({ embeds: [E.success('Avertissement retiré', `${user.tag} a maintenant ${warns.length} avertissement(s).`)] });
    } }),

  cmd({ name: 'warnings', description: 'Affiche les avertissements d\'un membre', category: CAT, permission: P.ModerateMembers,
    options: [{ type: 'user', name: 'cible', description: 'Membre', required: true }],
    execute: async (interaction) => {
      const { user } = await fetchMember(interaction);
      const warns = store.get(interaction.guildId, `warns_${user.id}`, []) || [];
      const lines = warns.map((w, i) => `**${i + 1}.** ${w.reason} — <@${w.mod}>`).join('\n');
      await interaction.reply({ embeds: [E.info(`⚠️ Avertissements de ${user.tag} (${warns.length})`, lines || '*aucun*')] });
    } }),

  cmd({ name: 'clearwarns', description: 'Efface tous les avertissements d\'un membre', category: CAT, permission: P.ModerateMembers,
    options: [{ type: 'user', name: 'cible', description: 'Membre', required: true }],
    execute: async (interaction) => {
      const { user } = await fetchMember(interaction);
      store.set(interaction.guildId, `warns_${user.id}`, []);
      await interaction.reply({ embeds: [E.success('Avertissements effacés', `Les avertissements de ${user.tag} ont été effacés.`)] });
    } }),

  cmd({ name: 'quarantaine', description: 'Met un membre en quarantaine (retire ses rôles)', category: CAT, permission: P.ManageRoles,
    options: [{ type: 'user', name: 'cible', description: 'Membre', required: true }],
    execute: async (interaction) => {
      const { user, member } = await fetchMember(interaction);
      if (member) {
        store.set(interaction.guildId, `quar_${user.id}`, member.roles.cache.filter((r) => r.id !== interaction.guild.id).map((r) => r.id));
        await member.roles.set([]).catch(() => {});
      }
      await interaction.reply({ embeds: [E.warning('Quarantaine', `${user.tag} a été mis en quarantaine.`)] });
    } }),

  cmd({ name: 'unquarantaine', description: 'Sort un membre de quarantaine (restaure ses rôles)', category: CAT, permission: P.ManageRoles,
    options: [{ type: 'user', name: 'cible', description: 'Membre', required: true }],
    execute: async (interaction) => {
      const { user, member } = await fetchMember(interaction);
      const roles = store.get(interaction.guildId, `quar_${user.id}`, []) || [];
      if (member) await member.roles.set(roles).catch(() => {});
      await interaction.reply({ embeds: [E.success('Quarantaine levée', `Les rôles de ${user.tag} ont été restaurés.`)] });
    } }),

  cmd({ name: 'note-add', description: 'Ajoute une note interne sur un membre', category: CAT, permission: P.ModerateMembers,
    options: [
      { type: 'user', name: 'cible', description: 'Membre', required: true },
      { type: 'string', name: 'note', description: 'Contenu de la note', required: true },
    ],
    execute: async (interaction) => {
      const { user } = await fetchMember(interaction);
      const key = `notes_${user.id}`;
      const notes = store.get(interaction.guildId, key, []) || [];
      notes.push({ mod: interaction.user.id, note: interaction.options.getString('note', true), at: Date.now() });
      store.set(interaction.guildId, key, notes);
      await interaction.reply({ embeds: [E.success('Note ajoutée', `Note enregistrée pour ${user.tag}.`)], ephemeral: true });
    } }),

  cmd({ name: 'note-remove', description: 'Retire la dernière note d\'un membre', category: CAT, permission: P.ModerateMembers,
    options: [{ type: 'user', name: 'cible', description: 'Membre', required: true }],
    execute: async (interaction) => {
      const { user } = await fetchMember(interaction);
      const key = `notes_${user.id}`;
      const notes = store.get(interaction.guildId, key, []) || [];
      notes.pop();
      store.set(interaction.guildId, key, notes);
      await interaction.reply({ embeds: [E.success('Note retirée', `Note supprimée pour ${user.tag}.`)], ephemeral: true });
    } }),

  cmd({ name: 'notes', description: 'Affiche les notes internes d\'un membre', category: CAT, permission: P.ModerateMembers,
    options: [{ type: 'user', name: 'cible', description: 'Membre', required: true }],
    execute: async (interaction) => {
      const { user } = await fetchMember(interaction);
      const notes = store.get(interaction.guildId, `notes_${user.id}`, []) || [];
      const lines = notes.map((n, i) => `**${i + 1}.** ${n.note} — <@${n.mod}>`).join('\n');
      await interaction.reply({ embeds: [E.info(`🗒️ Notes de ${user.tag} (${notes.length})`, lines || '*aucune*')], ephemeral: true });
    } }),

  cmd({ name: 'case', description: 'Affiche une sanction par son numéro', category: CAT, permission: P.ModerateMembers,
    options: [{ type: 'int', name: 'numero', description: 'Numéro de la sanction', required: true, min: 1 }],
    execute: async (interaction) => {
      const cases = store.get(interaction.guildId, 'cases', []) || [];
      const c = cases.find((x) => x.id === interaction.options.getInteger('numero', true));
      if (!c) return interaction.reply({ embeds: [E.error('Introuvable', 'Aucune sanction avec ce numéro.')], ephemeral: true });
      await interaction.reply({ embeds: [E.info(`Case #${c.id} — ${c.type}`, `Cible : <@${c.user}>\nModérateur : <@${c.mod}>\nRaison : ${c.reason || '—'}`)] });
    } }),

  cmd({ name: 'cases', description: 'Liste les dernières sanctions', category: CAT, permission: P.ModerateMembers,
    execute: async (interaction) => {
      const cases = (store.get(interaction.guildId, 'cases', []) || []).slice(-10).reverse();
      const lines = cases.map((c) => `**#${c.id}** ${c.type} — <@${c.user}>`).join('\n');
      await interaction.reply({ embeds: [E.info('📁 Sanctions récentes', lines || '*aucune*')], ephemeral: true });
    } }),

  cmd({ name: 'reason', description: 'Modifie la raison d\'une sanction', category: CAT, permission: P.ModerateMembers,
    options: [
      { type: 'int', name: 'numero', description: 'Numéro de la sanction', required: true, min: 1 },
      { type: 'string', name: 'raison', description: 'Nouvelle raison', required: true },
    ],
    execute: async (interaction) => {
      const cases = store.get(interaction.guildId, 'cases', []) || [];
      const c = cases.find((x) => x.id === interaction.options.getInteger('numero', true));
      if (!c) return interaction.reply({ embeds: [E.error('Introuvable', 'Aucune sanction avec ce numéro.')], ephemeral: true });
      c.reason = interaction.options.getString('raison', true);
      store.set(interaction.guildId, 'cases', cases);
      await interaction.reply({ embeds: [E.success('Raison modifiée', `Case #${c.id} mise à jour.`)] });
    } }),

  cmd({ name: 'purge', description: 'Supprime des messages en masse', category: CAT, permission: P.ManageMessages,
    options: [{ type: 'int', name: 'nombre', description: 'Nombre de messages (1-100)', required: true, min: 1, max: 100 }],
    execute: async (interaction) => {
      const n = interaction.options.getInteger('nombre', true);
      const deleted = await interaction.channel.bulkDelete(n, true);
      await interaction.reply({ embeds: [E.success('Messages supprimés', `${deleted.size} message(s) supprimé(s).`)], ephemeral: true });
    } }),

  cmd({ name: 'clear-user', description: 'Supprime les messages récents d\'un membre', category: CAT, permission: P.ManageMessages,
    options: [
      { type: 'user', name: 'cible', description: 'Membre', required: true },
      { type: 'int', name: 'nombre', description: 'Messages à scanner (max 100)', min: 1, max: 100 },
    ],
    execute: async (interaction) => {
      await interaction.deferReply({ ephemeral: true });
      const { user } = await fetchMember(interaction);
      const n = interaction.options.getInteger('nombre') || 100;
      const msgs = await interaction.channel.messages.fetch({ limit: n });
      const toDel = msgs.filter((m) => m.author.id === user.id);
      const del = await interaction.channel.bulkDelete(toDel, true);
      await interaction.editReply({ embeds: [E.success('Nettoyé', `${del.size} message(s) de ${user.tag} supprimé(s).`)] });
    } }),

  cmd({ name: 'slowmode', description: 'Définit le mode lent du salon courant', category: CAT, permission: P.ManageChannels,
    options: [{ type: 'int', name: 'secondes', description: 'Délai en secondes (0 = off)', required: true, min: 0, max: 21600 }],
    execute: async (interaction) => {
      const s = interaction.options.getInteger('secondes', true);
      await interaction.channel.setRateLimitPerUser(s);
      await interaction.reply({ embeds: [E.success('Mode lent', `Délai réglé à ${s}s.`)] });
    } }),

  cmd({ name: 'lock', description: 'Verrouille le salon courant', category: CAT, permission: P.ManageChannels,
    execute: async (interaction) => {
      await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
      await interaction.reply({ embeds: [E.warning('Salon verrouillé', 'Personne ne peut plus écrire ici.')] });
    } }),

  cmd({ name: 'unlock', description: 'Déverrouille le salon courant', category: CAT, permission: P.ManageChannels,
    execute: async (interaction) => {
      await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null });
      await interaction.reply({ embeds: [E.success('Salon déverrouillé', 'Les membres peuvent à nouveau écrire.')] });
    } }),

  cmd({ name: 'lockall', description: 'Verrouille tous les salons textuels', category: CAT, permission: P.Administrator,
    execute: async (interaction) => {
      await interaction.deferReply();
      let n = 0;
      for (const ch of interaction.guild.channels.cache.values()) {
        if (ch.isTextBased && ch.isTextBased() && ch.permissionOverwrites) {
          await ch.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false }).then(() => n++).catch(() => {});
        }
      }
      await interaction.editReply({ embeds: [E.warning('Confinement', `${n} salon(s) verrouillé(s).`)] });
    } }),

  cmd({ name: 'unlockall', description: 'Déverrouille tous les salons textuels', category: CAT, permission: P.Administrator,
    execute: async (interaction) => {
      await interaction.deferReply();
      let n = 0;
      for (const ch of interaction.guild.channels.cache.values()) {
        if (ch.isTextBased && ch.isTextBased() && ch.permissionOverwrites) {
          await ch.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null }).then(() => n++).catch(() => {});
        }
      }
      await interaction.editReply({ embeds: [E.success('Confinement levé', `${n} salon(s) déverrouillé(s).`)] });
    } }),

  cmd({ name: 'nickname', description: 'Change le pseudo d\'un membre', category: CAT, permission: P.ManageNicknames,
    options: [
      { type: 'user', name: 'cible', description: 'Membre', required: true },
      { type: 'string', name: 'pseudo', description: 'Nouveau pseudo', required: true },
    ],
    execute: async (interaction) => {
      const { user, member } = await fetchMember(interaction);
      if (member) await member.setNickname(interaction.options.getString('pseudo', true));
      await interaction.reply({ embeds: [E.success('Pseudo modifié', `Pseudo de ${user.tag} mis à jour.`)] });
    } }),

  cmd({ name: 'resetnick', description: 'Réinitialise le pseudo d\'un membre', category: CAT, permission: P.ManageNicknames,
    options: [{ type: 'user', name: 'cible', description: 'Membre', required: true }],
    execute: async (interaction) => {
      const { user, member } = await fetchMember(interaction);
      if (member) await member.setNickname(null);
      await interaction.reply({ embeds: [E.success('Pseudo réinitialisé', `Pseudo de ${user.tag} réinitialisé.`)] });
    } }),

  cmd({ name: 'addrole', description: 'Ajoute un rôle à un membre', category: CAT, permission: P.ManageRoles,
    options: [
      { type: 'user', name: 'cible', description: 'Membre', required: true },
      { type: 'role', name: 'role', description: 'Rôle', required: true },
    ],
    execute: async (interaction) => {
      const { user, member } = await fetchMember(interaction);
      if (member) await member.roles.add(interaction.options.getRole('role', true).id);
      await interaction.reply({ embeds: [E.success('Rôle ajouté', `Rôle ajouté à ${user.tag}.`)] });
    } }),

  cmd({ name: 'removerole', description: 'Retire un rôle à un membre', category: CAT, permission: P.ManageRoles,
    options: [
      { type: 'user', name: 'cible', description: 'Membre', required: true },
      { type: 'role', name: 'role', description: 'Rôle', required: true },
    ],
    execute: async (interaction) => {
      const { user, member } = await fetchMember(interaction);
      if (member) await member.roles.remove(interaction.options.getRole('role', true).id);
      await interaction.reply({ embeds: [E.success('Rôle retiré', `Rôle retiré à ${user.tag}.`)] });
    } }),

  cmd({ name: 'voicekick', description: 'Déconnecte un membre du vocal', category: CAT, permission: P.MoveMembers,
    options: [{ type: 'user', name: 'cible', description: 'Membre', required: true }],
    execute: async (interaction) => {
      const { user, member } = await fetchMember(interaction);
      if (member) await member.voice.disconnect().catch(() => {});
      await interaction.reply({ embeds: [E.success('Déconnecté', `${user.tag} a été déconnecté du vocal.`)] });
    } }),

  cmd({ name: 'deafen', description: 'Rend sourd un membre en vocal', category: CAT, permission: P.DeafenMembers,
    options: [{ type: 'user', name: 'cible', description: 'Membre', required: true }],
    execute: async (interaction) => {
      const { user, member } = await fetchMember(interaction);
      if (member) await member.voice.setDeaf(true).catch(() => {});
      await interaction.reply({ embeds: [E.success('Sourd', `${user.tag} est sourd en vocal.`)] });
    } }),

  cmd({ name: 'undeafen', description: 'Rend l\'audio à un membre en vocal', category: CAT, permission: P.DeafenMembers,
    options: [{ type: 'user', name: 'cible', description: 'Membre', required: true }],
    execute: async (interaction) => {
      const { user, member } = await fetchMember(interaction);
      if (member) await member.voice.setDeaf(false).catch(() => {});
      await interaction.reply({ embeds: [E.success('Audio rétabli', `${user.tag} entend à nouveau.`)] });
    } }),

  cmd({ name: 'modstats', description: 'Statistiques de modération du serveur', category: CAT, permission: P.ModerateMembers,
    execute: async (interaction) => {
      const cases = store.get(interaction.guildId, 'cases', []) || [];
      const count = (t) => cases.filter((c) => c.type === t).length;
      const desc = `Total : **${cases.length}**\nBans : **${count('ban') + count('tempban') + count('hackban')}**\nKicks : **${count('kick')}**\nMutes : **${count('mute')}**\nWarns : **${count('warn')}**`;
      await interaction.reply({ embeds: [E.info('📊 Stats modération', desc)] });
    } }),
];
