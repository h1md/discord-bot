require('dotenv').config();

const config = {
  token: process.env.DISCORD_TOKEN || '',
  clientId: process.env.CLIENT_ID || '',
  guildId: process.env.GUILD_ID || '',
  ownerIds: (process.env.OWNER_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean),
  // Couleurs utilisees dans les embeds
  colors: {
    primary: 0x5865f2,
    success: 0x57f287,
    warning: 0xfee75c,
    danger: 0xed4245,
    info: 0x5865f2,
  },
};

module.exports = config;
