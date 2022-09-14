import { SlashCommandBuilder } from "@discordjs/builders";
import * as Discord from "discord.js";
const MessageEmbed = Discord.MessageEmbed;

// Redeclares Client in order to add a collection of commands
class Client extends Discord.Client {
	commands = new Discord.Collection();
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("pop")
		.setDescription("We love bubble wrap!"),

	async execute(
		interaction: Discord.CommandInteraction<Discord.CacheType>,
		client: Client
	) {
		interaction.reply({
			content:
				"||pop||||pop||||pop||||pop||||pop||||pop||||pop||||pop||||pop||\n\
||pop||||pop||||pop||||pop||||pop||||pop||||pop||||pop||||pop||\n\
||pop||||pop||||pop||||pop||||pop||||pop||||pop||||pop||||pop||\n\
||pop||||pop||||pop||||pop||||pop||||pop||||pop||||pop||||pop||\n\
||pop||||pop||||pop||||pop||||pop||||pop||||pop||||pop||||pop||",
		});
	},
};
