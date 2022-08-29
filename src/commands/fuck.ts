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
    .setName("fuck")
    .setDescription("Replies with fuck. Because why not"),

  async execute(
    interaction: Discord.CommandInteraction<Discord.CacheType>,
    client: Client
  ) {
    interaction.reply("fuck");
  },
};
