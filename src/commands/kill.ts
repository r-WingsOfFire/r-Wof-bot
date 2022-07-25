import type { Command } from "../types";
import { SlashCommandBuilder } from "@discordjs/builders";

export default {
  data: new SlashCommandBuilder()
    .setName("kill")
    .setDescription("Stops the bot"),
  async execute(interaction, client) {
    await interaction.reply({
      content: "Logging off!",
    });

    /* It's destroying the client, logging the user who killed the bot, and exiting the process. */
    client.destroy();
    console.log(`Bot killed by ${interaction.user.username} using /kill`);
    process.exit(0);
  },
} as Command;
