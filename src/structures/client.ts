import * as Discord from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import * as Discordx from "discordx";

interface CommandFunction {
  (
    interaction: Discord.CommandInteraction,
    client: Client
  ): void | Promise<void>;
}

interface Command {
  data: SlashCommandBuilder;
  execute: CommandFunction;
}

export class Client extends Discordx.Client {
  public commands = new Discord.Collection<string, Command>();
  public quoteBusy = false;
}
