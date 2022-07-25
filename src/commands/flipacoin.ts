import type { Command } from "../types";
import { SlashCommandBuilder } from "@discordjs/builders";
import * as Discord from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("flipacoin")
    .setDescription("Flips a swiss coin"),
  async execute(interaction, client) {
    let random = Math.random();
    if (random < 0.5) {
      interaction.reply({
        embeds: [
          new Discord.MessageEmbed()
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
          new Discord.MessageEmbed()
            .setDescription("It's heads!")
            .setTitle("The coin says...")
            .setColor("BLUE")
            .setThumbnail(
              "https://cdn.discordapp.com/attachments/785186788003282987/792399253040922664/unknown.png"
            ),
        ],
      });
    } else {
      // Almost impossible, but still funny
      interaction.reply("It's... Oh, well the piece landed on its edge...");
    }
  },
} as Command;
