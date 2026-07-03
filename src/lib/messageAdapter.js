const E = require('./embeds');

// Types d'options Discord (application command option types)
const T = { STRING: 3, INTEGER: 4, BOOLEAN: 5, USER: 6, CHANNEL: 7, ROLE: 8, MENTIONABLE: 9, NUMBER: 10, ATTACHMENT: 11 };

function idFromToken(token) {
  if (!token) return null;
  const m = token.match(/^<[@#][!&]?(\d+)>$/) || token.match(/^(\d+)$/);
  return m ? m[1] : null;
}

/**
 * Construit un "faux" objet interaction à partir d'un message texte afin de
 * réutiliser les mêmes handlers que les commandes slash.
 * @returns {object|null} l'interaction simulée, ou null si une erreur d'usage a été envoyée.
 */
async function buildInteraction(command, message, args, client) {
  const optDefs = (command.data.toJSON().options || []).filter((o) => o.type <= T.ATTACHMENT);
  const values = {};
  let cursor = 0;

  for (let i = 0; i < optDefs.length; i++) {
    const def = optDefs[i];
    const isLast = i === optDefs.length - 1;
    let raw;

    if (def.type === T.STRING && isLast) {
      raw = args.slice(cursor).join(' ') || undefined;
      cursor = args.length;
    } else {
      raw = args[cursor];
      cursor += 1;
    }

    if (raw === undefined || raw === '') {
      if (def.required) {
        const usage = optDefs.map((o) => (o.required ? `<${o.name}>` : `[${o.name}]`)).join(' ');
        await message.reply({ embeds: [E.error('Argument manquant', `Usage : \`${message.content.split(/\s+/)[0]} ${usage}\``)] }).catch(() => {});
        return null;
      }
      values[def.name] = null;
      continue;
    }

    switch (def.type) {
      case T.USER: {
        const id = idFromToken(raw);
        values[def.name] = (id && (message.mentions.users.get(id) || (await client.users.fetch(id).catch(() => null)))) || null;
        break;
      }
      case T.ROLE: {
        const id = idFromToken(raw);
        values[def.name] = (id && (message.guild.roles.cache.get(id) || (await message.guild.roles.fetch(id).catch(() => null)))) || null;
        break;
      }
      case T.CHANNEL: {
        const id = idFromToken(raw);
        values[def.name] = (id && (message.guild.channels.cache.get(id) || (await message.guild.channels.fetch(id).catch(() => null)))) || null;
        break;
      }
      case T.MENTIONABLE: {
        const id = idFromToken(raw);
        values[def.name] = (id && (message.guild.roles.cache.get(id) || message.mentions.users.get(id) || (await client.users.fetch(id).catch(() => null)))) || null;
        break;
      }
      case T.INTEGER:
        values[def.name] = parseInt(raw, 10);
        break;
      case T.NUMBER:
        values[def.name] = parseFloat(raw);
        break;
      case T.BOOLEAN:
        values[def.name] = ['true', 'oui', 'yes', '1', 'on'].includes(String(raw).toLowerCase());
        break;
      default:
        values[def.name] = String(raw);
    }
  }

  const send = (payload) => {
    if (typeof payload === 'string') return message.channel.send(payload);
    const { ephemeral, ...rest } = payload || {};
    return message.channel.send(rest);
  };

  return {
    isTextCommand: true,
    commandName: command.data.name,
    client,
    guild: message.guild,
    guildId: message.guildId,
    channel: message.channel,
    channelId: message.channelId,
    user: message.author,
    member: message.member,
    replied: false,
    deferred: false,
    options: {
      getUser: (n) => values[n] ?? null,
      getRole: (n) => values[n] ?? null,
      getChannel: (n) => values[n] ?? null,
      getMentionable: (n) => values[n] ?? null,
      getMember: (n) => (values[n] ? message.guild.members.cache.get(values[n].id) : null),
      getInteger: (n) => (values[n] === null || values[n] === undefined || Number.isNaN(values[n]) ? null : values[n]),
      getNumber: (n) => (values[n] === null || values[n] === undefined || Number.isNaN(values[n]) ? null : values[n]),
      getBoolean: (n) => values[n] ?? null,
      getString: (n) => values[n] ?? null,
    },
    reply: (payload) => send(payload),
    editReply: (payload) => send(payload),
    followUp: (payload) => send(payload),
    deferReply: async () => {},
  };
}

module.exports = { buildInteraction };
