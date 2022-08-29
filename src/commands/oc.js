const { SlashCommandBuilder } = require('@discordjs/builders');
const { guildId } = require("../../config.json");
const Discord = require("discord.js");
const Discordx = require("discordx");
const MessageEmbed = Discord.MessageEmbed;
const mysql = require("mysql");
const dotenv = require("dotenv");

/* It's loading the `.env` file. */
dotenv.config();
console.log(process.env.DBPWD);
console.log(process.env);

// Redeclares Client in order to add a collection of commands
class Client extends Discordx.Client {
    commands = new Discord.Collection();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("oc")
        .setDescription("Get informations about an oc")
        .addStringOption(option =>
            option.setName("name")
                .setDescription("The name of the oc")
                .setRequired(true)),

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
            var sql = "SELECT * FROM oc WHERE name LIKE ?";
            var name = interaction.options.getString("name");
            con.query(sql, [name], (err, res) => {
                if (err) throw err;
                let reply = new MessageEmbed().setFooter({ text: "Register your oc with /oc-register!" });
                if (res.length > 0) {
                    console.log(res[0]);
                    reply.setTitle(`${name}:`)
                    reply.addField("Name", name)
                    if (res[0].pronouns)
                        reply.addField("Pronouns", res[0].pronouns)
                    reply.addField("Age", `${res[0].age}`)
                    if (res[0].url)
                        reply.setURL(res[0].url);
                } else {
                    reply.setTitle(`${name} isn't registered!`);
                }
                interaction.reply({
                    embeds: [reply]
                })
                con.end();
            });
        }
    },
};
