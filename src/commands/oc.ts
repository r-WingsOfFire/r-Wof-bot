import type { Command } from "../types";
import { SlashCommandBuilder } from "@discordjs/builders";
import * as Discord from "discord.js";
import { connection } from "../util/sql";

export default {
  data: new SlashCommandBuilder()
    .setName("oc")
    .setDescription("Get informations about an oc")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The name of the oc")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const sql = "SELECT * FROM oc WHERE name LIKE ?";
    const name = interaction.options.getString("name", true);

    connection.query(sql, [name], (err, res) => {
      if (err) throw err;

      const embed = new Discord.MessageEmbed().setFooter({
        text: "Register your oc with /oc-register!",
      });

      if (res.length > 0) {
        console.log(res[0]);

        embed.setTitle(`${name}:`);
        embed.addFields(
          { name: "Name", value: name },
          { name: "Age", value: res[0].age },
          { name: "Pronouns", value: res[0].pronouns ?? "Unspecified" }
        );

        if (res[0].url) embed.setURL(res[0].url);
      } else {
        embed.setTitle(`${name} isn't registered!`);
      }

      interaction.reply({
        embeds: [embed],
      });
    });
  },
} as Command;
