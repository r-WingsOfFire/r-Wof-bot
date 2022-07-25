import { Intents } from "discord.js";
import "reflect-metadata";
import { config } from "dotenv";
import { Client } from "./structures/client";

config();

const token = process.env.TOKEN;

if (token === undefined) {
  process.exit(-1);
}

const client = new Client(__dirname);

client.start(token);
