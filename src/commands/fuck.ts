import { SlashCommandBuilder } from "@discordjs/builders";
import * as Discord from "discord.js";
const MessageEmbed = Discord.MessageEmbed;

// Redeclares Client in order to add a collection of commands
class Client extends Discord.Client {
	commands = new Discord.Collection();
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("fuck")
		.setDescription("Replies with fuck. Because why not"),

	async execute(
		interaction: Discord.CommandInteraction<Discord.CacheType>,
		client: Client
	) {
		interaction.reply("fuck");
	},
};
