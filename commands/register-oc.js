const { SlashCommandBuilder } = require('@discordjs/builders');
const { guildId } = require("../config.json");
const Discord = require("discord.js");
const Discordx = require("discordx");
const MessageEmbed = Discord.MessageEmbed;
const mysql = require("mysql");
const { isGeneratorObject } = require('util/types');
const dotenv = require("dotenv");

/* It's loading the `.env` file. */
dotenv.config();

// Redeclares Client in order to add a collection of commands
class Client extends Discordx.Client {
    commands = new Discord.Collection();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("register-oc")
        .setDescription("Register your oc here, in order for other to find it!")
        .addStringOption(option =>
            option.setName("name")
                .setDescription("The name of your oc")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("age")
                .setDescription("The age of your oc")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("pronouns")
                .setDescription("The pronouns of your oc")
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName("url")
                .setDescription("The url to the message describing your oc in <#854858811101937704>")
                .setRequired(false)
        ),
    /**
     * 
     * @param {Discord.CommandInteraction<Discord.CacheType>} interaction the interaction object called
     * @param {Client} client
     * @returns nuthin
     */
    async execute(interaction, client) {
        var con = mysql.createConnection({
            host: "g61ai.myd.infomaniak.com",
            user: "g61ai_beucodi",
            password: process.env.DBPWD,
            database: "g61ai_r_wof_bot"
        });

        con.connect(function (err) {
            if (err) throw err;
            console.log("Connected!");
        });

        var sql = "SELECT id FROM rper WHERE snowflake = ?";

        var resultWriter;

        con.query(sql, [interaction.user.id], function (err, res) {
            if (err) throw err;

            if (res.length == 0) {
                console.log("Undef!");
                var sql = "INSERT INTO rper VALUES (null, ?, ?)";
                con.query(sql, [interaction.user.id, interaction.user.tag], (err, res) => {
                    if (err) throw err

                    sql = "SELECT id FROM rper WHERE snowflake LIKE ?";

                    con.query(sql, [interaction.user.id], function (err, res) {
                        if (err) throw err;
                        res;

                        insertOC(res);
                    });
                })
            } else {
                console.log(res[0]);
                insertOC(res[0].id);
            }
        });



        function insertOC(resultWriter) {
            var sql = "SELECT id FROM oc WHERE writer = ? AND name LIKE ?";
            con.query(sql, [resultWriter, interaction.options.getString("name")], function (err, res) {
                if (err) throw err;
                result = res;

                if (result.length == 0) {
                    var sql = "INSERT INTO oc VALUES (null, ?,?,?,?,?)";
                    var options = interaction.options
                    con.query(sql, [options.getString("name"), options.getString("pronouns"), options.getInteger("age"), resultWriter, options.getString("url")], (err, res) => {
                        if (err) throw err
                        dun();
                    })
                } else {
                    var sql = "update oc set age = ?, pronouns = ?, url = ? WHERE writer = ? AND name LIKE ?";
                    var options = interaction.options
                    con.query(sql, [options.getInteger("age"), options.getString("pronouns"), options.getString("url"), resultWriter, interaction.options.getString("name")], (err, res) => {
                        if (err) throw err
                        dun();
                    })
                }
            });
        }

        function dun() {
            interaction.reply("Added your oc into the database!");

            con.end();
        }
    },
};
