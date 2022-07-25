const { SlashCommandBuilder } = require("@discordjs/builders");
const { guildId } = require("../config.json");
const Discord = require("discord.js");
const Client = require("../structures/client");
const MessageEmbed = Discord.MessageEmbed;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("quote")
    .setDescription("Quote quizz!"),

  /**
   *
   * @param {Discord.CommandInteraction<Discord.CacheType>} interaction the interaction object called
   * @param {Client} client
   * @returns nuthin
   */
  async execute(interaction, client) {
    if (client.quoteBusy == true) {
      interaction.reply({
        embeds: [
          new Discord.MessageEmbed({
            color: "RED",
            title: "Busy",
            description: "A quizz is already running, please wait!",
          }),
        ],
      });

      return;
    }

    // Used to stop a loop in /quote
    var stopIt = false;
    // The possible answers of /quote, used to determine if a message is an answer or completely unrelated
    var answers = [];

    client.quoteBusy = true;

    // Get the quizz quotes
    const { quotes } = require("../quotes.json");

    // Choose one randomly
    const theChoosenOne =
      quotes[Math.floor(Math.random() * quotes.length + 1) - 1];
    const quoteEmbed = new MessageEmbed()
      .setTitle("Who said this?")
      .setDescription(theChoosenOne.quote)
      .setFooter({ text: "You have 20 seconds" })
      .setColor("GREEN");

    await interaction.reply({ embeds: [quoteEmbed] });
    const timeOut = setTimeout(() => {
      stopIt = true;
      interaction.editReply({ content: "This quizz is finished.", embeds: [] });
      interaction.channel.send({
        content: `Time's up! The answer was ${theChoosenOne.character}!`,
        embeds: [],
      });
      client.quoteBusy = false;
      const quizzEndedEmbed = new MessageEmbed()
        .setTitle("Quizz ended")
        .setDescription("This quizz has ended!")
        .setFooter({
          text: "If you want to try that out, use the /quote command!",
        })
        .setColor("GREEN");
      interaction.editReply({ embeds: [quizzEndedEmbed] });
    }, 20000);

    quotes.forEach((quote) => {
      answers.push(quote.character.toLowerCase());
    });
    const filter = (quizzAnswer) =>
      quizzAnswer.author.id !== client.user.id &&
      answers.includes(quizzAnswer.content.toLowerCase());

    async function guess() {
      quizzAnswer = await interaction.channel.awaitMessages({ filter, max: 1 });
      if (stopIt) {
        return;
      }
      if (
        quizzAnswer.first().content.toLowerCase() ===
        theChoosenOne.character.toLowerCase()
      ) {
        quizzAnswer.first().reply({
          embeds: [
            new Discord.MessageEmbed()
              .setDescription("Congratulation! This is correct!")
              .setTitle("Answered correctly!")
              .setColor("GREEN"),
          ],
        });
        clearTimeout(timeOut);
        client.quoteBusy = false;
        stopIt = true;
        const quizzEndedEmbed = new MessageEmbed()
          .setTitle("Quizz ended")
          .setDescription("This quizz has ended!")
          .setFooter({
            text: "If you want to try that out, use the /quote command!",
          })
          .setColor("GREEN");
        interaction.editReply({ embeds: [quizzEndedEmbed] });
      } else {
        quizzAnswer.first().reply("Nope, this is wrong!");
        guess();
      }
    }
    guess();
  },
};
