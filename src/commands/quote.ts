import type { Command } from "../types";
import { SlashCommandBuilder } from "@discordjs/builders";
import * as Discord from "discord.js";
import { quotes } from "../config/quotes.json";

export default {
  data: new SlashCommandBuilder()
    .setName("quote")
    .setDescription("Quote quizz!"),
  async execute(interaction, client) {
    if (client.quoteBusy === true) {
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
    let stopIt = false;
    // The possible answers of /quote, used to determine if a message is an answer or completely unrelated
    const answers: string[] = [];

    client.quoteBusy = true;

    // Choose one randomly
    const theChosenOne =
      quotes[Math.floor(Math.random() * quotes.length + 1) - 1];
    const quoteEmbed = new Discord.MessageEmbed()
      .setTitle("Who said this?")
      .setDescription(theChosenOne.quote)
      .setFooter({ text: "You have 20 seconds" })
      .setColor("GREEN");

    await interaction.reply({ embeds: [quoteEmbed] });
    const timeOut = setTimeout(() => {
      stopIt = true;
      interaction.editReply({ content: "This quizz is finished.", embeds: [] });
      interaction.followUp({
        content: `Time's up! The answer was ${theChosenOne.character}!`,
        embeds: [],
      });
      client.quoteBusy = false;
      const quizzEndedEmbed = new Discord.MessageEmbed()
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

    async function guess() {
      if (!interaction.channel) {
        interaction.reply({
          embeds: [
            new Discord.MessageEmbed({
              color: "RED",
              title: "Error",
              description: "Channel not found!",
            }),
          ],
        });

        return;
      }

      const quizzAnswer = await interaction.channel.awaitMessages({
        filter: (quizzAnswer) =>
          quizzAnswer.author.id !== client.user.id &&
          answers.includes(quizzAnswer.content.toLowerCase()),
        max: 1,
      });

      if (stopIt) {
        return;
      }

      if (
        quizzAnswer.first()?.content.toLowerCase() ===
        theChosenOne.character.toLowerCase()
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

        const quizzEndedEmbed = new Discord.MessageEmbed()
          .setTitle("Quizz ended")
          .setDescription("This quizz has ended!")
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
} as Command;
