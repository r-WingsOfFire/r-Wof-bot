import { config } from "dotenv";
import clientOptions from "./config/config.json";
import { Client } from "./structures/client";
import { ClientOptions } from "./types";

config();

const token = process.env.TOKEN;

if (token === undefined) {
  throw new Error("Missing token");
}

const client = new Client(clientOptions as ClientOptions, __dirname);

client.start(token);
