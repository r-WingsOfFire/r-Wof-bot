import type { Command } from "../types";
import { SlashCommandBuilder } from "@discordjs/builders";
import * as Discord from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("issue")
    .setDescription("Refer to this if you found an issue"),
  async execute(interaction, client) {
    interaction.reply({
      embeds: [
        new Discord.MessageEmbed()
          .setTitle("Report an issue")
          .setDescription(
            "Please report any issues you find to the [GitHub repository](https://github.com/r-WingsOfFire/r-Wof-bot/issues). You can also use <#717118310134579211>, and ping @bot helper. If the issue is a bug, please include the steps to reproduce the bug. If the issue is a feature request, please include a description of the feature. In the case the issue is compromising the bot's token security, please include the token in the issue, such as it gets reset, and DM <@373515998000840714> immediately."
          )
          .setColor("#ff0000")
          .setFooter({ text: "Thanks for your help!" }),
      ],
    });
  },
} as Command;
