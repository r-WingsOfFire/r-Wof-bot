import * as Discord from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import * as Discordx from "discordx";
import * as fs from "fs";
import * as path from "path";

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

  public constructor(private dir: string) {
    super({
      intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MEMBERS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
      ],
    });
  }

  public async load(): Promise<void> {
    const commandsPath = path.join(this.dir, "commands");
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => path.extname(file) === ".js");

    /* It's importing all the commands from the commands folder. */
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command: Command = await import(filePath);
      // Set a new item in the Collection
      // With the key as the command name and the value as the exported module
      this.commands.set(command.data.name, command);
    }

    // /* It's a listener that will be called when the client is ready. */
    // this.once("ready", async () => {
    //   console.log("Ready!");
    //   this.user?.setActivity("flying dragons!", { type: "WATCHING" });
    // });

    // this.on("interactionCreate", async (interaction) => {
    //   /* It's checking if the interaction is a command. If it isn't, it returns. */
    //   if (!interaction.isCommand()) return;

    //   if (interaction.commandName == "reload") {
    //     interaction.reply({
    //       embeds: [
    //         new Discord.MessageEmbed().setColor("GOLD").setTitle("Reloading!"),
    //       ],
    //     });
    //     const commandsPath = path.join(__dirname, "commands");
    //     const commandFiles = fs
    //       .readdirSync(commandsPath)
    //       .filter((file) => file.endsWith(".js"));

    //     /* It's importing all the commands from the commands folder. */
    //     for (const file of commandFiles) {
    //       const filePath = path.join(commandsPath, file);
    //       const command = require(filePath);
    //       // Set a new item in the Collection
    //       // With the key as the command name and the value as the exported module
    //       this.commands.set(command.data.name, command);
    //     }
    //     this.destroy();
    //     this.login(token);
    //     return;
    //   }
    //   /* It's getting the command from the client's commands collection. */
    //   const command = client.commands.get(interaction.commandName);

    //   /* It's checking if the command exists. If it doesn't, it returns. */
    //   if (!command) return;

    //   /* It's trying to execute the command, and if it fails, it will reply with an error message. */
    //   try {
    //     await command.execute(interaction, client);
    //   } catch (error) {
    //     console.error(error);
    //     await interaction.reply({
    //       content: "There was an error while executing this command!",
    //       ephemeral: true,
    //     });
    //   }
    // });
  }

  public async start(token: string): Promise<void> {
    await this.login(token);
    await this.load();
  }
}
