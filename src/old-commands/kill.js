const { SlashCommandBuilder } = require("@discordjs/builders");
const { guildId } = require("../config.json");
const Discord = require("discord.js");
const Client = require("../structures/client");

module.exports = {
  /* It's creating a new slash command. */
  data: new SlashCommandBuilder()
    .setName("kill")
    .setDescription("Stops the bot"),

  /**
   * It's a function that is called when the command is executed.
   * @param {Discord.CommandInteraction<Discord.CacheType>} interaction the interaction object called
   * @param {Client} client
   * @returns nuthin
   */
  async execute(interaction, client) {
    /* It's checking if the user has the role with the ID 795414220707463188. If they don't, it's
    sending a message to the user saying that they don't have the permissions to do that. */
    if (!interaction.member.roles.resolve("795414220707463188")) {
      interaction.reply({
        ephemeral: true,
        content: "You don't have the permissions to do that!",
      });
      return;
    }

    /* It's sending a message to the user who executed the command. */
    await interaction.reply({
      content: "Logging off!",
    });

    /* It's destroying the client, logging the user who killed the bot, and exiting the process. */
    client.destroy();
    console.log(`Bot killed by ${interaction.user.username} using /kill`);
    process.exit(0);
  },
};
