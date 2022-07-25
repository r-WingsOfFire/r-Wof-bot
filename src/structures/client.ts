import * as Discord from "discord.js";
import globCB from "glob";
import * as path from "path";
import { promisify } from "util";
import { Command, GenericEvent, ClientOptions } from "../types";

const glob = promisify(globCB);

export class Client<T extends boolean = boolean> extends Discord.Client<T> {
  public declare options: ClientOptions;
  public commands = new Discord.Collection<string, Command>();
  public quoteBusy = false;
  private commandsPath: string;
  private eventsPath: string;

  public constructor(options: ClientOptions, private dir: string) {
    super(options);

    this.options = options;
    this.commandsPath = path.join(this.dir, "commands");
    this.eventsPath = path.join(this.dir, "events");
  }

  public async load(): Promise<void> {
    const commandFiles = await glob(
      path.join(this.commandsPath, "**", "*.{ts,js}")
    );
    const eventFiles = await glob(path.join(this.eventsPath, "*.{ts,js}"));

    for (const path of commandFiles) {
      const file = await import(path);

      const command: Command = file.default ?? file;

      this.commands.set(command.data.name, command);

      console.log(`Loaded command ${command.data.name}`);
    }

    for (const path of eventFiles) {
      const file = await import(path);

      const event: GenericEvent = file.default ?? file;

      this.on(event.event, event.execute.bind(null, this as Client<true>));

      console.log(`Loaded event ${event.event}`);
    }

    const applicationCommandData = this.commands.map((command) =>
      command.data.toJSON()
    );

    this.application?.commands.set(
      applicationCommandData,
      this.options.guildId
    );
  }

  public async start(token: string): Promise<void> {
    await this.login(token);
    await this.load();
    this.emit("ready", this as Client<true>);
  }
}
