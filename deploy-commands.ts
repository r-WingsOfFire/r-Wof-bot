/* It's importing the required modules. */
import fs = require("fs");
import path = require("path");
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import dotenv = require("dotenv");
import { SlashCommandBuilder } from "@discordjs/builders";
var { clientId, guildId } = require("./config.json");

console.log("Launched!");

/* It's loading the `.env` file. */
dotenv.config();
const token = process.env.TOKEN;

/* It's checking if the `clientId` is defined in the `.env` file. If it is, it will set the `clientId`
variable to the value of the `clientId` in the `.env` file. */
if (process.env.clientId !== undefined) {
  clientId = process.env.clientId;
}

/* It's checking if the `guildId` is defined in the `.env` file. If it is, it will set the `guildId`
variable to the value of the `guildId` in the `.env` file. */
if (process.env.guildId !== undefined) {
  clientId = process.env.guildId;
}

console.log("Imported dotenv");

/* It's checking if the `token` is defined in the `.env` file. If it isn't, it will throw an error. */
if (token === undefined) {
  console.error("Invalid token: " + token);
  process.exit(-1);
}

console.log("Valid token");

/* It's looping through all the files in the `commands` folder and adding them to the `commands` array. */
const commands = [];
const commandsPath = path.join(__dirname, "src/commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".ts"));

/* It's looping through all the files in the `commands` folder and adding them to the `commands` array. */
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  commands.push(command.data.toJSON());
}

commands.push(
  new SlashCommandBuilder()
    .setName("reload")
    .setDescription("reloads the commands")
    .toJSON()
);

/* It's creating a new REST instance with the version of the Discord API being used. */
const rest = new REST({ version: "9" }).setToken(token);

/* It's registering the commands. */
rest
  .put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);
