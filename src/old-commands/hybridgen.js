const { SlashCommandBuilder } = require("@discordjs/builders");
const { guildId } = require("../../config.json");
const Discord = require("discord.js");
const Client = require("../structures/client");
const MessageEmbed = Discord.MessageEmbed;

// Tribes constants
const pyhrrianTribes = [
  "skywing",
  "seawing",
  "icewing",
  "nightwing",
  "sandwing",
  "mudwing",
  "rainwing",
];
const pantalanTribes = ["leafwing", "hivewing", "silkwing"];

/** Picks a random tribe from Pantala
 * @returns {String} The tribe that got picked
 */
function randomPantala() {
  return pantalanTribes[Math.floor(Math.random() * pantalanTribes.length)];
}

/** Picks a random tribe from Pyrrhia
 * @returns {String} The tribe that got picked
 */
function randomPyrrhia() {
  return pyhrrianTribes[Math.floor(Math.random() * pyhrrianTribes.length)];
}

/** Picks a random tribe
 * @returns {String} The tribe that got picked
 */
function randomTribe() {
  if (Math.random() < 0.5) {
    return randomPyrrhia();
  } else {
    return randomPantala();
  }
}

module.exports = {
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

  /**
   *
   * @param {Discord.CommandInteraction<Discord.CacheType>} interaction the interaction object called
   * @param {Client} client
   * @returns nuthin
   */
  async execute(interaction, client) {
    var firstHybridTribe = "";
    var secondHybridTribe = "";
    const pyrrhian = interaction.options.getBoolean("pyrrhia");
    const pantalan = interaction.options.getBoolean("pantala");

    console.log(pyrrhian);
    console.log(pantalan);

    if (pyrrhian && pantalan) {
      firstHybridTribe = randomTribe();
      do {
        secondHybridTribe = randomTribe();
      } while (firstHybridTribe === secondHybridTribe);
    } else if (pyrrhian && !pantalan) {
      firstHybridTribe = randomPyrrhia();
      do {
        secondHybridTribe = randomPyrrhia();
      } while (firstHybridTribe === secondHybridTribe);
    } else if (!pyrrhian && pantalan) {
      firstHybridTribe = randomPantala();
      do {
        secondHybridTribe = randomPantala();
      } while (firstHybridTribe === secondHybridTribe);
    } else if (!pyrrhian && !pantalan) {
      await interaction.reply({
        content: "Please select at least one of the options!",
        ephemeral: true,
      });
      return;
    }

    switch (firstHybridTribe) {
      case "skywing":
        color = "RED";
        break;

      case "seawing":
        color = "NAVY";
        break;

      case "sandwing":
        color = "GOLD";
        break;

      case "nightwing":
        color = "DARK_PURPLE";
        break;

      case "icewing":
        color = [221, 255, 255];
        break;

      case "mudwing":
        color = [112, 84, 62];
        break;

      case "rainwing":
        color = "RANDOM";
        break;

      case "hivewing":
        color = "DEFAULT";
        break;

      case "silkwing":
        color = "RANDOM";
        break;

      case "leafwing":
        color = [48, 183, 0];
        break;
    }

    interaction.reply({
      embeds: [
        new MessageEmbed()
          .setTitle("I suggest...")
          .setDescription(
            `${firstHybridTribe} x ${secondHybridTribe}. What do you think about it?`
          )
          .setColor(color),
      ],
    });
  },
};
