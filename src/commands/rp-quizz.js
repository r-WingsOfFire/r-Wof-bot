const { SlashCommandBuilder } = require('@discordjs/builders');
const { guildId } = require("../../config.json");
const Discord = require("discord.js");
const Discordx = require("discordx");
const MessageEmbed = Discord.MessageEmbed;
const { questions } = require("../../rp-quizz.json");

// Redeclares Client in order to add a collection of commands
class Client extends Discordx.Client {
	commands = new Discord.Collection();
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("rp-quizz")
		.setDescription("Solve this quizz to get access to the RP!"),

	/**
	 * 
	 * @param {Discord.CommandInteraction<Discord.CacheType>} interaction the interaction object called
	 * @param {Client} client
	 * @returns nuthin
	 */
	async execute(interaction, client) {

	},
};
