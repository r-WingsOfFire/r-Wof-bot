import type { Command } from "../types";
import { SlashCommandBuilder } from "@discordjs/builders";
import * as Discord from "discord.js";
import MySQL from "mysql";

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
    const con = MySQL.createConnection({
      host: "g61ai.myd.infomaniak.com",
      user: "g61ai_beucodi",
      password: process.env.DBPWD,
      database: "g61ai_r_wof_bot",
    });

    con.connect((err) => {
      if (err) throw err;
      console.log("Connected!");

      query();
    });

    function query() {
      const sql = "SELECT * FROM oc WHERE name LIKE ?";
      const name = interaction.options.getString("name", true);

      con.query(sql, [name], (err, res) => {
        if (err) throw err;

        const embed = new Discord.MessageEmbed().setFooter({
          text: "Register your oc with /oc-register!",
        });

        if (res.length > 0) {
          console.log(res[0]);

          embed.setTitle(`${name}:`);
          embed.addField("Name", name);
          if (res[0].pronouns) embed.addField("Pronouns", res[0].pronouns);
          embed.addField("Age", `${res[0].age}`);
          if (res[0].url) embed.setURL(res[0].url);
        } else {
          embed.setTitle(`${name} isn't registered!`);
        }

        interaction.reply({
          embeds: [embed],
        });

        con.end();
      });
    }
  },
} as Command;
