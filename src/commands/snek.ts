import { SlashCommandBuilder } from "@discordjs/builders";
import Discord = require("discord.js");
import Discordx = require("discordx");

// Redeclares Client in order to add a collection of commands
class Client extends Discordx.Client {
  commands = new Discord.Collection();
}

module.exports = {
  data: new SlashCommandBuilder().setName("snek").setDescription("snek"),

  async execute(
    interaction: Discord.CommandInteraction<Discord.CacheType>,
    client: Client
  ) {
    await interaction.reply({
      files: [
        {
          attachment:
            "https://cdn.discordapp.com/attachments/647616102339313667/795971177754525706/snek.jpg",
          name: "snek.jpg",
        },
      ],
    });
  },
};
