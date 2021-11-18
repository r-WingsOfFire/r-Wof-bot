/* eslint-disable @typescript-eslint/no-var-requires */
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');

const commands = [
	new SlashCommandBuilder().setName('ping').setDescription('Replies with pong and sends the ping of the bot'),
	new SlashCommandBuilder().setName('snek').setDescription('snek'),
	new SlashCommandBuilder().setName('kill').setDescription('Kills the bot'),
	new SlashCommandBuilder().setName('sunny').setDescription('get a nice quote from sunny'),
	new SlashCommandBuilder().setName('fuck').setDescription('Fuck.').setDefaultPermission(false),
	new SlashCommandBuilder().setName('fac').setDescription('flips a coin'),
	new SlashCommandBuilder().setName('ocmessage').setDescription('Add a message declaring an oc to the database. This option is automatic.').addStringOption(option =>
		option.setRequired(true)
			.setDescription('The link or the id to the message')
			.setName('msg')),
	new SlashCommandBuilder().setName('hybridgen').setDescription('Randomly generates a hybrid combination you can use!').addBooleanOption(option =>
		option.setName('pantala')
			.setDescription('whether or not should pantalan tribes be possible.')
			.setRequired(true)
	).addBooleanOption(option =>
		option.setName('pyrrhia')
			.setDescription('whether or not should pyrrhian tribes be possible.')
			.setRequired(true)),
	new SlashCommandBuilder().setName('stalk').setDescription('Get notified when a user logs in').addUserOption(option =>
		option.setName('user')
			.setDescription('The user you want to stalk')
			.setRequired(true)),
	new SlashCommandBuilder().setName('oc').setDescription('Get infos about the specified oc').addStringOption(option =>
		option.setName('name')
			.setDescription('The name of the OC')
			.setRequired(true)
	),
	new SlashCommandBuilder().setName('quote').setDescription('Quote quizz!'),
	new SlashCommandBuilder().setName('editoc').setDescription('Edit an oc or attributes to the oc.').addStringOption(option =>
		option.setName('name')
			.setDescription('The name of the OC')
			.setRequired(true)
	).addStringOption(option => 
		option.setName('key')
			.setDescription('The name of the attribute')
			.setRequired(true)
			.addChoices([['owner', 'owner'],
				['age', 'age'], 
				['gender', 'gender'], 
				['tribe', 'tribes'], 
				['message', 'message'],
				['delete a tribe', 'deltribe']])
	).addStringOption(option => 
		option.setDescription('The value of the attribute')
			.setName('value')
			.setRequired(true)
	),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);