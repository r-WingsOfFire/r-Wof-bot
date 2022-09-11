import { SlashCommandBuilder } from "@discordjs/builders";
import Discord = require("discord.js");
import Discordx = require("discordx");
import { randomInt } from "crypto";
const MessageEmbed = Discord.MessageEmbed;

// Redeclares Client in order to add a collection of commands
class Client extends Discordx.Client {
  commands = new Discord.Collection();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sunny")
    .setDescription("sends a nice sunny quote"),

  async execute(
    interaction: Discord.CommandInteraction<Discord.CacheType>,
    client: Client
  ) {
    const { quotes } = require("../../quotes.json");
    const sunnyQuotes = quotes.filter(
      (quote: { character: string; quote: string }) =>
        quote.character === "Sunny"
    );
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
