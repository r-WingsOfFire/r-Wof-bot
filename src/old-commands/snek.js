const { SlashCommandBuilder } = require("@discordjs/builders");
const { guildId } = require("../config.json");
const Discord = require("discord.js");
const Client = require("../structures/client");

module.exports = {
  data: new SlashCommandBuilder().setName("snek").setDescription("snek"),

  /**
   *
   * @param {Discord.CommandInteraction<Discord.CacheType>} interaction the interaction object called
   * @param {Client} client
   * @returns nuthin
   */
  async execute(interaction, client) {
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
