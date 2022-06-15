const { SlashCommandBuilder  } = require('@discordjs/builders');
const { guildId } = require("../config.json");
const Discord = require("discord.js");
const Discordx = require("discordx");

// Redeclares Client in order to add a collection of commands
// Seems complicated but it's just long type names so that intellisense understands it
class Client extends Discordx.Client {
    commands = new Discord.Collection();
}

module.exports = {
	data: new SlashCommandBuilder()
    .setName("Name")
    .setDescription("Description")
    .addUserOption(option =>
        option.setName("option")
        .setDescription("description")
        .setRequired(true)),

    /**
     * 
     * @param {Discord.CommandInteraction<Discord.CacheType>} interaction the interaction object called
     * @param {Client} client
     * @returns nuthin
     */
	async execute(interaction, client) {
		//execute code here
	},
};
