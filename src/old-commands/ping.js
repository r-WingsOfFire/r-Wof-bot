const { SlashCommandBuilder } = require("@discordjs/builders");
const { guildId } = require("../config.json");
const Discord = require("discord.js");
const Client = require("../structures/client");
const MessageEmbed = Discord.MessageEmbed;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with pong and sends the ping of the bot"),

  /**
   *
   * @param {Discord.CommandInteraction<Discord.CacheType>} interaction the interaction object called
   * @param {Client} client
   * @returns nuthin
   */
  async execute(interaction, client) {
    var ping = Date.now() - interaction.createdTimestamp;

    if (ping >= 0) {
      if (ping <= 500) color = "GREEN";
      if (ping <= 1000 && ping > 500) color = "YELLOW";
      if (ping <= 1500 && ping > 1000) color = "ORANGE";
      if (ping <= 2000 && ping > 1500) color = "RED";
      if (ping > 2000) color = "PURPLE";
      const PingEmbed = new MessageEmbed()
        .setColor(color)
        .setTitle("Pong! :ping_pong:")
        .setDescription(`${ping}ms`);
      await interaction.reply({ embeds: [PingEmbed] });
    } else {
      const PingEmbed = new MessageEmbed()
        .setColor("RANDOM")
        .setTitle("Pong? :ping_pong:")
        .setDescription(`Emmm it is negative? ${ping} ms...`);
      await interaction.reply({ embeds: [PingEmbed] });
    }
    console.log(`${interaction.user.username} used ping`);
  },
};
