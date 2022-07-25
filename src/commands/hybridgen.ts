import { SlashCommandBuilder } from "@discordjs/builders";
import * as Discord from "discord.js";
import { random } from "../util/misc";
import type { Command } from "../types";

// Tribes constants
const pyrrhianTribes: Tribe[] = [
  "skywing",
  "seawing",
  "icewing",
  "nightwing",
  "sandwing",
  "mudwing",
  "rainwing",
];
const pantalanTribes: Tribe[] = ["leafwing", "hivewing", "silkwing"];

const colorMap: {
  [key: string]: Discord.ColorResolvable;
} = {
  skywing: "RED",
  seawing: "NAVY",
  nightwing: "DARK_PURPLE",
  sandwing: "GOLD",
  rainwing: "RANDOM",
  icewing: 0xddffff,
  mudwing: 0x70543e,
  leafwing: 0x30b700,
  silkwing: "RANDOM",
  hivewing: "DEFAULT",
};

type PyrrhianTribe =
  | "skywing"
  | "seawing"
  | "icewing"
  | "nightwing"
  | "sandwing"
  | "mudwing"
  | "rainwing";

type PantalanTribe = "leafwing" | "hivewing" | "silkwing";

type Tribe = PyrrhianTribe | PantalanTribe;

export default {
  data: new SlashCommandBuilder()
    .setName("hybridgen")
    .setDescription("Randomly generates a hybrid combination you can use!")
    .addBooleanOption((option) =>
      option
        .setName("pantala")
        .setDescription("whether or not should pantalan tribes be possible.")
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName("pyrrhia")
        .setDescription("whether or not should pyrrhian tribes be possible.")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const pyrrhian = interaction.options.getBoolean("pyrrhia", true);
    const pantalan = interaction.options.getBoolean("pantala", true);

    console.log(pyrrhian);
    console.log(pantalan);

    if (!pyrrhian && !pantalan) {
      await interaction.reply({
        content: "Please select at least one of the options!",
        ephemeral: true,
      });

      return;
    }

    const list = [
      ...(pyrrhian ? pyrrhianTribes : []),
      ...(pantalan ? pantalanTribes : []),
    ];

    const firstHybridTribe = random(list);
    const secondHybridTribe = random(list);

    const color = colorMap[firstHybridTribe];

    interaction.reply({
      embeds: [
        new Discord.MessageEmbed()
          .setTitle("I suggest...")
          .setDescription(
            `${firstHybridTribe} x ${secondHybridTribe}. What do you think about it?`
          )
          .setColor(color),
      ],
    });
  },
} as Command;
