import type { Command } from "../types";
import { SlashCommandBuilder } from "@discordjs/builders";
import * as Discord from "discord.js";
import * as MySQL from "mysql";

export default {
  data: new SlashCommandBuilder()
    .setName("ocs")
    .setDescription("Lists all the ocs a writer has.")
    .addUserOption((option) =>
      option
        .setName("writer")
        .setDescription(
          "The writer to query. If no one is mentionned, the query is at your name"
        )
        .setRequired(false)
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
      const sql =
        "SELECT oc.name, oc.url FROM oc INNER JOIN rper r ON (r.id = oc.writer) WHERE r.snowflake LIKE ?";
      const user = interaction.options.getUser("writer") ?? interaction.user;

      con.query(sql, [user.id], (err, res: any[]) => {
        if (err) throw err;

        const reply = new Discord.MessageEmbed();

        if (res.length > 0) {
          reply
            .setTitle(`List of the ocs for ${user.username}:`)
            .setDescription("");

          console.log(res);

          res.forEach((OC) => {
            reply.setDescription(
              reply.description + `[${OC.name}](${OC.url})\n`
            );
          });
        } else {
          reply.setTitle(`${user.username} doesn't have any oc registered!`);
        }

        interaction.reply({
          embeds: [reply],
        });

        con.end();
      });
    }
  },
} as Command;
