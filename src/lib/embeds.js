const { EmbedBuilder } = require('discord.js');
const { colors } = require('../config');

function base(color) {
  return new EmbedBuilder().setColor(color).setTimestamp();
}

const embeds = {
  success: (title, description) =>
    base(colors.success).setTitle(`✅ ${title}`).setDescription(description || null),
  error: (title, description) =>
    base(colors.danger).setTitle(`❌ ${title}`).setDescription(description || null),
  warning: (title, description) =>
    base(colors.warning).setTitle(`⚠️ ${title}`).setDescription(description || null),
  info: (title, description) =>
    base(colors.info).setTitle(title).setDescription(description || null),
  plain: (color = colors.primary) => base(color),
};

module.exports = embeds;
