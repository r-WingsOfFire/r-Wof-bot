import type { Command } from "../types";
import { SlashCommandBuilder } from "@discordjs/builders";

export default {
  data: new SlashCommandBuilder()
    .setName("kill")
    .setDescription("Stops the bot"),
  async execute(interaction, client) {
    console.log("kill");
    /* It's checking if the user has the role with the ID 795414220707463188. If they don't, it's
    sending a message to the user saying that they don't have the permissions to do that. */
    if (!interaction.member?.roles.cache.has("795414220707463188")) {
      interaction.reply({
        ephemeral: true,
        content: "You don't have the permissions to do that!",
      });

      return;
    }

    await interaction.reply({
      content: "Logging off!",
    });

    /* It's destroying the client, logging the user who killed the bot, and exiting the process. */
    client.destroy();
    console.log(`Bot killed by ${interaction.user.username} using /kill`);
    process.exit(0);
  },
} as Command;
