import type { Command } from "../types";
import { SlashCommandBuilder } from "@discordjs/builders";

export default {
  data: new SlashCommandBuilder()
    .setName("fuck")
    .setDescription("Replies with fuck. Because why not"),
  async execute(interaction, client) {
    interaction.reply("fuck");
  },
} as Command;
