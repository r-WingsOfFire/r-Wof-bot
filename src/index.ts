/* It's importing the required modules. */
import * as fs from "fs";
import * as path from "path";

import { SlashCommandBuilder } from "@discordjs/builders";
import "reflect-metadata";
import { Intents } from "discord.js";
import * as Discord from "discord.js";
import fetch from "node-fetch";

require("dotenv").config();

// Redeclares Client in order to add a collection of commands
// Seems complicated but it's just long type names so that intellisense understands it
/* It's a Discord.Client that has a commands property that is a Discord.Collection of strings and
objects with a data property and an execute method */
class Client extends Discord.Client {
	commands = new Discord.Collection<
		string,
		{
			data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
			execute(
				interaction: Discord.CommandInteraction<Discord.CacheType>,
				client: Client
			): Promise<void>;
		}
	>();
	quoteBusy = false;
	rpQuizzFailed: Map<Discord.Snowflake, number>;
	lastRedditPost = "";
	posting = false;
	constructor(options: Discord.ClientOptions) {
		super(options);
		this.rpQuizzFailed = new Map<Discord.Snowflake, number>();
	}
}

// Create a new client instance
const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_MESSAGES,
	],
});


//define constants
const TOKEN = process.env.TOKEN;
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
	.readdirSync(commandsPath)
	.filter((file) => file.endsWith(".ts"));

/* It's importing all the commands from the commands folder. */
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

/* It's checking if the token is undefined. If it is, it exits the process with an exit code of -1. */
if (TOKEN === undefined) {
	console.log("No token found in .env file.");
	process.exit(-1);
}

const fetchReddit = async () => {
	//avoid duplicate posts
	if (client.posting)
		return;

	client.posting = true;
	try {
		console.log("Posting!");

		let guild = await client.guilds.fetch("716601325269549127");
		if (client.lastRedditPost === "") {
			client.lastRedditPost = (await (await fetch("https://www.reddit.com/r/WingsOfFire/new.json")).json()).data.children[0].data.name;
		}

		let response = await fetch("https://www.reddit.com/r/wingsoffire/new.json");
		let json = (await response.json()).data;

		if (json.children[0].data.name === client.lastRedditPost) {
			console.log("No new posts");
			return;
		}

		console.log("Posts available!");
		let latestPost = client.lastRedditPost;
		client.lastRedditPost = json.children[0].data.name;

		let children: any[] = [];
		let posted = false;
		json.children.forEach((child: any) => {
			if (posted)
				return;

			if (child.data.name === latestPost) {
				posted = true;
				return;
			}
			children.push(child);
		});

		console.log("Posting: " + children.length);

		let channel = guild.channels.cache.get("716617066261643314") as Discord.TextChannel | undefined;
		if (!channel) {
			console.log("Channel not found. Returning.");
			return;
		}
		const CHANNEL = channel as Discord.TextChannel;

		children.forEach((child: any) => {
			let embed = new Discord.MessageEmbed()
				.setTitle(child.data.title)
				.setDescription(child.data.selftext.length > 254 ? child.data.selftext.substring(0, 252) + "..." : child.data.selftext)
				.setColor("RED")
				.setAuthor({ name: child.data.author })
				.setURL(`https://www.reddit.com${child.data.permalink}`)
				.setFooter(child.data.link_flair_text ? child.data.link_flair_text : "No flair");
			if (child.data.is_gallery) {
				embed.setThumbnail(child.data.thumbnail);
			} else if (child.data.is_reddit_media_domain) {
				embed.setImage(child.data.url_overridden_by_dest);
			} else if (child.data.thumbnail !== "self") {
				embed.setThumbnail(child.data.thumbnail);
			}
			CHANNEL.send({
				embeds: [
					embed
				]
			});
		});
		client.posting = false;
	} catch (e) {
		console.log(e);
		client.posting = false;
	}
};

/* It's a listener that will be called when the client is ready. */
client.once("ready", async () => {
	console.log("Ready!");
	console.log("At " + new Date(Date.now()).toTimeString());
	client.user?.setActivity("flying dragons!", { type: "WATCHING" });
	setInterval(() => {
		client.rpQuizzFailed.forEach((v, k) => {
			if (v - 1 <= 0)
				client.rpQuizzFailed.delete(k);
			else
				client.rpQuizzFailed.set(k, v - 1);
		});
	}, 60_000);

	setInterval(fetchReddit, 30_000);
	fetchReddit();
});

client.on("interactionCreate", async (interaction) => {
	/* It's checking if the interaction is a command. If it isn't, it returns. */
	if (!interaction.isCommand()) return;

	if (interaction.commandName == "reload") {
		interaction.reply({
			embeds: [
				new Discord.MessageEmbed().setColor("GOLD").setTitle("Reloading!"),
			],
		});
		const commandsPath = path.join(__dirname, "commands");
		const commandFiles = fs
			.readdirSync(commandsPath)
			.filter((file) => file.endsWith(".js"));

		/* It's importing all the commands from the commands folder. */
		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const command = require(filePath);
			// Set a new item in the Collection
			// With the key as the command name and the value as the exported module
			client.commands.set(command.data.name, command);
		}
		client.destroy();
		client.login(TOKEN);
		return;
	}
	/* It's getting the command from the client's commands collection. */
	const command = client.commands.get(interaction.commandName);

	/* It's checking if the command exists. If it doesn't, it returns. */
	if (!command) return;

	/* It's trying to execute the command, and if it fails, it will reply with an error message. */
	try {
		await command.execute(interaction, client);
	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: "There was an error while executing this command!",
			ephemeral: true,
		});
	}
});

client.login(TOKEN);
