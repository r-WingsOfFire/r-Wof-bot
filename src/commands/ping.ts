import { SlashCommandBuilder } from "@discordjs/builders";
import Discord = require("discord.js");
import Discordx = require("discordx");
const MessageEmbed = Discord.MessageEmbed;

// Redeclares Client in order to add a collection of commands
class Client extends Discordx.Client {
  commands = new Discord.Collection();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with pong and sends the ping of the bot"),

  async execute(
    interaction: Discord.CommandInteraction<Discord.CacheType>,
    client: Client
  ) {
    var ping = Date.now() - interaction.createdTimestamp;
    let color: Discord.ColorResolvable;
    if (ping >= 0) {
      if (ping <= 500) color = "GREEN";
      else if (ping <= 1000) color = "YELLOW";
      else if (ping <= 1500) color = "ORANGE";
      else if (ping <= 2000) color = "RED";
      else color = "PURPLE";
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
