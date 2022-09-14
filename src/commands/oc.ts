import { SlashCommandBuilder } from "@discordjs/builders";
import * as Discord from "discord.js";
const MessageEmbed = Discord.MessageEmbed;
import mysql = require("mysql");
import dotenv = require("dotenv");

/* It's loading the `.env` file. */
dotenv.config();
console.log(process.env.DBPWD);
console.log(process.env);

// Redeclares Client in order to add a collection of commands
class Client extends Discord.Client {
	commands = new Discord.Collection();
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("oc")
		.setDescription("Get informations about an oc")
		.addStringOption((option) =>
			option
				.setName("name")
				.setDescription("The name of the oc")
				.setRequired(true)
		),

	async execute(
		interaction: Discord.CommandInteraction<Discord.CacheType>,
		client: Client
	) {
		var con = mysql.createConnection({
			host: "g61ai.myd.infomaniak.com",
			user: "g61ai_beucodi",
			password: process.env.DBPWD,
			database: "g61ai_r_wof_bot",
		});

		con.connect(function (err) {
			if (err) throw err;
			console.log("Connected!");

			query();
		});

		function query() {
			var sql = "SELECT * FROM oc WHERE name LIKE ?";
			var name = interaction.options.getString("name") || "";
			con.query(sql, [name], (err, res) => {
				if (err) throw err;
				let reply = new MessageEmbed().setFooter({
					text: "Register your oc with /oc-register!",
				});
				if (res.length > 0) {
					console.log(res[0]);
					reply.setTitle(`${name}:`);
					reply.addField("Name", name);
					if (res[0].pronouns) reply.addField("Pronouns", res[0].pronouns);
					reply.addField("Age", `${res[0].age}`);
					if (res[0].url) reply.setURL(res[0].url);
				} else {
					reply.setTitle(`${name} isn't registered!`);
				}
				interaction.reply({
					embeds: [reply],
				});
				con.end();
			});
		}
	},
};
