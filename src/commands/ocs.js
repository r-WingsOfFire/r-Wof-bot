const { SlashCommandBuilder } = require('@discordjs/builders');
const { guildId } = require("../../config.json");
const Discord = require("discord.js");
const Discordx = require("discordx");
const MessageEmbed = Discord.MessageEmbed;
const mysql = require("mysql");
const dotenv = require("dotenv");

/* It's loading the `.env` file. */
dotenv.config();

// Redeclares Client in order to add a collection of commands
class Client extends Discordx.Client {
    commands = new Discord.Collection();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ocs")
        .setDescription("Lists all the ocs a writer has.")
        .addUserOption(option =>
            option.setName("writer")
                .setDescription("The writer to query. If no one is mentionned, the query is at your name")
                .setRequired(false)),

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

            query();
        });

        function query() {
            var sql = "SELECT oc.name, oc.url FROM oc INNER JOIN rper r ON (r.id = oc.writer) WHERE r.snowflake LIKE ?";
            var result;
            var user = interaction.options.getUser("writer");
            if (!user) user = interaction.user
            con.query(sql, [user.id], (err, res) => {
                if (err) throw err;
                let reply = new MessageEmbed();
                if (res.length > 0) {
                    reply.setTitle(`List of the ocs for ${user.username}:`).setDescription("");
                    console.log(res);
                    res.forEach(OC => {
                        reply.setDescription(reply.description + `[${OC.name}](${OC.url})\n`);
                    });
                } else {
                    reply.setTitle(`${user.username} doesn't have any oc registered!`);
                }
                interaction.reply({
                    embeds: [reply]
                })
                con.end();
            });
        }
    },
};
