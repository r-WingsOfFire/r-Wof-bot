import type { Command } from "../types";
import { SlashCommandBuilder } from "@discordjs/builders";
import * as Discord from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with pong and sends the ping of the bot"),
  async execute(interaction, client) {
    const ping = client.ws.ping;

    let color: Discord.ColorResolvable = "DEFAULT";

    if (ping <= 500) color = "GREEN";
    if (ping <= 1000 && ping > 500) color = "YELLOW";
    if (ping <= 1500 && ping > 1000) color = "ORANGE";
    if (ping <= 2000 && ping > 1500) color = "RED";
    if (ping > 2000) color = "PURPLE";

    const embed = new Discord.MessageEmbed()
      .setColor(color)
      .setTitle("Pong! :ping_pong:")
      .setDescription(`${ping}ms`);

    await interaction.reply({ embeds: [embed] });

    console.log(`${interaction.user.username} used ping`);
  },
} as Command;
