const { SlashCommandBuilder } = require("@discordjs/builders");
const { guildId } = require("../config.json");
const Discord = require("discord.js");
const Client = require("../structures/client");
const MessageEmbed = Discord.MessageEmbed;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pop")
    .setDescription("We love bubble wrap!"),

  /**
   *
   * @param {Discord.CommandInteraction<Discord.CacheType>} interaction the interaction object called
   * @param {Client} client
   * @returns nuthin
   */
  async execute(interaction, client) {
    interaction.reply({
      content:
        "||pop||||pop||||pop||||pop||||pop||||pop||||pop||||pop||||pop||\n\
||pop||||pop||||pop||||pop||||pop||||pop||||pop||||pop||||pop||\n\
||pop||||pop||||pop||||pop||||pop||||pop||||pop||||pop||||pop||\n\
||pop||||pop||||pop||||pop||||pop||||pop||||pop||||pop||||pop||\n\
||pop||||pop||||pop||||pop||||pop||||pop||||pop||||pop||||pop||",
    });
  },
};
