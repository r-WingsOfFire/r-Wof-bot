const { SlashCommandBuilder } = require("@discordjs/builders");
const { guildId } = require("../config.json");
const Discord = require("discord.js");
const Discordx = require("discordx");
const MessageEmbed = Discord.MessageEmbed;

// Redeclares Client in order to add a collection of commands
class Client extends Discordx.Client {
  commands = new Discord.Collection();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fuck")
    .setDescription("Replies with fuck. Because why not"),

  /**
   *
   * @param {Discord.CommandInteraction<Discord.CacheType>} interaction the interaction object called
   * @param {Client} client
   * @returns nuthin
   */
  async execute(interaction, client) {
    interaction.reply("fuck");
  },
};
