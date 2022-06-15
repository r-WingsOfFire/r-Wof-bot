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
    .setName("flipacoin")
    .setDescription("Flips a swiss coin"),

  /**
   *
   * @param {Discord.CommandInteraction<Discord.CacheType>} interaction the interaction object called
   * @param {Client} client
   * @returns nuthin
   */
  async execute(interaction, client) {
    random = Math.random();
    if (random < 0.5) {
      interaction.reply({
        embeds: [
          new MessageEmbed()
            .setDescription("It's tails!")
            .setTitle("The coin says...")
            .setColor("BLUE")
            .setThumbnail(
              "https://cdn.discordapp.com/attachments/785186788003282987/792399120925065216/unknown.png"
            ),
        ],
      });
    } else if (random > 0.5) {
      interaction.reply({
        embeds: [
          new MessageEmbed()
            .setDescription("It's heads!")
            .setTitle("The coin says...")
            .setColor("BLUE")
            .setThumbnail(
              "https://cdn.discordapp.com/attachments/785186788003282987/792399253040922664/unknown.png"
            ),
        ],
      });
    } else {
      interaction.reply("It's... Oh, well the piece landed on its edge...");
    }
    // Almost impossible, but still funny
  },
};
