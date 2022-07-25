import type { Command } from "../types";
import { SlashCommandBuilder } from "@discordjs/builders";
import * as Discord from "discord.js";

export default {
  data: new SlashCommandBuilder().setName("snek").setDescription("snek"),
  async execute(interaction, client) {
    await interaction.reply({
      files: [
        new Discord.MessageAttachment(
          "https://cdn.discordapp.com/attachments/647616102339313667/795971177754525706/snek.jpg",
          "snek.jpg"
        ),
      ],
    });
  },
} as Command;
