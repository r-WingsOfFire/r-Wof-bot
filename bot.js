// MARK: Declare constants for discord.js
const Discord = require('discord.js');
const { Client, Intents, MessageEmbed } = Discord;
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES] });

// MARK: Declare constants for databases
const { table } = require('quick.db');
var stalking = new table('stalk');
var ocs = new table('OC');

var quoteBusy = false; // False if the bot can post a new quizz quote

var rWingsOfFireServer; // Not yet declared, as the bot isn't logged in yet

var lastRedditPostId = '';

// MARK: Token declaration
const process = require('process');
const exit = process.exit;
var tokenBuffer = process.env.token;
var token = '';

// MARK: Heroku support
var express = require('express');
var app = express();
var https = require('https');

app.set('port', (process.env.PORT || 5000));

// To avoid Heroku $PORT error
app.get('/', function (request, response) {
	var result = 'App is running';
	response.send(result);
}).listen(app.get('port'), function () {
	console.log('App is running, server is listening on port ', app.get('port'));
});

require('dotenv').config();

if (tokenBuffer === undefined) {
	token = require('./config.json').token;
	tokenBuffer = token;
}
token = tokenBuffer;

// Tribes constants
const pyhrrianTribes = ['skywing', 'seawing', 'icewing', 'nightwing', 'sandwing', 'mudwing', 'rainwing'];
const pantalanTribes = ['leafwing', 'hivewing', 'silkwing'];

// MARK: Functions
/**
 * Transforms a string to another string but with the first letter being uppercase.
 * @param {String} str the base string
 * @returns {String} the transformed string
 */
function toFirstUppercase(str) {
	var bufferArray = [''];
	if (str === '') return undefined;

	str = str.toLowerCase();
	bufferArray = str.split('');
	bufferArray[0] = bufferArray[0].toUpperCase();
	return bufferArray.join('');
}

/** Searches for a text in a message
 * @param {Discord.Message} message the message to search in
 * @param {String} text The text to look for
 * @param {Boolean} word If true, only returns the next word.
 * @returns {String} The next word or the end of the line
 */
function searchInMessage(message, text, word = true) {
	var foundInLine = false;
	var output = '';
	if (message.content.toLowerCase().includes(text.toLowerCase())) {
		message.content.split('\n').forEach(line => {
			if (line.toLowerCase().includes(text.toLowerCase()) && output === '' && !line.toLowerCase().includes(' name ')) {
				if (word) {
					line.split(' ').forEach(words => {
						if (words.toLowerCase().includes(text.toLowerCase())) foundInLine = true;
						if (text.toLowerCase().includes(words.toLowerCase())) foundInLine = true;
						if (!(words.toLowerCase().includes(text.toLowerCase()) || words.toLowerCase().includes(':') || words.toLowerCase().includes('resubmit') || words.toLowerCase().includes('resub')) && foundInLine && output === '') {
							output = words;
						}

					});
				} else {
					output = line.toLowerCase().split(text.toLowerCase()).join('').split(':').join('');
				}

			}
		});
	} else {
		return 'N/A. If this is not supposed to be there, please contact <@373515998000840714>';
	}

	return output;
}

/** Fetches an oc from a discord message.
 *
 * @param {Discord.Message} message
 */
async function addOc(message) {
	var name = '';
	var indexAdd = 0;
	var ocChannel;
	var nameArr = [''];
	var tribes = [];
	var finalTribes = [];

	ocs = new table('OC');
	rWingsOfFireServer = client.guilds.resolve('716601325269549127');
	ocChannel = rWingsOfFireServer.channels.resolve('854858811101937704');

	const messagesFetched = Array.from((await ocChannel.messages.fetch({
		before: message.id,
		limit:  10
	})).sort((msg1, msg2) => msg2.createdTimestamp - msg1.createdTimestamp), ([, value]) => (value));

	if (message.content.toLowerCase().includes('name') && message.content.toLowerCase().includes(':')) {
		if (message.content.toLowerCase().includes('name and common nicknames')) {
			name = searchInMessage(message, 'name and common nicknames', false);
		} else if (message.content.toLowerCase().includes('name and common and nicknams')) {
			name = searchInMessage(message, 'name and common and nicknams', false);
		} else if (message.content.toLowerCase().includes('name and common and nicknames')) {
			name = searchInMessage(message, 'name and common and nicknames', false);
		} else if (message.content.toLowerCase().includes('name and common nickname')) {
			name = searchInMessage(message, 'name and common nickname', false);
		} else if (message.content.toLowerCase().includes('name')) {
			name = searchInMessage(message, 'name', false);
		}

	} else {
		while (name === '') {
			if (messagesFetched[indexAdd].content.toLowerCase().includes('name') && message.content.toLowerCase().includes(':')) {
				if (messagesFetched[indexAdd].content.toLowerCase().includes('name and common nicknames')) {
					name = searchInMessage(messagesFetched[indexAdd], 'name and common nicknames', false);
				} else if (messagesFetched[indexAdd].content.toLowerCase().includes('name and common and nicknams')) {
					name = searchInMessage(messagesFetched[indexAdd], 'name and common and nicknams', false);
				} else if (messagesFetched[indexAdd].content.toLowerCase().includes('name and common and nicknames')) {
					name = searchInMessage(messagesFetched[indexAdd], 'name and common and nicknames', false);
				} else if (messagesFetched[indexAdd].content.toLowerCase().includes('name and common nickname')) {
					name = searchInMessage(messagesFetched[indexAdd], 'name and common nickname', false);
				} else if (messagesFetched[indexAdd].content.toLowerCase().includes('name')) {
					name = searchInMessage(messagesFetched[indexAdd], 'name', false);
				}

			}
			indexAdd++;
		}
	}
	nameArr = name.split(';')[0]
		.split(',')[0]
		.split('|')[0]
		.split(' or ')[0]
		.split('(')[0]
		.split('*').join('')
		.split('-').join(' ')
		.split('  ').join(' ')
		.split(' ');
	while (nameArr[0] === '') nameArr.shift();
	while (nameArr[nameArr.length - 1] === '') nameArr.pop();
	nameArr.forEach((namePart, i) => {
		if (namePart !== '') nameArr[i] = toFirstUppercase(namePart);
	});
	name = nameArr.join(' ');
	ocs.set(`${name}.message.Snowflake`, message.id);
	ocs.set(`${name}.message.URL`, `https://discord.com/channels/716601325269549127/854858811101937704/${message.id}`);
	if (message.embeds.length > 0) ocs.set(`${name}.image`, message.embeds[0].url);
	if (message.mentions.users.size > 0) ocs.set(`${name}.owner`, message.mentions.users.first().username);
	if (message.content.toLowerCase().includes('age')) ocs.set(`${name}.age`, Number(searchInMessage(message, 'age')));
	if (message.content.toLowerCase().includes('gender')) ocs.set(`${name}.gender`, searchInMessage(message, 'gender'));
	if (message.attachments.size > 0) ocs.set(`${name}.image`, message.attachments.first().url);
	if (message.content.toLowerCase().includes('tribes')) {
		tribes = searchInMessage(message, 'tribes', false).split(' ').filter(v =>
			v.toLowerCase().includes('mud')
			|| v.toLowerCase().includes('night')
			|| v.toLowerCase().includes('sand')
			|| v.toLowerCase().includes('leaf')
			|| v.toLowerCase().includes('silk')
			|| v.toLowerCase().includes('ice')
			|| v.toLowerCase().includes('sea')
			|| v.toLowerCase().includes('sky')
			|| v.toLowerCase().includes('hive')
			|| v.toLowerCase().includes('rain')
		).join(' ').split('0').join('')
			.split('1').join('')
			.split('2').join('')
			.split('3').join('')
			.split('4').join('')
			.split('5').join('')
			.split('6').join('')
			.split('7').join('')
			.split('8').join('')
			.split('9').join('')
			.split('/').join(',')
			.split('|').join(',')
			.split('&').join(',')
			.split('+').join(',')
			.split(',').join(' ')
			.split(' ');
		tribes.forEach(tribe => {
			if (tribe.toLowerCase().includes('mud')) {
				finalTribes.push('mudwing');
			} else if (tribe.toLowerCase().includes('sand')) {
				finalTribes.push('sandwing');
			} else if (tribe.toLowerCase().includes('night')) {
				finalTribes.push('nightwing');
			} else if (tribe.toLowerCase().includes('sea')) {
				finalTribes.push('seawing');
			} else if (tribe.toLowerCase().includes('sky')) {
				finalTribes.push('skywing');
			} else if (tribe.toLowerCase().includes('rain')) {
				finalTribes.push('rainwing');
			} else if (tribe.toLowerCase().includes('ice')) {
				finalTribes.push('icewing');
			} else if (tribe.toLowerCase().includes('leaf')) {
				finalTribes.push('leafwing');
			} else if (tribe.toLowerCase().includes('hive')) {
				finalTribes.push('hivewing');
			} else if (tribe.toLowerCase().includes('silk')) {
				finalTribes.push('silkwing');
			}

		});
		ocs.set(`${name}.tribes`, finalTribes);
	} else if (message.content.toLowerCase().includes('tribe(s)')) {
		tribes = [];
		tribes = searchInMessage(message, 'tribe(s)', false).split(' ').filter(v =>
			v.toLowerCase().includes('mud')
			|| v.toLowerCase().includes('night')
			|| v.toLowerCase().includes('sand')
			|| v.toLowerCase().includes('leaf')
			|| v.toLowerCase().includes('silk')
			|| v.toLowerCase().includes('ice')
			|| v.toLowerCase().includes('sea')
			|| v.toLowerCase().includes('sky')
			|| v.toLowerCase().includes('hive')
			|| v.toLowerCase().includes('rain')
		).join(' ').split('0').join('')
			.split('1').join('')
			.split('2').join('')
			.split('3').join('')
			.split('4').join('')
			.split('5').join('')
			.split('6').join('')
			.split('7').join('')
			.split('8').join('')
			.split('9').join('')
			.split('/').join(',')
			.split('|').join(',')
			.split('&').join(',')
			.split('+').join(',')
			.split(',').join(' ')
			.split(' ');
		finalTribes = [];
		tribes.forEach(tribe => {
			if (tribe.toLowerCase().includes('mud')) {
				finalTribes.push('mudwing');
			} else if (tribe.toLowerCase().includes('sand')) {
				finalTribes.push('sandwing');
			} else if (tribe.toLowerCase().includes('night')) {
				finalTribes.push('nightwing');
			} else if (tribe.toLowerCase().includes('sea')) {
				finalTribes.push('seawing');
			} else if (tribe.toLowerCase().includes('sky')) {
				finalTribes.push('skywing');
			} else if (tribe.toLowerCase().includes('rain')) {
				finalTribes.push('rainwing');
			} else if (tribe.toLowerCase().includes('ice')) {
				finalTribes.push('icewing');
			} else if (tribe.toLowerCase().includes('leaf')) {
				finalTribes.push('leafwing');
			} else if (tribe.toLowerCase().includes('hive')) {
				finalTribes.push('hivewing');
			} else if (tribe.toLowerCase().includes('silk')) {
				finalTribes.push('silkwing');
			}

		});
		ocs.set(`${name}.tribes`, finalTribes);
	} else if (!searchInMessage(message, 'tribe', false).includes('N/A')) {
		ocs.push(`${name}.tribes`, searchInMessage(message, 'tribe'));
	}

}

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

/** Chooses a random integer
 * @param {Number} min The lowest number possible
 * @param {Number} max The highest number possible
 * @returns {Number} A pseudo-random number in the range [min ]max
 */
function randInt(min, max) {
	return Math.floor(Math.random() * max - min) + min;
}

/** Fetches a reddit post
 * @returns {void} nothing
 */
function getRedditPost(id) {
	https.get(`https://www.reddit.com/r/WingsOfFire/comments/${id}/.json`, {
		headers: {
			'User-Agent': 'RWingsOfFire by dindin100'
		}
	}, (res) => {
		res.setEncoding('utf8');
		let rawData = '';
		res.on('data', (chunk) => {
			rawData += chunk;
		});
		res.on('end', () => {
			try {
				postDataProcess(JSON.parse(rawData)[0].data.children[0].data);
				res.resume();
			} catch (e) {
				console.error(e.message);
				res.resume();
			}
		});
	});
}

/** Processes the data from the reddit post and sends it in the channel
 * @param {any} data The post data
 * @returns {void}
 */
function postDataProcess(data) {
	let finalEmbed = new Discord.MessageEmbed();
	finalEmbed.setAuthor(`u/${data.author}`);
	finalEmbed.setTitle(data.title);
	if (data.selftext.includes('x200B')) {
		if (data.media_metadata.e === 'Image') {
			finalEmbed.setDescription('Image post');
			finalEmbed.setImage();
		} else if (data.post_hint === 'image') {
			finalEmbed.setDescription('Image post');
			finalEmbed.setImage(data.preview.images[0].source.url);
		}
	} else {
		finalEmbed.setDescription(data.selftext);
	}
	finalEmbed.setURL(data.url);

	client.guilds.resolve('716601325269549127').members.resolve('373515998000840714').createDM()
		.then(dmChannel => {
			dmChannel.send({ embeds: [finalEmbed] })
				.catch(e => {
					console.error(e);
				});
		});

	//Switch to this one when ready
	/* client.guilds.resolve('716601325269549127').channels.resolve('716617066261643314')
		.send({ embeds: [finalEmbed] })
				.catch(e => {
					console.error(e);
				});
		}); */
}

// MARK: Executes once the bot is logged in
client.once('ready', async () => {
	// We initialize the variable here, once the bot is logged in
	rWingsOfFireServer = client.guilds.resolve('716601325269549127');

	await client.user.setUsername('r/WOF Bot');

	// Logs the date and the username
	console.log(`[${(`0${new Date(Date.now()).getHours()}`).slice(-2)}:${(`0${new Date(Date.now()).getMinutes()}`).slice(-2)}:${(`0${new Date(Date.now()).getSeconds()}`).slice(-2)}] Logged in as ${client.user.tag}; ready!`);

	// Checks for stalked people in the database
	setInterval(() => {
		var stalkArray = '';

		stalking.all().forEach((stalk) => {
			stalk.data.forEach((stalked, index) => {
				rWingsOfFireServer.members.fetch({ withPresences: true }).then(fetchedMembers => {
					const totalOnline = fetchedMembers.filter(member => member.presence?.status === 'online' || member.presence?.status === 'dnd');
					console.log(fetchedMembers.get(stalked).presence);
					if (totalOnline.has(fetchedMembers.get(stalked).id)) {
						fetchedMembers.get(stalk.ID).send(`${fetchedMembers.get(stalked).user.username} is online!`);
						stalkArray = stalking.get(`${stalk.ID}`);
						console.log(stalking.get(`${stalk.ID}`));
						try {
							stalkArray.splice(index, 1);
							console.log(stalkArray);
							stalking.set(`${stalk.ID}`, stalkArray);
						} catch {
							stalking.delete(stalk.ID);
						}
					}
				});
			});
		});
	}, 5000);

	// Sets permissions for commands
	if (!client.application?.owner) await client.application?.fetch();
	const command = await client.guilds.cache.get('716601325269549127')?.commands.fetch('910250822779162714');
	const permissions = [
		{
			id:         '795414220707463188',
			type:       'ROLE',
			permission: true,
		},
		{
			id:         '716603740051996703',
			type:       'ROLE',
			permission: true,
		},
	];
	await command.permissions.add({ permissions });

	// Finds the last reddit post, and stores its id
	https.get('https://www.reddit.com/r/WingsOfFire/new.json', (res) => {
		res.setEncoding('utf8');
		let rawData = '';
		res.on('data', (chunk) => {
			rawData += chunk;
		});
		res.on('end', () => {
			try {
				lastRedditPostId = JSON.parse(rawData).data.children[0].data.id;
			} catch (e) {
				console.error(e.message);
			}
		});
	});

	// checks for reddit posts every 30 seconds.
	setInterval(() => {
		console.log(lastRedditPostId);
		https.get(`https://www.reddit.com/r/WingsOfFire/new.json?before=t3_${lastRedditPostId}`, (res) => {
			res.setEncoding('utf8');
			let rawData = '';
			res.on('data', (chunk) => {
				rawData += chunk;
			});
			res.on('end', () => {
				try {
					if (JSON.parse(rawData).data.children.length === 0) return;

					JSON.parse(rawData).data.children.forEach(post => {
						getRedditPost(post.data.id);
					});
					lastRedditPostId = JSON.parse(rawData).data.children[0].data.id;
				} catch (e) {
					console.error(e.message);
				}
			});
		});
	}, 30000);
});

// MARK: Executes when an interaction is created
// * An interaction can be a button pressed, a slash command executed, and so on
client.on('interactionCreate', async interaction => {
	// MARK: Variable declarations

	// Color of the embeds
	var color = 'DEFAULT';

	// Variable for ping, in ms
	var ping = 0;

	// The user about to be stalked
	var stalked;

	/** /oc get:
	 *    * OcArr,	name Arr: 	An array that stores the name of the oc, split at spaces
	 *    * Oc,		name: 		The name of the oc itself
	 */
	var ocArr = [];
	var oc = '';
	var name = '';
	var nameArr = [''];

	// /oc edit:
	//	* Key:		The name of the attribute to edit
	//	* Value:	The value to write in
	var key = '';
	var value = '';

	// The tribe(s) of the oc
	var ocTribeArray = [];
	// The first tribe of the oc, used for color
	var tribe = '';

	// The message of the oc approvement
	var message;

	// Used to stop a loop in /quote
	var stopIt = false;
	// The possible answers of /quote, used to determine if a message is an answer or completely unrelated
	var answers = [];

	// A random number, used to flip a coin
	var random = Math.random();

	// The first tribe of the hybrid generated
	var firstHybridTribe = '';
	// The second tribe of the hybrid generated
	var secondHybridTribe = '';

	/*
		// Prevents heroku app going to sleep while in active use
		http.get('https://r-wof-bot.herokuapp.com');
	*/

	if (!interaction.isCommand()) return;

	switch (interaction.commandName) {
		// Kills the bot
	case 'kill':
		if (interaction.member.roles.resolve('795414220707463188')) {
			await interaction.reply('Alright, the bot is logging out...')
				.catch((e) => {
					console.error(`tf is going on? an error occurred... check that out:\n${e}`);
				})
				.then(() => {
					var killer = interaction.user.username;
					console.warn(`The bot got killed by ${killer}`);
					client.destroy();
					exit();
				});
		} else {
			await interaction.reply({ 'content': 'You don\'t have permission to do that!', 'ephemeral': true });
		}

		break;

		// Returns the bot's ping
	case 'ping':
		ping = new Date(Date.now()) - interaction.createdAt;

		if (ping >= 0) {
			if (ping <= 500) color = 'GREEN';
			if (ping <= 1000 && ping > 500) color = 'YELLOW';
			if (ping <= 1500 && ping > 1000) color = 'ORANGE';
			if (ping <= 2000 && ping > 1500) color = 'RED';
			if (ping > 2000) color = 'PURPLE';
			const PingEmbed = new MessageEmbed()
				.setColor(color)
				.setTitle('Pong! :ping_pong:')
				.setDescription(`${ping}ms`);
			await interaction.reply({ 'embeds': [PingEmbed] });
		} else {
			const PingEmbed = new MessageEmbed()
				.setColor('RANDOM')
				.setTitle('Pong? :ping_pong:')
				.setDescription(`Emmm it is negative? ${ping} ms...`);
			await interaction.reply({ 'embeds': [PingEmbed] });
		}
		console.log(`${interaction.user.username} used ping`);
		break;

		// Snek
	case 'snek':
		await interaction.reply({
			files: [{
				attachment: 'https://cdn.discordapp.com/attachments/647616102339313667/795971177754525706/snek.jpg',
				name:       'snek.jpg'
			}]
		});
		console.log(`${interaction.user.username} used snek`);
		break;

		// Get notified when a user logs in
		// See the setInterval() in Client.on("ready")
	case 'stalk':
		stalked = interaction.options.getUser('user');
		await interaction.reply({
			'content':   `You are now stalking ${stalked.username}. You will be notified when they log on.`,
			'ephemeral': true
		});
		stalking.push(interaction.user.id, stalked.id);
		break;

		// Multiple functions for oc rp purposes
	case 'oc':
		// noinspection JSCheckFunctionSignatures
		switch (interaction.options.getSubcommand()) {

			// Get information about an oc in the database
		case 'get':
			interaction.options.getString('name').split(' ').forEach((namePart, i) => {
				ocArr[i] = toFirstUppercase(namePart);
			});
			oc = ocArr.join(' ');

			if (ocs.has(oc)) {
				// Get tribe color
				switch (ocs.get(`${ocs}.tribes[0]`)) {
				case 'skywing':
					color = 'RED';
					break;

				case 'seawing':
					color = 'NAVY';
					break;

				case 'sandwing':
					color = 'GOLD';
					break;

				case 'nightwing':
					color = 'DARK_PURPLE';
					break;

				case 'icewing':
					color = [221, 255, 255];
					break;

				case 'mudwing':
					color = [112, 84, 62];
					break;

				case 'rainwing':
					color = 'RANDOM';
					break;

				case 'hivewing':
					color = 'DEFAULT';
					break;

				case 'silkwing':
					color = 'RANDOM';
					break;

				case 'leafwing':
					color = [48, 183, 0];
					break;

				default:
					color = 'DEFAULT';
					break;
				}
				try {
					const embed = new MessageEmbed()
						.setTitle(oc)
						.setColor(color)
						.setAuthor(ocs.get(`${oc}.owner`) || 'unavailable')
						.setURL(ocs.get(`${oc}.message.URL`) || 'https://discord.com/channels/716601325269549127/854858811101937704')
						.setFooter('This sheet might not be 100% accurate. If there is an error, please immediately report it to <@373515998000840714>')
						.addField('Tribe(s)', ocs.get(`${oc}.tribes`)?.join(' / ') || 'unavailable', true)
						.addField('Age', String(ocs.get(`${oc}.age`)) || 'unavailable', true)
						.addField('Gender', ocs.get(`${oc}.gender`) || 'unavailable', true);
					if (ocs.has(`${oc}.image`)) embed.setImage(ocs.get(`${oc}.image`) || 'https://nelowvision.com/wp-content/uploads/2018/11/Picture-Unavailable.jpg');
					await interaction.reply({ 'embeds': [embed], 'ephemeral': false });
				} catch (e) {
					console.log(ocs.get(`${oc}.owner`),
						ocs.get(`${oc}.message.URL`),
						ocs.get(`${oc}.image`),
						ocs.get(`${oc}.tribes`)?.join(' / ') || 'unavailable',
						ocs.get(`${oc}.age`),
						ocs.get(`${oc}.gender`));
					console.warn(e);
				}
			} else {
				await interaction.reply({
					embeds: [new Discord.MessageEmbed()
						.setDescription('This oc is invalid. Please try again.')
						.setFooter('Did you add your oc to the database yet? Please check /help cmd:ocmessage to do so!')
						.setColor('RED')
						.setTitle('Oc invalid.')]
				});
			}
			break;

			// Self-explanatory, edits an oc in the database
		case 'edit':
			name = interaction.options.getString('name');
			nameArr = name.split(';')[0]
				.split(',')[0]
				.split('|')[0]
				.split(' or ')[0]
				.split('(')[0]
				.split('*').join('')
				.split('-').join(' ')
				.split('  ').join(' ')
				.split(' ');
			if (nameArr[0] === '') nameArr.shift();
			if (nameArr[nameArr.length - 1] === '') nameArr.pop();
			nameArr = nameArr.join(' ').split(' ');
			nameArr.forEach((namePart, i) => {
				if (namePart !== '') nameArr[i] = toFirstUppercase(namePart);
			});
			name = nameArr.join(' ');
			key = interaction.options.getString('key');
			value = interaction.options.getString('value');

			if (key === 'deltribe') {
				if (ocs.has(name)) {
					if (ocs.get(`${name}.owner`) !== interaction.user.username || ocs.get(`${name}.owner`) !== undefined) {
						interaction.reply('You do not have the permissions to edit that oc!');
						return;
					}
					if (ocs.get(`${name}.tribes`).includes(value.toLowerCase())) {
						ocTribeArray = ocs.get(`${name}.tribes`);
						ocTribeArray.splice(ocTribeArray.indexOf(value), 1);
						ocs.set(`${name}.tribes`, ocTribeArray);
						interaction.reply('The tribe was successfully removed!');
					} else {
						await interaction.reply(`The oc you specified does not have the ${value} tribe!`);
					}

				} else {
					await interaction.reply('The oc you specified is not in the database!');
				}

			} else {
				if (ocs.has(name)) {
					if (ocs.get(`${name}.owner`) !== interaction.user.username && ocs.get(`${name}.owner`) !== undefined && !interaction.member.roles.cache.has('795414220707463188') && !interaction.member.roles.cache.has('762526998274113548')) {
						interaction.reply('You do not have the permissions to edit that oc!');
						console.log(interaction.user.username);
						return;
					}
					if (key === 'tribes') {
						if (tribe.toLowerCase().includes('mud')) {
							tribe = 'mudwing';
						} else if (tribe.toLowerCase().includes('sand')) {
							tribe = 'sandwing';
						} else if (tribe.toLowerCase().includes('night')) {
							tribe = 'nightwing';
						} else if (tribe.toLowerCase().includes('sea')) {
							tribe = 'seawing';
						} else if (tribe.toLowerCase().includes('sky')) {
							tribe = 'skywing';
						} else if (tribe.toLowerCase().includes('rain')) {
							tribe = 'rainwing';
						} else if (tribe.toLowerCase().includes('ice')) {
							tribe = 'icewing';
						} else if (tribe.toLowerCase().includes('leaf')) {
							tribe = 'leafwing';
						} else if (tribe.toLowerCase().includes('hive')) {
							tribe = 'hivewing';
						} else if (tribe.toLowerCase().includes('silk')) {
							tribe = 'silkwing';
						} else {
							interaction.reply('The tribe is invalid!');
						}

						if (ocs.get(`${name}.tribes`).includes(tribe)) {
							interaction.reply('The oc already has this tribe!');
						}

					} else if (key === 'owner') {
						ocs.set(`${name}.owner`, client.users.resolve(value.slice(3, -1)).username);
						interaction.reply('The oc was successfully edited!');
					} else if (key === 'age') {
						if (!isNaN(value)) {
							ocs.set(`${name}.${key}`, Number(value));
							interaction.reply('The oc was successfully edited!');
						} else {
							interaction.reply('Please insert a number');
						}
					} else {
						ocs.set(`${name}.${key}`, value);
						interaction.reply('The oc was successfully edited!');
					}
				} else {
					// noinspection JSCheckFunctionSignatures
					const buttons = new Discord.MessageActionRow()
						.addComponents([
								new Discord.MessageButton()
									.setLabel('Yes!')
									.setStyle('PRIMARY')
									.setCustomId('yes'),
								new Discord.MessageButton()
									.setLabel('No...')
									.setStyle('PRIMARY')
									.setCustomId('no')
							]
						);
					const reply = await interaction.reply({
						content:    'This oc is not in the database! Do you want to create one?',
						components: [buttons],
						fetchReply: true
					});
					reply.awaitMessageComponent({
						componentType: 'BUTTON',
						time:          15000,
						filter:        interact => interact.user.id === interaction.user.id
					}).then(interactionB => {
						if (interactionB.customId === 'yes') {
							if (key === 'tribes') {
								if (tribe.toLowerCase().includes('mud')) {
									ocs.push(`${name}.tribes`, 'mudwing');
									interactionB.update('The oc was successfully added!');
								} else if (tribe.toLowerCase().includes('sand')) {
									ocs.push(`${name}.tribes`, 'sandwing');
									interactionB.update('The oc was successfully added!');
								} else if (tribe.toLowerCase().includes('night')) {
									ocs.push(`${name}.tribes`, 'nightwing');
									interactionB.update('The oc was successfully added!');
								} else if (tribe.toLowerCase().includes('sea')) {
									ocs.push(`${name}.tribes`, 'seawing');
									interactionB.update('The oc was successfully added!');
								} else if (tribe.toLowerCase().includes('sky')) {
									ocs.push(`${name}.tribes`, 'skywing');
									interactionB.update('The oc was successfully added!');
								} else if (tribe.toLowerCase().includes('rain')) {
									ocs.push(`${name}.tribes`, 'rainwing');
									interactionB.update('The oc was successfully added!');
								} else if (tribe.toLowerCase().includes('ice')) {
									ocs.push(`${name}.tribes`, 'icewing');
									interactionB.update('The oc was successfully added!');
								} else if (tribe.toLowerCase().includes('leaf')) {
									ocs.push(`${name}.tribes`, 'leafwing');
									interactionB.update('The oc was successfully added!');
								} else if (tribe.toLowerCase().includes('hive')) {
									ocs.push(`${name}.tribes`, 'hivewing');
									interactionB.update('The oc was successfully added!');
								} else if (tribe.toLowerCase().includes('silk')) {
									ocs.push(`${name}.tribes`, 'silkwing');
									interactionB.update('The oc was successfully added!');
								} else {
									interactionB.update('The tribe is invalid!');
								}

							} else if (key === 'age') {
								if (!isNaN(value)) {
									ocs.set(`${name}.age`, Number(value));
									interactionB.update('The oc was successfully added!');
								} else {
									interaction.reply('Please insert a number');
								}
							} else if (key === 'owner') {
								ocs.set(`${name}.owner`, client.users.resolve(value.slice(3, -1)).username);
								interactionB.update('The oc was successfully added!');
							} else if (key === 'message') {
								ocs.set(`${name}.message.URL`, value);
								ocs.set(`${name}.message.Snowflake`, value.split('/')[value.split('/').length - 1]);
							} else {
								ocs.set(`${name}.${key}`, value);
								interactionB.update('The oc was successfully added!');
							}
						} else {
							interactionB.update('Alright, aborting...');
						}

					});

				}
			}
			break;

			// Fetches a message content and puts it in the database
		case 'message':
			await interaction.reply('This command puts your oc in my database.');
			const msg = interaction.options.getString('msg');

			if (msg.includes('/')) {
				message = await rWingsOfFireServer.channels.resolve('854858811101937704').messages.fetch(msg.split('/')[msg.split('/').length - 1])
					.catch(e => {
						interaction.reply('This message does not exits!');
						console.error(e);
					});
			} else {
				message = await rWingsOfFireServer.channels.resolve('854858811101937704').messages.fetch(msg)
					.catch(e => {
						interaction.reply('This message does not exits!');
						console.error(e);
					});
			}

			await addOc(message);
			await interaction.reply('The message was successfully added to the database! If there are other messages about that oc, please insert them too!');
			break;
		}
		break;

		// Start a quote quizz
	case 'quote':
		// If a quizz already is running, do not execute the command.
		if (!quoteBusy) {
			quoteBusy = true;

			// Get the quizz quotes
			const { quotes } = require('./quotes.json');

			// Choose one randomly
			const theChoosenOne = quotes[Math.floor((Math.random() * quotes.length) + 1) - 1];
			const quoteEmbed = new MessageEmbed()
				.setTitle('Who said this?')
				.setDescription(theChoosenOne.quote)
				.setFooter('You have 20 seconds, and only one try')
				.setColor('GREEN');
			await interaction.reply({ embeds: [quoteEmbed] });
			const timeOut = setTimeout(() => {
				stopIt = true;
				interaction.editReply({ content: 'This quizz is finished.', embeds: [] });
				interaction.channel.send({
					content: `Time's up! The answer was ${theChoosenOne.character}!`,
					embeds:  []
				});
				quoteBusy = false;
				const quizzEndedEmbed = new MessageEmbed()
					.setTitle('Quizz ended')
					.setDescription('This quizz has ended!')
					.setFooter('If you want to try that out, use the /quote command!')
					.setColor('GREEN');
				interaction.editReply({ embeds: [quizzEndedEmbed] });
			}, 20000);
			quotes.forEach(quote => {
				answers.push(quote.character.toLowerCase());
			});
			const filter = quizzAnswer => quizzAnswer.author.id !== client.user.id && answers.includes(quizzAnswer.content.toLowerCase());

			// eslint-disable-next-line no-inner-declarations
			function guess() {
				interaction.channel.awaitMessages({ filter, max: 1 }).then(quizzAnswer => {
					if (stopIt) {
						return;
					}
					if (quizzAnswer.first().content.toLowerCase() === theChoosenOne.character.toLowerCase()) {
						quizzAnswer.first().reply('Congratulation! This is correct!');
						clearTimeout(timeOut);
						quoteBusy = false;
						stopIt = true;
						const quizzEndedEmbed = new MessageEmbed()
							.setTitle('Quizz ended')
							.setDescription('This quizz has ended!')
							.setFooter('If you want to try that out, use the /quote command!')
							.setColor('GREEN');
						interaction.editReply({ embeds: [quizzEndedEmbed] });
					} else {
						quizzAnswer.first().reply('Nope, this is wrong!');
						guess();
					}
				});
			}

			guess();
		} else {
			interaction.reply('A quizz is already running! Please wait for it to finish before starting another one!');
		}
		break;

		// Get an inspiring quote from sunny!
	case 'sunny':
		const { quotes } = require('./quotes.json');
		const sunnyQuotes = quotes.filter(quote => quote.character === 'Sunny');
		interaction.reply({
			embeds: [new MessageEmbed()
				.setDescription(`"${sunnyQuotes[randInt(0, sunnyQuotes.length)].quote}"`)
				.setFooter('-Sunny')
				.setColor('GOLD')]
		});
		break;

		// Replies with fuck. Because why not.
	case 'fuck' :
		interaction.reply('fuck');
		break;

		// Flips a coin
	case 'fac':
	case 'flipacoin':
		if (random < 0.5) {
			interaction.reply({
				embeds: [new MessageEmbed().setDescription('It\'s tails!')
					.setTitle('The coin says...')
					.setColor('BLUE')
					.setThumbnail('https://cdn.discordapp.com/attachments/785186788003282987/792399120925065216/unknown.png')]
			});
		} else if (random > 0.5) {
			interaction.reply({
				embeds: [new MessageEmbed().setDescription('It\'s heads!')
					.setTitle('The coin says...')
					.setColor('BLUE')
					.setThumbnail('https://cdn.discordapp.com/attachments/785186788003282987/792399253040922664/unknown.png')]
			});
		} else {
			interaction.reply('It\'s... Oh, well the piece landed on its edge...');
		}
		// Almost impossible, but still funny

		break;

		// Try it yourself!
	case 'idiot':
		interaction.reply(`Here is an idiot for you: ${interaction.user.tag}`);
		break;

		// Random and customisable hybrid generator
	case 'hybridgen':
		const pyrrhian = interaction.options.getBoolean('pyrrhia');
		const pantalan = interaction.options.getBoolean('pantala');

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
			await interaction.reply('Please select at least one of the options!');
			break;
		}

		switch (firstHybridTribe) {
		case 'skywing':
			color = 'RED';
			break;

		case 'seawing':
			color = 'NAVY';
			break;

		case 'sandwing':
			color = 'GOLD';
			break;

		case 'nightwing':
			color = 'DARK_PURPLE';
			break;

		case 'icewing':
			color = [221, 255, 255];
			break;

		case 'mudwing':
			color = [112, 84, 62];
			break;

		case 'rainwing':
			color = 'RANDOM';
			break;

		case 'hivewing':
			color = 'DEFAULT';
			break;

		case 'silkwing':
			color = 'RANDOM';
			break;

		case 'leafwing':
			color = [48, 183, 0];
			break;

		}

		interaction.reply({
			embeds: [new MessageEmbed()
				.setTitle('I suggest...')
				.setDescription(`${firstHybridTribe} x ${secondHybridTribe}. What do you think about it?`)
				.setColor(color)]
		});

		break;

		// Prints a help message
		// ! WIP
	case 'help':
		const command = interaction.options.getString('cmd', false);
		if (command === null) {
			try {
				const embed = new Discord.MessageEmbed()
					.setTitle('Help')
					.setColor('ORANGE')
					.setFooter('Use /help cmd:<command> for more information on that command!')
					.addField('kill', 'Kills the bot. (Only available to bot-helper role)')
					.addField('ping', 'Get the time delay between when you send the message and when the bot detects it.')
					.addField('snek', 'snek.')
					.addField('stalk', 'Get notified when the user with the specified id logs in. Only works with this server\'s members.')
					.addField('oc get', 'Get infos about an oc. Needs to have fetched the oc to the database from the message beforehand. See /help cmd:ocmessage.')
					.addField('oc edit', 'Allows for the owner of the oc to edit in the database in case the data is wrong.')
					.addField('quote', 'Starts a quizz about a quote. Guess the character who said that quote!')
					.addField('fac, flip a coin', 'Flips a swiss coin. Warning: There is 1 in 100000000000000000 chance that the piece lands on its side. Be careful!')
					.addField('hybridgen', 'A hybrid generator for you!')
					.addField('oc message', 'Adds a message to the database')
					.addField('help', 'Shows this message!');
				interaction.reply(embed);
			} catch (e) {
				console.warn(e);
			}
		} else {
			interaction.reply('Coming soon!');
		}
	}
});

// Logging in
// ! Do not remove !
/**
 * * The token can be found at https://discord.com/developers/applications/771945913044303912/bot
 * * Put the token in a config.json file as following:
 * {
 * 	"token": "token here (with quotation marks!)"
 * }
 * * You can also use an environment variable named token
 * * Or you can use dotenv. Put the following in your .env file:
 * token=<token here, without the brackets>
 */
client.login(token)
	.catch(e => {
		console.error(e);
	});
