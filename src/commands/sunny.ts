import type { Command } from "../types";
import { SlashCommandBuilder } from "@discordjs/builders";
import * as Discord from "discord.js";
import { quotes } from "../config/quotes.json";
import { randomInteger } from "../util/misc";

const sunnyQuotes = quotes.filter((quote) => quote.character === "Sunny");

export default {
  data: new SlashCommandBuilder()
    .setName("sunny")
    .setDescription("sends a nice sunny quote"),
  async execute(interaction, client) {
    interaction.reply({
      embeds: [
        new Discord.MessageEmbed()
          .setDescription(
            `"${sunnyQuotes[randomInteger(0, sunnyQuotes.length)].quote}"`
          )
          .setFooter({ text: "-Sunny" })
          .setColor("GOLD"),
      ],
    });
  },
} as Command;
