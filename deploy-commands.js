const { SlashCommandBuilder } = require('@discordjs/builders')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const { clientId, guildId, token } = require('./config.json')

const commands = [
	new SlashCommandBuilder().setName('ping').setDescription('Replies with pong and sends the ping of the bot'),
	new SlashCommandBuilder().setName('snek').setDescription('snek'),
	new SlashCommandBuilder().setName('kill').setDescription('Kills the bot'),
	new SlashCommandBuilder().setName('stalk').setDescription('Get notified when a user logs in').addUserOption(option =>
		option.setName('user')
			.setDescription('The user you want to stalk')
			.setRequired(true)),
	new SlashCommandBuilder().setName('oc').setDescription('Get infos about the specified oc').addStringOption(option =>
		option.setName('name')
			.setDescription('The name of the OC')
			.setRequired(true)
	),
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
	.map(command => command.toJSON())

const rest = new REST({ version: '9' }).setToken(token)

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error)