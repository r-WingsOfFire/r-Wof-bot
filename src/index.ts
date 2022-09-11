/* It's importing the required modules. */
import fs = require("fs");
import path = require("path");

import { SlashCommandBuilder } from "@discordjs/builders";
import "reflect-metadata";
import { Intents } from "discord.js";
import Discord = require("discord.js");
import Discordx = require("discordx");

require("dotenv").config();

/* It's getting the token from the .env file. */
const token = process.env.TOKEN;

/* It's checking if the token is undefined. If it is, it exits the process with an exit code of -1. */
if (token === undefined) {
  console.log("No token found in .env file.");
  process.exit(-1);
}

// Redeclares Client in order to add a collection of commands
// Seems complicated but it's just long type names so that intellisense understands it
/* It's a Discord.Client that has a commands property that is a Discord.Collection of strings and
objects with a data property and an execute method */
class Client extends Discordx.Client {
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
}

// Create a new client instance
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
  ],
});

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

/* It's a listener that will be called when the client is ready. */
client.once("ready", async () => {
  console.log("Ready!");
  client.user?.setActivity("flying dragons!", { type: "WATCHING" });
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
    client.login(token);
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

client.login(token);
