import { SlashCommandBuilder } from "@discordjs/builders";
import Discord = require("discord.js");
import Discordx = require("discordx");
const MessageEmbed = Discord.MessageEmbed;

// Redeclares Client in order to add a collection of commands
class Client extends Discordx.Client {
  commands = new Discord.Collection();
  quoteBusy = false;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("quote")
    .setDescription("Quote quizz!"),

  async execute(
    interaction: Discord.CommandInteraction<Discord.CacheType>,
    client: Client
  ) {
    if (interaction.channelId !== "724790540721455144") {
      interaction.reply({
        embeds: [
          new MessageEmbed()
            .setTitle("Error")
            .setDescription(
              "This command can only be used in the <#724790540721455144> channel"
            )
            .setColor("RED"),
        ],
      });
      return;
    }
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
    var answers: string[] = [];

    client.quoteBusy = true;

    // Get the quizz quotes
    const { quotes } = require("../../quotes.json") as {
      quotes: { character: string; quote: string }[];
    };

    // Choose one randomly
    const theChoosenOne =
      quotes[Math.floor(Math.random() * quotes.length + 1) - 1];
    const quoteEmbed = new MessageEmbed()
      .setTitle("Who said this?")
      .setDescription(theChoosenOne.quote)
      .setFooter({ text: "You have 20 seconds" })
      .setColor("GREEN");

    await interaction.reply({ embeds: [quoteEmbed] });
    const timeOut = setTimeout(async () => {
      stopIt = true;
      let reply = (await interaction.fetchReply()) as Discord.Message<boolean>;
      interaction.editReply({
        embeds: [
          reply.embeds[0]
            .setColor("RED")
            .setFooter("This quizz is finished.")
            .setTitle("Time's up!"),
        ],
      });
      interaction.channel?.send({
        content: `Time's up! The answer was ${theChoosenOne.character}!`,
        embeds: [],
      });
      client.quoteBusy = false;
    }, 20000);

    quotes.forEach((quote) => {
      answers.push(quote.character.toLowerCase());
    });
    const filter = (quizzAnswer: Discord.Message<boolean>) =>
      quizzAnswer.author.id !== client.user?.id &&
      answers.includes(quizzAnswer.content.toLowerCase());

    async function guess() {
      let quizzAnswer = await interaction.channel?.awaitMessages({
        filter,
        max: 1,
      });
      if (quizzAnswer == null) {
        return;
      }
      if (stopIt) {
        return;
      }
      if (
        quizzAnswer.first()?.content.toLowerCase() ===
        theChoosenOne.character.toLowerCase()
      ) {
        quizzAnswer.first()?.reply({
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
        let prompt =
          (await interaction.fetchReply()) as Discord.Message<boolean>;
        const quizzEndedEmbed = prompt.embeds[0]
          .setTitle("Quizz ended")
          .setFooter({
            text: "If you want to try that out, use the /quote command!",
          })
          .setColor("GREEN");
        interaction.editReply({ embeds: [quizzEndedEmbed] });
      } else {
        quizzAnswer.first()?.reply("Nope, this is wrong!");
        guess();
      }
    }
    guess();
  },
};
