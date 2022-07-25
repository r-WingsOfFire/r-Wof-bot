import type { Command } from "../types";
import { SlashCommandBuilder } from "@discordjs/builders";
import * as Discord from "discord.js";
import * as MySQL from "mysql";

export default {
  data: new SlashCommandBuilder()
    .setName("register-oc")
    .setDescription("Register your oc here, in order for other to find it!")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The name of your oc")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("pronouns")
        .setDescription("The pronouns of your oc")
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName("age")
        .setDescription("The age of your oc")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription(
          "The url to the message describing your oc in <#854858811101937704>"
        )
        .setRequired(false)
    ),
  async execute(interaction, client) {
    const name = interaction.options.getString("name", true);
    const pronouns = interaction.options.getString("pronouns");
    const url = interaction.options.getString("url");
    const messageId = url?.split("/").at(-1);
    const channel = client.channels.cache.get("854858811101937704");

    if (channel && !channel?.isText()) {
      return;
    }

    const resolvedMessage = messageId
      ? await channel?.messages?.fetch(messageId)
      : null;
    const messageContent = resolvedMessage?.content
      .split("\n")
      .map((line) => line.toLowerCase());

    const ageLine = messageContent
      ?.filter((line) => line.includes("age: "))[0]
      .split("age: ")[1];

    const age =
      interaction.options.getInteger("age") ??
      (ageLine ? parseInt(ageLine) : undefined);

    if (!age) {
      interaction.reply({
        embeds: [
          new Discord.MessageEmbed()
            .setColor("RED")
            .setTitle("Error!")
            .setDescription(
              "Error parsing property: Age. Age is undefined, or is not labelled age: in message (case insensitive)"
            ),
        ],
      });
    }

    const con = MySQL.createConnection({
      host: "g61ai.myd.infomaniak.com",
      user: "g61ai_beucodi",
      password: process.env.DBPWD,
      database: "g61ai_r_wof_bot",
    });

    con.connect((err) => {
      if (err) throw err;
      console.log("Connected!");
    });

    const sql = "SELECT id FROM rper WHERE snowflake = ?";

    con.query(sql, [interaction.user.id], (err, res) => {
      if (err) throw err;

      if (res.length == 0) {
        console.log("Undef!");
        let sql = "INSERT INTO rper VALUES (null, ?, ?)";
        con.query(
          sql,
          [interaction.user.id, interaction.user.tag],
          (err, res) => {
            if (err) throw err;

            sql = "SELECT id FROM rper WHERE snowflake LIKE ?";

            con.query(sql, [interaction.user.id], (err, res) => {
              if (err) throw err;
              res;

              insertOC(res);
            });
          }
        );
      } else {
        console.log(res[0]);
        insertOC(res[0].id);
      }
    });

    function insertOC(resultWriter: string) {
      const sql = "SELECT id FROM oc WHERE writer = ? AND name LIKE ?";
      con.query(sql, [resultWriter, name], (err, result) => {
        if (err) throw err;

        if (result.length === 0) {
          const sql = "INSERT INTO oc VALUES (null, ?,?,?,?,?)";

          con.query(sql, [name, pronouns, age, resultWriter, url], (err) => {
            if (err) throw err;
            dun();
          });
        } else {
          const sql =
            "update oc set age = ?, pronouns = ?, url = ? WHERE writer = ? AND name LIKE ?";

          con.query(sql, [age, pronouns, url, resultWriter, name], (err) => {
            if (err) throw err;
            dun();
          });
        }
      });
    }

    function dun() {
      interaction.reply("Added your oc into the database!");

      con.end();
    }
  },
} as Command;
