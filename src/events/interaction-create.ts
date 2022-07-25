import type { Event } from "../types";
import * as Discord from "discord.js";

export default {
  event: "interactionCreate",
  execute: async (client, interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === "reload") {
      interaction.reply({
        embeds: [
          new Discord.MessageEmbed().setColor("GOLD").setTitle("Reloading!"),
        ],
      });

      client.destroy();
      await client.start(process.env.TOKEN as string);
      return;
    }

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(
        interaction as Discord.CommandInteraction<"cached">,
        client
      );
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
} as Event<"interactionCreate">;
