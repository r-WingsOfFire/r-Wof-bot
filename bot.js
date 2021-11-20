const Discord = require('discord.js');
const { Client, Intents, MessageEmbed } = Discord;
const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_PRESENCES
	]
});
var prefix = '+';

const { table } = require('quick.db');
var totalMessages = new table('totalMessage');
var stalking = new table('stalk');
var ocs = new table('OC');

var token = '';
var tokenBuffer = '';
const { exit, env } = require('process');
require('dotenv')?.config(); // For compatibility with windows

// Fetch token from evironment variable or from config file if env var not available
tokenBuffer = env.token;
if(tokenBuffer == undefined) {
	token = require('./config.json').token;
	tokenBuffer = token;
}
token = tokenBuffer;

// Fetch prefix from config file. Uses + if config file not available
try {
	{prefix;} require('./config.json');
} catch (e) {
	console.log(e);
} finally {
	console.log(`prefix: ${prefix}`);
}

// Used for hybridgen
const pytribes = ['skywing', 'seawing', 'icewing', 'nightwing', 'sandwing', 'mudwing', 'rainwing'];
const patribes = ['leafwing', 'hivewing', 'silkwing'];

// Used to check if the bot can start a new quote quizz
var quoteBusy = false;

// Not yet initialized because it is not logged in and therefore unable to fetch guilds
var rWingsOfFireServer;

/** Transforms a string to another string but with the first letter being uppercase.
 * @param {String} str the base string
 * @returns {String} the transformed string
 */
function toFirstUppercase(str) {
	if (str == '') return;

	str = str.toLowerCase();
	var bufferArray = str.split('');
	bufferArray[0] = bufferArray[0].toUpperCase();
	return bufferArray.join('');
}

/** Searches for a text in a message
 * @param {Discord.Message} message the message to search in
 * @param {String} text The text to look for
 * @param {bool} word If true, only returns the next word.
 * @returns {String} The next word or the end of the line
*/
function searchInMessage(message, text, word = true) {
	var output = '';
	if(message.content.toLowerCase().includes(text.toLowerCase())) {
		message.content.split('\n').forEach(line => {
			if (line.toLowerCase().includes(text.toLowerCase()) && output === '' && !line.toLowerCase().includes(' name ')) {
				if(word) {
					var foundInLine = false;
					line.split(' ').forEach(words => {
						if (words.toLowerCase().includes(text.toLowerCase())) foundInLine = true;
						if (text.toLowerCase().includes(words.toLowerCase())) foundInLine = true;
						if (!(words.toLowerCase().includes(text.toLowerCase()) || words.toLowerCase().includes(':') || words.toLowerCase().includes('resubmit') || words.toLowerCase().includes('resub')) && foundInLine && output === '')
							output = words;
					});
				} else
					output = line.toLowerCase().split(text.toLowerCase()).join('').split(':').join('');

			}
		});
	} else
		return 'N/A. If this is not supposed to be there, please contact <@373515998000840714>';

	return output;
}

/** Adds an oc to the database
 *
 * @param {Discord.Message} message The message to gather infos from
 */
async function addOc(message) {
	ocs = new table('OC');
	rWingsOfFireServer = client.guilds.resolve('716601325269549127');
	var ocChannel = rWingsOfFireServer.channels.resolve('854858811101937704');

	var name = '';
	var indexAdd = 0;
	const messagesFetched = Array.from((await ocChannel.messages.fetch({ before: message.id, limit: 10 })).sort((msg1, msg2) => msg2.createdTimestamp - msg1.createdTimestamp),([, value]) => (value));

	if(message.content.toLowerCase().includes('name') && message.content.toLowerCase().includes(':')) {
		if (message.content.toLowerCase().includes('name and common nicknames'))
			name = searchInMessage(message, 'name and common nicknames', false);
		else if (message.content.toLowerCase().includes('name and common and nicknams'))
			name = searchInMessage(message, 'name and common and nicknams', false);
		else if (message.content.toLowerCase().includes('name and common and nicknames'))
			name = searchInMessage(message, 'name and common and nicknames', false);
		else if (message.content.toLowerCase().includes('name and common nickname'))
			name = searchInMessage(message, 'name and common nickname', false);
		else if (message.content.toLowerCase().includes('name'))
			name = searchInMessage(message, 'name', false);

	} else {
		while(name === '') {
			if(messagesFetched[indexAdd].content.toLowerCase().includes('name') && message.content.toLowerCase().includes(':')) {
				if (messagesFetched[indexAdd].content.toLowerCase().includes('name and common nicknames'))
					name = searchInMessage(messagesFetched[indexAdd], 'name and common nicknames', false);
				else if (messagesFetched[indexAdd].content.toLowerCase().includes('name and common and nicknams'))
					name = searchInMessage(messagesFetched[indexAdd], 'name and common and nicknams', false);
				else if (messagesFetched[indexAdd].content.toLowerCase().includes('name and common and nicknames'))
					name = searchInMessage(messagesFetched[indexAdd], 'name and common and nicknames', false);
				else if (messagesFetched[indexAdd].content.toLowerCase().includes('name and common nickname'))
					name = searchInMessage(messagesFetched[indexAdd], 'name and common nickname', false);
				else if (messagesFetched[indexAdd].content.toLowerCase().includes('name'))
					name = searchInMessage(messagesFetched[indexAdd], 'name', false);

			}
			indexAdd++;
		}
	}
	var nameArr = name.split(';')[0]
		.split(',')[0]
		.split('|')[0]
		.split(' or ')[0]
		.split('(')[0]
		.split('*').join('')
		.split('-').join(' ')
		.split('  ').join(' ')
		.split(' ');
	while(nameArr[0] === '') nameArr.shift();
	while(nameArr[nameArr.length - 1] === '') nameArr.pop();
	nameArr.forEach((namePart, i) => {
		if(namePart != '') nameArr[i] = toFirstUppercase(namePart);
	});
	name = nameArr.join(' ');
	ocs.set(`${name}.message.Snowflake`, message.id);
	ocs.set(`${name}.message.URL`, `https://discord.com/channels/716601325269549127/854858811101937704/${message.id}`);
	if(message.embeds.length > 0) ocs.set(`${name}.image`, message.embeds[0].url);
	if(message.mentions.users.size > 0) ocs.set(`${name}.owner`, message.mentions.users.first().username);
	if(message.content.toLowerCase().includes('age')) ocs.set(`${name}.age`, Number(searchInMessage(message, 'age')));
	if(message.content.toLowerCase().includes('gender')) ocs.set(`${name}.gender`, searchInMessage(message, 'gender'));
	if(message.attachments.size > 0) ocs.set(`${name}.image`, message.attachments.first().url);
	if(message.content.toLowerCase().includes('tribes')) {
		var tribes = [];
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
		var finalTribes = [];
		tribes.forEach(tribe => {
			if (tribe.toLowerCase().includes('mud'))
				finalTribes.push('mudwing');
			else if (tribe.toLowerCase().includes('sand'))
				finalTribes.push('sandwing');
			else if (tribe.toLowerCase().includes('night'))
				finalTribes.push('nightwing');
			else if (tribe.toLowerCase().includes('sea'))
				finalTribes.push('seawing');
			else if (tribe.toLowerCase().includes('sky'))
				finalTribes.push('skywing');
			else if (tribe.toLowerCase().includes('rain'))
				finalTribes.push('rainwing');
			else if (tribe.toLowerCase().includes('ice'))
				finalTribes.push('icewing');
			else if (tribe.toLowerCase().includes('leaf'))
				finalTribes.push('leafwing');
			else if (tribe.toLowerCase().includes('hive'))
				finalTribes.push('hivewing');
			else if (tribe.toLowerCase().includes('silk'))
				finalTribes.push('silkwing');

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
			if (tribe.toLowerCase().includes('mud'))
				finalTribes.push('mudwing');
			else if (tribe.toLowerCase().includes('sand'))
				finalTribes.push('sandwing');
			else if (tribe.toLowerCase().includes('night'))
				finalTribes.push('nightwing');
			else if (tribe.toLowerCase().includes('sea'))
				finalTribes.push('seawing');
			else if (tribe.toLowerCase().includes('sky'))
				finalTribes.push('skywing');
			else if (tribe.toLowerCase().includes('rain'))
				finalTribes.push('rainwing');
			else if (tribe.toLowerCase().includes('ice'))
				finalTribes.push('icewing');
			else if (tribe.toLowerCase().includes('leaf'))
				finalTribes.push('leafwing');
			else if (tribe.toLowerCase().includes('hive'))
				finalTribes.push('hivewing');
			else if (tribe.toLowerCase().includes('silk'))
				finalTribes.push('silkwing');
		});
		ocs.set(`${name}.tribes`, finalTribes);
	} else if (!searchInMessage(message, 'tribe', false).includes('N/A'))
		ocs.push(`${name}.tribes`, searchInMessage(message, 'tribe'));

}

/** Picks a random tribe from pantala
 *
 * @returns {String} The random tribe
 */
function randomPantala() {
	return patribes[Math.floor(Math.random() * patribes.length)];
}

/** Picks a random tribe from pyrrhia
 *
 * @returns {String} The tribe
 */
function randomPyrrhia() {
	return pytribes[Math.floor(Math.random() * pytribes.length)];
}

/** Picks a random tribe
 *
 * @returns {String} The tribe
 */
function randomTribe() {
	if(Math.random() < 0.5) return randomPyrrhia();
	else return randomPantala();
}

/** Kinda like a dice.
 *
 * @param {Number} min The lowest number possible
 * @param {Number} max The highest number possible
 * @returns {Number} A pseudo-random nuber in the range [min ]max
 */
function randInt(min, max) {
	return Math.floor(Math.random() * max - min) + min;
}

// Executes when the bot is logged in
client.once('ready', async () => {
	rWingsOfFireServer = await client.guilds.fetch('716601325269549127'); // Sets the wings of fire server
	client.user.setUsername('r/WOF Bot'); // Sets the bot username
	console.log(`[${(`0${  new Date(Date.now()).getHours()}`).slice(-2)}:${(`0${  new Date(Date.now()).getMinutes()}`).slice(-2)}:${(`0${  new Date(Date.now()).getSeconds()}`).slice(-2)}] Logged in as ${client.user.tag}; ready!`); // Logs the date and username
	setInterval(() => { // Checks for stalked command
		stalking.all().forEach((stalk) => {
			stalk.data.forEach((stalked, index) => {
				rWingsOfFireServer.members.fetch({ withPresences: true }).then(fetchedMembers => {
					const totalOnline = fetchedMembers.filter(member => member.presence?.status === 'online' || member.presence?.status === 'dnd');
					console.log(fetchedMembers.get(stalked).presence);
					if(totalOnline.has(fetchedMembers.get(stalked).id)) {
						fetchedMembers.get(stalk.ID).send(`${fetchedMembers.get(stalked).user.username} is online!`);
						var stalkArray = stalking.get(`${stalk.ID}`);
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

	// Gives permissions to specific commands
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
});

client.on('messageCreate', (message) => { // Deprecated, migrating to 'interactionCreate'
	if (!message.author.bot) {
		var user = message.author;
		var channel = message.channel;

		// Qibli is written Qibli.
		if (message.content.toLowerCase().includes('quibli')) {
			message.reply('it is spelled Qibli.');
			console.log(`${user.username  } misspelled qibli`);
		}
		if (channel.type === 'text' && message.content.startsWith(prefix)) {
			var command = message.content.toLowerCase().slice(prefix.length).split(' ')[0];
			var server = message.guild;

			switch (command) {

			case 'emotes':
				// eslint-disable-next-line no-case-declarations
				let staticEmojis = [message.guild.emojis.cache.filter(e => !e.animated).array().slice(0, 30).join(' '), message.guild.emojis.cache.filter(e => !e.animated).array().slice(30).join(' ')];
				// eslint-disable-next-line no-case-declarations
				let animated = message.guild.emojis.cache.filter(e => e.animated).array().join(' ');
				channel.send(
					new MessageEmbed()
						.setTitle(`${server.name  }'s emotes!`)
						.addFields(
							{ name: 'Static', value: staticEmojis[0] },
							{ name: '_ _', value: staticEmojis[1] },
							{ name: 'Animated', value: animated }
						)
						.setColor('RANDOM')
				);
				break;

			default:
				if(message.content.toLowerCase().startsWith(`${prefix}log`))
					console.log(`${user.username  } wanted to log the message: ${message.content.slice(6)}`);
				else if (message.content.toLowerCase().startsWith(`${prefix}enlarge `)) {
					var msgArray = message.content.toLowerCase().split(' ');
					channel.send(new MessageEmbed().setImage(server.emojis.resolve(msgArray[1].slice(-19, -1)).url).setColor('RANDOM'));
				} else if (message.content.startsWith(`${prefix}poll `)) {
					var content = message.content.split(' ');
					content.shift();
					message.delete();
					if (content[0].toLowerCase() == 'thumbs') {
						channel.send(new MessageEmbed()
							.setColor('GREEN')
							.setTitle('Poll')
							.setFooter(`Poll made by user ${  user.username}`)
							.setDescription(content.slice(1).join(' ')))
							.then(poll => {
								poll.react('👍');
								poll.react('👎');
							});
					} else if (content[0].toLowerCase() == 'numbers') {
						channel.send(new MessageEmbed()
							.setColor('GREEN')
							.setTitle('Poll')
							.setFooter(`Poll made by user ${  user.username}`)
							.setDescription(content.slice(1).join(' ')))
							.then(poll => {
								poll.react('1️⃣');
								poll.react('2️⃣');
								poll.react('3️⃣');
								poll.react('4️⃣');
								poll.react('5️⃣');
								poll.react('6️⃣');
								poll.react('7️⃣');
								poll.react('8️⃣');
								poll.react('9️⃣');
								poll.react('🔟');
							});

					}

					console.log(`poll created in #${  message.channel.name  } by ${  message.author.username}`);
				} else if (message.content.toLowerCase().startsWith(`${prefix}rn `) || message.content.toLowerCase().startsWith(`${prefix  }randomnumber `)) {
					const randomNumber = Math.floor((Math.random() * (new Number(message.content.split(' ')[2]) - new Number(message.content.split(' ')[1]))) + 1) + new Number(message.content.split(' ')[1]);
					message.channel.send(`Here is a pseudo-random number for you: ${  randomNumber}`);
				} else if (message.content.toLowerCase().startsWith(`${prefix}whois `)) {
					const whoisEmbed = new MessageEmbed()
						.setColor('RED')
						.setTitle(`Who is ${  message.content.split(' ').slice(1).join(' ')  }?`)
						.setDescription('Find this out!')
						.setURL(`https://wingsoffire.fandom.com/wiki/${  message.content.split(' ').slice(1).join('_')}`)
						.setThumbnail(`https://wingsoffire.fandom.com/wiki/${  message.content.split(' ').slice(1).join('_')}`)
						.setFooter('The link isn\'t correct? Double check the case and the orthograph. Or maybe this entry just don\'t exist...');
					message.reply(whoisEmbed);
					console.log(`${user.username  } didn't know who ${  message.content.split(' ').slice(1).join(' ')  } was, but now they do!`);
				} else if (message.content.toLowerCase().startsWith(`${prefix}whatis `)) {
					const whoisEmbed = new MessageEmbed()
						.setColor('RED')
						.setTitle(`What is the ${  message.content.split(' ').slice(1).join(' ')  }?`)
						.setDescription('Find this out!')
						.setURL(`https://wingsoffire.fandom.com/wiki/${  message.content.split(' ').slice(1).join('_')}`)
						.setThumbnail(`https://wingsoffire.fandom.com/wiki/${  message.content.split(' ').slice(1).join('_')}`)
						.setFooter('The link isn\'t correct? Double check the case and the orthograph. Or maybe this entry just don\'t exist...');
					message.reply(whoisEmbed);
					console.log(`${user.username  } didn't know what ${  message.content.split(' ').slice(1).join(' ')  } were, but now they do!`);
				} else if (message.content.toLowerCase().startsWith(`${prefix}oc `)) {
					var found = false;
					server.channels.resolve('754470277634719845').messages.fetch({ limit: 100 })
						.then(oldMsg => {
							oldMsg.each(mess => {
								if (mess.content.toLowerCase().includes(`name: ${  message.content.toLowerCase().split(' ').slice(1).join(' ')  }\n`) || (mess.content.toLowerCase().includes(`name:${  message.content.toLowerCase().split(' ').slice(1).join(' ')  }\n`) || mess.content.toLowerCase().includes(`name: ${  message.content.toLowerCase().split(' ').slice(1).join(' ')  } `) || (mess.content.toLowerCase().includes(`name:${message.content.toLowerCase().split(' ').slice(1).join(' ')} `)))) {
									message.reply('Oc found!');
									channel.send(mess.url);
									found = true;
								}
							});
							if (!found) {
								server.channels.resolve('754470277634719845').messages.fetch({ limit: 100, before: oldMsg.last().id })
									.then(oldMsg2 => {
										oldMsg2.each(mess => {
											if (mess.content.toLowerCase().includes(`name: ${  message.content.toLowerCase().split(' ').slice(1).join(' ')  }\n`) || (mess.content.toLowerCase().includes(`name:${  message.content.toLowerCase().split(' ').slice(1).join(' ')  }\n`) || mess.content.toLowerCase().includes(`name: ${  message.content.toLowerCase().split(' ').slice(1).join(' ')  } `) || (mess.content.toLowerCase().includes(`name:${  message.content.toLowerCase().split(' ').slice(1).join(' ')  } `)))) {
												message.reply('Oc found!');
												channel.send(mess.url);
												found = true;
											}
										});
										if (!found) {
											server.channels.resolve('754470277634719845').messages.fetch({ limit: 100, before: oldMsg2.last().id })
												.then(oldMsg3 => {
													oldMsg3.each(mess => {
														if (mess.content.toLowerCase().includes(`name: ${  message.content.toLowerCase().split(' ').slice(1).join(' ')  }\n`) || (mess.content.toLowerCase().includes(`name:${  message.content.toLowerCase().split(' ').slice(1).join(' ')  }\n`) || mess.content.toLowerCase().includes(`name: ${  message.content.toLowerCase().split(' ').slice(1).join(' ')  } `) || (mess.content.toLowerCase().includes(`name:${  message.content.toLowerCase().split(' ').slice(1).join(' ')  } `)))) {
															message.reply('Oc found!');
															channel.send(mess.url);
															found = true;
														}
													});
													if (!found) {
														server.channels.resolve('754470277634719845').messages.fetch({ limit: 100, before: oldMsg3.last().id })
															.then(oldMsg4 => {
																oldMsg4.each(mess => {
																	if (mess.content.toLowerCase().includes(`name: ${  message.content.toLowerCase().split(' ').slice(1).join(' ')  }\n`) || (mess.content.toLowerCase().includes(`name:${  message.content.toLowerCase().split(' ').slice(1).join(' ')  }\n`) || mess.content.toLowerCase().includes(`name: ${  message.content.toLowerCase().split(' ').slice(1).join(' ')  } `) || (mess.content.toLowerCase().includes(`name:${  message.content.toLowerCase().split(' ').slice(1).join(' ')  } `)))) {
																		message.reply('Oc found!');
																		channel.send(mess.url);
																		found = true;
																	}
																});
																if (!found) {
																	server.channels.resolve('754470277634719845').messages.fetch({ limit: 100, before: oldMsg2.last().id })
																		.then(oldMsg5 => {
																			oldMsg5.each(mess => {
																				if (mess.content.toLowerCase().includes(`name: ${  message.content.toLowerCase().split(' ').slice(1).join(' ')  }\n`) || (mess.content.toLowerCase().includes(`name:${  message.content.toLowerCase().split(' ').slice(1).join(' ')  }\n`) || mess.content.toLowerCase().includes(`name: ${  message.content.toLowerCase().split(' ').slice(1).join(' ')  } `) || (mess.content.toLowerCase().includes(`name:${  message.content.toLowerCase().split(' ').slice(1).join(' ')  } `)))) {
																					message.reply('Oc found!');
																					channel.send(mess.url);
																					found = true;
																				}
																			});
																			if (!found) {
																				server.channels.resolve('754470277634719845').messages.fetch({ limit: 100, before: oldMsg2.last().id })
																					.then(oldMsg6 => {
																						oldMsg6.each(mess => {
																							if (mess.content.toLowerCase().includes(`name: ${  message.content.toLowerCase().split(' ').slice(1).join(' ')  }\n`) || (mess.content.toLowerCase().includes(`name:${  message.content.toLowerCase().split(' ').slice(1).join(' ')  }\n`) || mess.content.toLowerCase().includes(`name: ${  message.content.toLowerCase().split(' ').slice(1).join(' ')  } `) || (mess.content.toLowerCase().includes(`name:${  message.content.toLowerCase().split(' ').slice(1).join(' ')  } `)))) {
																								message.reply('Oc found!');
																								channel.send(mess.url);
																								found = true;
																							}
																						});
																						if (!found) {
																							server.channels.resolve('754470277634719845').messages.fetch({ limit: 100, before: oldMsg2.last().id })
																								.then(oldMsg7 => {
																									oldMsg7.each(mess => {
																										if (mess.content.toLowerCase().includes(`name: ${  message.content.toLowerCase().split(' ').slice(1).join(' ')  }\n`) || (mess.content.toLowerCase().includes(`name:${  message.content.toLowerCase().split(' ').slice(1).join(' ')  }\n`) || mess.content.toLowerCase().includes(`name: ${  message.content.toLowerCase().split(' ').slice(1).join(' ')  } `) || (mess.content.toLowerCase().includes(`name:${  message.content.toLowerCase().split(' ').slice(1).join(' ')  } `)))) {
																											message.reply('Oc found!');
																											channel.send(mess.url);
																											found = true;
																										}
																									});
																									if (!found) {
																										server.channels.resolve('754470277634719845').messages.fetch({ limit: 100, before: oldMsg2.last().id })
																											.then(oldMsg8 => {
																												oldMsg8.each(mess => {
																													if (mess.content.toLowerCase().includes(`name: ${  message.content.toLowerCase().split(' ').slice(1).join(' ')  }\n`) || (mess.content.toLowerCase().includes(`name:${  message.content.toLowerCase().split(' ').slice(1).join(' ')  }\n`) || mess.content.toLowerCase().includes(`name: ${  message.content.toLowerCase().split(' ').slice(1).join(' ')  } `) || (mess.content.toLowerCase().includes(`name:${  message.content.toLowerCase().split(' ').slice(1).join(' ')  } `)))) {
																														message.reply('Oc found!');
																														channel.send(mess.url);
																														found = true;
																													}
																												});
																												if (!found)
																													message.reply('Oc not found. The submission is maybe too old, or you misstyped the name. Please check both of the possibilities. Please note that the submission has to include "name: <oc\'s name>.');

																											});
																									}
																								});
																						}
																					});
																			}
																		});
																}
															});
													}
												});
										}
									});
							}
						});
				} else if (message.content.toLowerCase().startsWith(`${prefix}setmessagecount `) && (server.members.resolve(user.id).hasPermission('MANAGE_MESSAGES') || server.members.resolve(user.id).roles.cache.has('795414220707463188'))) {
					if (message.mentions.members.size == 1 && message.content.split(' ').length == 3 && !isNaN(message.content.split(' ')[2]))
						totalMessages.set(message.mentions.members.first().id, new Number(message.content.split(' ')[2]));
					else
						message.reply('Syntax incorrect. Please try again.');

				}
				break;
			}

		}
	}
});

client.on('interactionCreate', async interaction => {
	if(!interaction.isCommand()) return; // Check if the interaction is a command

	var color = ''; // For embeds colors;

	switch(interaction.commandName) {
	// Kill the bot
	case 'kill':
		if (interaction.member.roles.resolve('795414220707463188')) {
			await interaction.reply('Alright, the bot is logging out...')
				.catch((e) => {
					console.error(`tf is going on? an error occured... check that out:\n${  e}`);
				})
				.then(() => {
					var killer = interaction.user.username;
					console.warn(`The bot got killed by ${  killer}`);
					client.destroy();
					exit();
				});
		} else
			await interaction.reply({ 'content': 'You don\'t have permission to do that!', 'ephemeral': true });

		break;

	// Get bot latency
	case 'ping':
		var ping = new Date(Date.now()) - interaction.createdAt;

		if(ping >= 0) {
			if(ping <= 500) color = 'GREEN';
			if(ping <= 1000 && ping > 500) color = 'YELLOW';
			if(ping <= 1500 && ping > 1000) color = 'ORANGE';
			if(ping <= 2000 && ping > 1500) color = 'RED';
			if(ping > 2000) color = 'PURPLE';
			const PingEmbed = new MessageEmbed()
				.setColor(color)
				.setTitle('Pong! :ping_pong:')
				.setDescription(`Down ping: ${  ping  }ms`);
			let upPing = new Date(Date.now()) - (await interaction.reply({ 'embeds': [PingEmbed], fetchReply: true })).createdTimestamp;
			interaction.editReply({ embeds: [PingEmbed.setDescription(`Down ping: ${ping}ms\nUp ping: ${upPing}`)] });
		} else {
			const PingEmbed = new MessageEmbed()
				.setColor('RANDOM')
				.setTitle('Pong? :ping_pong:')
				.setDescription(`Emmm it is negative? Down ping: ${ping} ms...`);
			let upPing = new Date(Date.now()) - (await interaction.reply({ 'embeds': [PingEmbed], fetchReply: true })).createdTimestamp;
			interaction.editReply({ embeds: [PingEmbed.setDescription(`Emmm it is negative? \nDown ping: ${ping} ms\nUp ping: ${upPing}`)] });
		}
		console.log(`${interaction.user.username  } used ping`);
		break;

	// Snek
	case 'snek':
		await interaction.reply({
			files: [{
				attachment: 'https://cdn.discordapp.com/attachments/647616102339313667/795971177754525706/snek.jpg',
				name:       'snek.jpg'
			}]
		});
		console.log(`${interaction.user.username  } used snek`);
		break;

	// Get notified when specified user logs in
	case 'stalk':
		var stalked = interaction.options.getUser('user');
		await interaction.reply({ 'content': `You are now stalking ${stalked.username}. You will be notified when they log on.`, 'ephemeral': true });
		stalking.push(interaction.user.id, stalked.id);
		break;

	case 'oc':
		switch(interaction.options.getSubcommand()) {
		case 'get':
			ocs = new table('OC');
			var ocArr = [];
			var oc = '';
			interaction.options.getString('name').split(' ').forEach((namePart, i) => {
				ocArr[i] = toFirstUppercase(namePart);
			});
			oc = ocArr.join(' ');

			if(ocs.has(oc))	{
				switch(ocs.get(`${ocs}.tribes[0]`)) {
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
					let embed = new MessageEmbed()
						.setTitle(oc)
						.setColor(color)
						.setAuthor(ocs.get(`${oc}.owner`) || 'unavailable')
						.setURL(ocs.get(`${oc}.message.URL`) || 'https://discord.com/channels/716601325269549127/854858811101937704')
						.setFooter('This sheet might not be 100% accurate. If there is an error, please immediately report it to <@373515998000840714>')
						.addField('Tribe(s)', ocs.get(`${oc}.tribes`)?.join(' / ') || 'unavailable', true)
						.addField('Age', String(ocs.get(`${oc}.age`)) || 'unavailable', true)
						.addField('Gender', ocs.get(`${oc}.gender`) || 'unavailable', true);
					if(ocs.has(`${oc}.image`)) embed.setImage(ocs.get(`${oc}.image`) || 'https://nelowvision.com/wp-content/uploads/2018/11/Picture-Unavailable.jpg');
					await interaction.reply({ 'embeds': [embed], 'ephemeral': false });
				} catch (e) {
					console.log(ocs.get(`${oc}.owner`),
						ocs.get(`${oc}.message.URL`),
						ocs.get(`${oc}.image`),
						ocs.get(`${oc}.tribes`)?.join(' / ') || 'unavailable',
						ocs.get(`${oc}.age`),
						ocs.get(`${oc}.gender`));
					console.warn(e);
					// Ocs.delete(oc);
				}
			} else {
				await interaction.reply({ embeds: [new Discord.MessageEmbed()
					.setDescription('This oc is invalid. Please try again.')
					.setFooter('Did you add your oc to the database yet? Please check /help cmd:ocmessage to do so!')
					.setColor('RED')
					.setTitle('Oc invalid.')]
				});
			}
			break;

		case 'edit':
			var name = interaction.options.getString('name');
			var nameArr = name.split(';')[0]
				.split(',')[0]
				.split('|')[0]
				.split(' or ')[0]
				.split('(')[0]
				.split('*').join('')
				.split('-').join(' ')
				.split('  ').join(' ')
				.split(' ');
			if(nameArr[0] == '') nameArr.shift();
			if(nameArr[nameArr.length - 1] == '') nameArr.pop();
			nameArr = nameArr.join(' ').split(' ');
			nameArr.forEach((namePart, i) => {
				if(namePart != '') nameArr[i] = toFirstUppercase(namePart);
			});
			name = nameArr.join(' ');
			var key = interaction.options.getString('key');
			var	value = interaction.options.getString('value');

			if(key === 'deltribe') {
				if(ocs.has(name)) {
					if (ocs.get(`${name  }.owner`) != interaction.user.username || ocs.get(`${name  }.owner`) != undefined) {
						interaction.reply('You do not have the premissions to edit that oc!');
						return;
					}
					if(ocs.get(`${name}.tribes`).includes(value.toLowerCase())) {
						var array = ocs.get(`${name}.tribes`);
						array.splice(array.indexOf(value), 1);
						ocs.set(`${name  }.tribes`, array);
						interaction.reply('The tribe was successfully removed!');
					} else
						await interaction.reply(`The oc you specified does not have the ${value} tribe!`);

				} else
					await interaction.reply('The oc you specified is not in the database!');

			} else {
				if(ocs.has(name)) {
					if (ocs.get(`${name  }.owner`) != interaction.user.username && ocs.get(`${name  }.owner`) != undefined && !interaction.member.roles.cache.has('795414220707463188') && !interaction.member.roles.cache.has('762526998274113548')) {
						interaction.reply('You do not have the premissions to edit that oc!');
						console.log(interaction.user.username);
						return;
					}
					if(key === 'tribes') {
						var tribe = '';
						if (tribe.toLowerCase().includes('mud'))
							tribe = 'mudwing';
						else if (tribe.toLowerCase().includes('sand'))
							tribe = 'sandwing';
						else if (tribe.toLowerCase().includes('night'))
							tribe = 'nightwing';
						else if (tribe.toLowerCase().includes('sea'))
							tribe = 'seawing';
						else if (tribe.toLowerCase().includes('sky'))
							tribe = 'skywing';
						else if (tribe.toLowerCase().includes('rain'))
							tribe = 'rainwing';
						else if (tribe.toLowerCase().includes('ice'))
							tribe = 'icewing';
						else if (tribe.toLowerCase().includes('leaf'))
							tribe = 'leafwing';
						else if (tribe.toLowerCase().includes('hive'))
							tribe = 'hivewing';
						else if (tribe.toLowerCase().includes('silk'))
							tribe = 'silkwing';
						else
							interaction.reply('The tribe is invalid!');

						if(ocs.get(`${name  }.tribes`).includes(tribe))
							interaction.reply('The oc already has this tribe!');

					} else if (key === 'owner') {
						ocs.set(`${name}.owner`, client.users.resolve(value.slice(3, -1)).username);
						interaction.reply('The oc was successfully edited!');
					} else if(key === 'age') {
						if(!isNaN(value)) {
							ocs.set(`${name  }.${  key}`, new Number(value));
							interaction.reply('The oc was successfully edited!');
						}
						else interaction.reply('Please insert a number');
					} else {
						ocs.set(`${name  }.${  key}`, value);
						interaction.reply('The oc was successfully edited!');
					}
				} else {
					let buttons = new Discord.MessageActionRow()
						.addComponents(
							new Discord.MessageButton()
								.setLabel('Yes!')
								.setStyle('PRIMARY')
								.setCustomId('yes')
						).addComponents(
							new Discord.MessageButton()
								.setLabel('No...')
								.setStyle('PRIMARY')
								.setCustomId('no')
						);
					let reply = await interaction.reply({ content: 'This oc is not in the database! Do you want to create one?', components: [buttons], fetchReply: true });
					reply.awaitMessageComponent({ componentType: 'BUTTON', time: 15000, filter: interact => interact.user.id === interaction.user.id }).then(interactionB => {
						if(interactionB.customId === 'yes') {
							if(key === 'tribes') {
								if (tribe.toLowerCase().includes('mud')) {
									ocs.push(`${name  }.tribes`, 'mudwing');
									interactionB.update('The oc was successfully added!');
								} else if (tribe.toLowerCase().includes('sand')) {
									ocs.push(`${name  }.tribes`, 'sandwing');
									interactionB.update('The oc was successfully added!');
								} else if (tribe.toLowerCase().includes('night')) {
									ocs.push(`${name  }.tribes`, 'nightwing');
									interactionB.update('The oc was successfully added!');
								} else if (tribe.toLowerCase().includes('sea')) {
									ocs.push(`${name  }.tribes`, 'seawing');
									interactionB.update('The oc was successfully added!');
								} else if (tribe.toLowerCase().includes('sky')) {
									ocs.push(`${name  }.tribes`, 'skywing');
									interactionB.update('The oc was successfully added!');
								} else if (tribe.toLowerCase().includes('rain')) {
									ocs.push(`${name  }.tribes`, 'rainwing');
									interactionB.update('The oc was successfully added!');
								} else if (tribe.toLowerCase().includes('ice')) {
									ocs.push(`${name  }.tribes`, 'icewing');
									interactionB.update('The oc was successfully added!');
								} else if (tribe.toLowerCase().includes('leaf')) {
									ocs.push(`${name  }.tribes`, 'leafwing');
									interactionB.update('The oc was successfully added!');
								} else if (tribe.toLowerCase().includes('hive')) {
									ocs.push(`${name  }.tribes`, 'hivewing');
									interactionB.update('The oc was successfully added!');
								} else if (tribe.toLowerCase().includes('silk')) {
									ocs.push(`${name  }.tribes`, 'silkwing');
									interactionB.update('The oc was successfully added!');
								} else
									interactionB.update('The tribe is invalid!');

							} else if(key === 'age') {
								if(!isNaN(value)) {
									ocs.set(`${name  }.age`, new Number(value));
									interactionB.update('The oc was successfully added!');
								}
								else interaction.reply('Please insert a number');
							} else if (key === 'owner') {
								ocs.set(`${name  }.owner`, client.users.resolve(value.slice(3, -1)).username);
								interactionB.update('The oc was successfully added!');
							} else if(key === 'message') {
								ocs.set(`${name  }.message.URL`, value);
								ocs.set(`${name  }.message.Snowflake`, value.split('/')[value.split('/').length - 1]);
							} else {
								ocs.set(`${name  }.${  key}`, value);
								interactionB.update('The oc was successfully added!');
							}
						} else
							interactionB.update('Alright, aborting...');

					});

				}
			}
			break;

		case 'message':
			let msg = interaction.options.getString('msg');

			var message;
			if(msg.includes('/')) {
				message = await rWingsOfFireServer.channels.resolve('854858811101937704').messages.fetch(msg.split('/')[msg.split('/').length - 1])
					.catch(e => {
						interaction.reply('<@!373515998000840714>, an error occured!');
						console.error(e);
					});
			} else {
				message = await rWingsOfFireServer.channels.resolve('854858811101937704').messages.fetch(msg)
					.catch(e => {
						interaction.reply('<@!373515998000840714>, an error occured!');
						console.error(e);
					});
			}

			await addOc(message);
			await interaction.reply('The message was successfully added to the database! If there are other messages about that oc, please insert them too!');
			break;
		}
		break;

	case 'quote':
		if (!quoteBusy) {
			quoteBusy = true;
			const { quotes } = require('./quotes.json');
			const theChoosenOne = quotes[Math.floor((Math.random() * quotes.length) + 1) - 1];
			const quoteEmbed = new MessageEmbed()
				.setTitle('Who said this?')
				.setDescription(theChoosenOne.quote)
				.setFooter('You have 20 seconds, and only one try')
				.setColor('GREEN');
			interaction.reply({ embeds: [quoteEmbed] });
			var stopIt = false;
			let timeOut = setTimeout(() => {
				stopIt = true;
				interaction.editReply({ content: 'This quizz is finished.', embeds: [] });
				interaction.channel.send({ content: `The quizz is finished. The answer was ${  theChoosenOne.character}`, embeds: [] });
				quoteBusy = false;
			}, 20000);
			var answers = [];
			quotes.forEach(quote => {
				answers.push(quote.character.toLowerCase());
			});
			const filter = quizzAnswer => quizzAnswer.author.id != client.user.id && answers.includes(quizzAnswer.content.toLowerCase());
			// eslint-disable-next-line no-inner-declarations
			function guess() {
				interaction.channel.awaitMessages({ filter,  max: 1 }).then(quizzAnswer => {
					if(stopIt)
						return;

					if (quizzAnswer.first().content.toLowerCase() == theChoosenOne.character.toLowerCase()) {
						quizzAnswer.first().reply('Congratulation! This is correct!');
						clearTimeout(timeOut);
						quoteBusy = false;
						stopIt = true;
					} else {
						quizzAnswer.first().reply('Well... no, this is wrong.');
						guess();
					}
				});
			}
			guess();
		}
		break;

	case 'sunny':
		const { quotes } = require('./quotes.json');
		const sunnyQuotes = quotes.filter(quote => quote.character == 'Sunny');
		interaction.reply({ embeds: [new MessageEmbed()
			.setDescription(`"${  sunnyQuotes[randInt(0, sunnyQuotes.length)].quote  }"`)
			.setFooter('-Sunny')
			.setColor('GOLD')]
		});
		break;

	case 'fuck' :
		interaction.reply('fuck');
		break;

	case 'fac':
	case 'flipacoin':
		var random = Math.random();
		if(random < 0.5) {
			interaction.reply({ embeds: [new MessageEmbed().setDescription('It\'s tails!')
				.setTitle('The coin says...')
				.setColor('BLUE')
				.setThumbnail('https://cdn.discordapp.com/attachments/785186788003282987/792399120925065216/unknown.png')]
			});
		}
		else if(random > 0.5) {
			interaction.reply({ embeds: [new MessageEmbed().setDescription('It\'s heads!')
				.setTitle('The coin says...')
				.setColor('BLUE')
				.setThumbnail('https://cdn.discordapp.com/attachments/785186788003282987/792399253040922664/unknown.png')]
			});
		} else
			interaction.reply('It\'s... Oh, well the piece landed on its edge...');
			// Almost impossibe, but still funny

		break;

	case 'idiot':
		interaction.reply(`Here is an idiot for you: ${  interaction.user.tag}`);
		break;

	case 'hybridgen':
		let pyrrhian = interaction.options.getBoolean('pyrrhia');
		let pantalan = interaction.options.getBoolean('pantala');
		var first = '';
		var second = '';

		console.log(pyrrhian);
		console.log(pantalan);

		if(pyrrhian && pantalan) {
			first = randomTribe();
			do
				second = randomTribe();
			while (first === second);
		} else if (pyrrhian && !pantalan) {
			first = randomPyrrhia();
			do
				second = randomPyrrhia();
			while (first === second);
		} else if (!pyrrhian && pantalan) {
			first = randomPantala();
			do
				second = randomPantala();
			while (first === second);
		}

		switch(first) {
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

		interaction.reply({ embeds: [new MessageEmbed()
			.setTitle('I suggest...')
			.setDescription(`${first} x ${second}. What do you think about it?`)
			.setColor(color)]
		});

		break;

	case 'help':
		let command = interaction.options.getString('cmd', false);
		if(command === null)
		{try{
			let embed = new Discord.MessageEmbed()
				.setTitle('Help')
				.setColor('ORANGE')
				.setFooter('Use /help cmd:<command> for more informations on that command!')
				.addField('kill', 'Kills the bot. (Only available to bot-helper role)')
				.addField('ping', 'Get the time delay between when you send the message and when the bot detects it.')
				.addField('snek', 'snek.')
				.addField('stalk', 'Get notified when the user whith the specified id logs in. Only works with this server\'s members.' )
				.addField('oc get', 'Get infos about an oc. Needs to have fetched the oc to the database from the message beforehand. See /help cmd:ocmessage.' )
				.addField('oc edit', 'Allows for the owner of the oc to edit in the database in case the data is wrong.' )
				.addField('quote', 'Starts a quizz about a quote. Guess the character who said that quote!' )
				.addField('fac, flip a coin', 'Flips a swiss coin. Warning: There is 1 in 100000000000000000 chance that the piece lands on its side. Be careful!' )
				.addField('hybridgen', 'A hybrid generator for you!' )
				.addField('oc message', 'Adds a message to the database' )
				.addField('help', 'Shows this message!' );
			interaction.reply({ embeds: [embed] });
		} catch (e) {
			console.warn(e);
		}}
	}
});

client.login(token);
