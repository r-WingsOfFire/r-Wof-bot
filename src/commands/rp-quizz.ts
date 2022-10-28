import {
	SlashCommandBuilder,
	ActionRowBuilder,
	ButtonBuilder,
} from "@discordjs/builders";
import * as Discord from "discord.js";
const MessageEmbed = Discord.MessageEmbed;
import { questions } from "../../rp-quiz.json";

// Redeclares Client in order to add a collection of commands
class Client extends Discord.Client {
	commands = new Discord.Collection();
	rpQuizzFailed = new Map<Discord.Snowflake, number>();
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("rp-quiz")
		.setDescription("Solve this quiz to get access to the RP!"),

	async execute(
		interaction: Discord.CommandInteraction<Discord.CacheType>,
		client: Client
	) {
		if (
			!(interaction.member?.roles instanceof Discord.GuildMemberRoleManager)
		) {
			interaction.reply("An error has occured. Please contact the bot owner.");
			return;
		}

		if (client.rpQuizzFailed.has(interaction.user.id)) {
			interaction.reply(`You have already failed the RP quiz. Please wait ${client.rpQuizzFailed.get(interaction.user.id)} minutes.`);
			return;
		}
		if ((!!interaction.member?.roles.resolve("831308794251575326")) && interaction.member.user.id !== "373515998000840714") {
			interaction.reply("You already have access to the RP!");
			return;
		}
		interaction.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("RP quiz")
					.setDescription(
						"You have been sent the quiz by dm.\n\n" +
						"You have 1 minute to answer each question.\n\n" +
						"Good luck!"
					)
					.setFooter({ text: "-RP quiz" })
					.setColor("GOLD"),
			],
		});
		let member = interaction.member;
		if (!(member instanceof Discord.GuildMember)) return 0;
		let dmChannel = await member.createDM();
		let msg = await dmChannel.send({
			embeds: [
				new MessageEmbed().setTitle("RP quiz").setDescription("Loading..."),
			],
		});

		for (let question of questions) {
			let row = new Discord.MessageActionRow<Discord.MessageButton>();
			let button = 0;
			let correct = 0;
			let description = question.question;
			const letters = ["A", "B", "C", "D"];
			for (let answer of question.answers) {
				let letter = letters[question.answers.indexOf(answer)];
				description += `\n\n${letter} - ${answer.text}`;
				row.addComponents(
					new Discord.MessageButton()
						.setCustomId(button.toString())
						.setLabel(`\t${letter}\t`)
						.setStyle(Discord.Constants.MessageButtonStyles.PRIMARY)
				);
				if (answer.correct) correct = button;
				button++;
			}

			msg.edit({
				embeds: [
					new MessageEmbed().setTitle("RP quiz").setDescription(description),
				],
				components: [row],
			});
			const filter = (
				interaction: Discord.MessageComponentInteraction<Discord.CacheType>
			) => interaction.type === "MESSAGE_COMPONENT";

			const clicked = await msg
				.awaitMessageComponent({
					filter,
					time: 60_000,
				})
				.catch(() => {
					return;
				});

			if (!clicked) {
				await msg.edit({
					embeds: [
						new MessageEmbed()
							.setTitle("RP quiz")
							.setDescription("You took too long to answer!"),
					],
					components: [],
				});
				return;
			}

			if (clicked.customId === correct.toString()) {
				await clicked.update({
					embeds: [
						new MessageEmbed().setTitle("RP quiz").setDescription(`Correct!`),
					],
					components: [],
				});
			} else {
				await clicked.update({
					embeds: [
						new MessageEmbed()
							.setTitle("RP quiz")
							.setDescription(`Wrong answer! This quiz is canceled.`),
					],
					components: [],
				});
				client.rpQuizzFailed.set(member.id, 10);
				return;
			}
		}

		msg.edit({
			embeds: [
				new MessageEmbed()
					.setTitle("RP quiz")
					.setDescription(`You have been granted access to the RP!`),
			],
		});
		member.roles.add("831308794251575326");
	},
};
