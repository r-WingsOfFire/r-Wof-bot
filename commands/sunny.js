const { SlashCommandBuilder } = require("@discordjs/builders");
const { guildId } = require("../config.json");
const Discord = require("discord.js");
const Discordx = require("discordx");
const { randomInt } = require("crypto");
const MessageEmbed = Discord.MessageEmbed;

// Redeclares Client in order to add a collection of commands
class Client extends Discordx.Client {
  commands = new Discord.Collection();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sunny")
    .setDescription("sends a nice sunny quote"),

  /**
   *
   * @param {Discord.CommandInteraction<Discord.CacheType>} interaction the interaction object called
   * @param {Client} client
   * @returns nuthin
   */
  async execute(interaction, client) {
    const { quotes } = require("../quotes.json");
    const sunnyQuotes = quotes.filter((quote) => quote.character === "Sunny");
    interaction.reply({
      embeds: [
        new MessageEmbed()
          .setDescription(
            `"${sunnyQuotes[randomInt(0, sunnyQuotes.length)].quote}"`
          )
          .setFooter("-Sunny")
          .setColor("GOLD"),
      ],
    });
  },
};
