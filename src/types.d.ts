import type { SlashCommandBuilder } from "@discordjs/builders";
import type * as Discord from "discord.js";
import type { Client } from "./structures/client";

interface CommandFunction {
  (
    interaction: Discord.CommandInteraction<"cached">,
    client: Client<true>
  ): void | Promise<void>;
}

interface Command {
  data: SlashCommandBuilder;
  execute: CommandFunction;
}

interface EventFunction<E extends keyof Discord.ClientEvents> {
  (
    client: Client<true>,
    ...args: Discord.ClientEvents[E]
  ): Promise<void> | void;
}

export interface Event<E extends keyof Discord.ClientEvents> {
  event: E;
  execute: EventFunction<E>;
}

export type GenericEvent = Event<keyof Discord.ClientEvents>;
