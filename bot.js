/* eslint-disable max-nested-callbacks */
/* eslint-disable no-inner-declarations */
/* eslint-disable no-redeclare */
/* eslint-disable no-inline-comments */
const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const db = require('quick.db');
var totalMessages = new db.table('totalMessage');

const https = require('https');
const { exit } = require('process');
var { prefix, token } = require('./config.json');

var reactionRolesMessage = new Map();
var messageMods = new Array();

var forbiddenWords = ['placeholder1', 'placeholder2'];
var warns = new Map();
const helpstr = `${prefix}forbiddenwords\n ${prefix}quote\n ${prefix}fac (or ${prefix}flipacoin)\n ${prefix}ping\n ${prefix}sunny\n  ${prefix}hybridgen <pyrrhia/pantala/any> <same for #2>\n ${prefix}poll <thumbs/numbers> <question>\n ${prefix}whois (or ${prefix}whatis) <name or thing>\n ${prefix}sumthemup <user>\n ${prefix}oc <oc name>\n${prefix}messagemods <message>`;
const modhelpstr = prefix + `verbalwarn <mention user>\n ${prefix}log <message>\n${prefix}clearword <word>\n ${prefix}reply <modmail message ID> <message>\n ${prefix}getwarns <user>\n ${prefix}allowword <word ID>\n ${prefix}clearwarn <user>\n ${prefix}reactionrole (or ${prefix}rr) <channel>`;
const pytribes = ["skywing", "seawing", "icewing", "nightwing", "sandwing", "mudwing", "rainwing"];
const patribes = ["leafwing", "hivewing", "silkwing"];
const alltribes = ["skywing", "seawing", "icewing", "nightwing", "sandwing", "mudwing", "rainwing", "leafwing", "hivewing", "silkwing"];

var lastmessage = undefined;

var quoteBusy = false;

client.once('ready', () => {
	console.log('[' + ('0' + new Date(Date.now()).getHours()).slice(-2) + ':' + ('0' + new Date(Date.now()).getMinutes()).slice(-2) + ':' + ('0' + new Date(Date.now()).getSeconds()).slice(-2) + `] Logged in as ${client.user.tag}; ready!`);
	client.user.setUsername(`r/WOF Bot (${prefix})`);
	client.guilds.resolve('716601325269549127').roles.resolve('795414220707463188').setMentionable(true);
})

/**
 * Kinda like a dice.
 * @param {Number} min The lowest number possible
 * @param {Number} max The highest number possible
 * @returns {Number} A pseudo-random nuber in the range [min ]max
 */
function randInt(min, max) {
	return Math.floor(Math.random() * max - min) + min;
}

client.on('messageDelete', (msg) => {
	lastmessage = msg;
});

client.on('message', (message) => {
	if (!message.author.bot) {
		var user = message.author;
		if (message.content.toLowerCase().includes('quibli')) {
			message.reply('it is spelled Qibli.');
			console.log(user.username + ' misspelled qibli');
		}
		if (message.channel.type === 'text' && message.content.startsWith(prefix)) {
			var command = message.content.toLowerCase().slice(prefix.length).split(' ')[0];
			var args = message.content.toLowerCase().slice(prefix.length).split(' ').slice(1);
			var channel = message.channel;
			var server = message.guild;

			forbiddenWords.forEach(slur => {
				if(message.content.toLowerCase().includes(' ' + slur) || message.content.toLowerCase().includes(slur + ' ')) {
					message.delete({ reason: 'Contains a forbidden word.' });
					channel.send('*This message was automatically deleted, because it contains a forbidden word. Please check your message twice before sending it.*');

					var badword = new Discord.MessageEmbed()
						.setColor('RED')
						.setTitle(user.tag + ' said something bad in #' + message.channel.name)
						.setDescription(message.content)
						.setFooter('This is an automated message. The original message was deleted and logged here insted.');
					client.channels.fetch('718192469560262656')
						.then(logChannel => {
							logChannel.send(badword);
						});
					console.log(user.username + ' said something bad');
				}
			});

			switch (command) {
			case 'quote':
				if (!quoteBusy) {
					quoteBusy = true;
					fs.readFile('./quotes.json', (err, result) => {
						if (err) console.error(err);
						const theChoosenOne = JSON.parse(result).quotes[Math.floor((Math.random() * JSON.parse(result).quotes.length) + 1) - 1];
						var hahYouLose = [];
						const quoteEmbed = new Discord.MessageEmbed()
							.setTitle('Who said this?')
							.setDescription(theChoosenOne.quote)
							.setFooter('You have 20 seconds, and only one try')
							.setColor('GREEN');
						channel.send(quoteEmbed);
						var stopIt = false;
						let timeOut = setTimeout(() => {
							stopIt = true;
							channel.send('The quizz is finished. The answer was ' + theChoosenOne.character);
							quoteBusy = false;
						}, 20000);
						var answers = [];
						JSON.parse(result).quotes.forEach(quote => {
							answers.push(quote.character.toLowerCase());
						});
						const filter = quizzAnswer => quizzAnswer.author.id != client.user.id && answers.includes(quizzAnswer.content.toLowerCase());
						function awaitQuizzMessage() {
							channel.awaitMessages(filter, { max: 1 })
								.then(quizzAnswer => {
									if (stopIt) {
										return;
									}
									if (!hahYouLose.includes(quizzAnswer.first().author.id)) {
										if (quizzAnswer.first().content.toLowerCase() == theChoosenOne.character.toLowerCase()) {
											quizzAnswer.first().reply('Congratulation! This is correct!');
											clearTimeout(timeOut);
											quoteBusy = false;
											return;
										} else {
											quizzAnswer.first().reply('Well... no, this is wrong.');
											hahYouLose.push(quizzAnswer.first().author.id);
											awaitQuizzMessage();
										}
									}
								});
						}
						awaitQuizzMessage();
					});
				}
				break;
			case 'fuck' && (server.members.resolve(user.id).permissions.has('ADMINISTRATOR')) || (server.members.resolve(user.id).roles.cache.has('795847347397066773')) || (server.members.resolve(user.id).roles.cache.has('742827962944061593')) :
				channel.send('fuck');
				break;

			case 'fac':
			case 'flipacoin':
				var random = Math.random();
				if(random < 0.5) {
					message.reply(
						new Discord.MessageEmbed().setDescription('It\'s tails!')
							.setTitle('The coin says...')
							.setColor('BLUE')
							.setThumbnail('https://cdn.discordapp.com/attachments/785186788003282987/792399120925065216/unknown.png')
					);
				}
				else if(random > 0.5) {
					message.reply(
						new Discord.MessageEmbed().setDescription('It\'s heads!')
							.setTitle('The coin says...')
							.setColor('BLUE')
							.setThumbnail('https://cdn.discordapp.com/attachments/785186788003282987/792399253040922664/unknown.png')
					);
				} else {
					message.reply('It\'s... Oh, well the piece landed on its edge...');
					// almost impossibe, but still funny
				}
				break;

			case 'idiot':
				channel.send('Here is an idiot for you: ' + user.tag);
				break;

			case 'kill':
				if (user.id == '373515998000840714' || user.id == '306582338039709696') {
					channel.send('Alright, the bot is logging out...')
						.catch((e) => {
							console.error('tf is going on? an error occured... check that out:\n' + e);
						})
						.then(() => {
							var killer = new String;
							if (user.id == '373515998000840714') {
								killer = 'Baguette speaker';
							}
							if (user.id == '306582338039709696') {
								killer = 'snek';
							}
							console.warn('The bot got killed by ' + killer);
							client.destroy();
							exit();
						});
				} else {
					channel.send('You don\'t have permission to do that!');
				}
				break;

			case 'ping':
				var ping = new Date(Date.now()) - message.createdAt;
				var color;
				if(ping >= 0) {
					if(ping <= 500) color = 'GREEN';
					if(ping <= 1000 && ping > 500) color = 'YELLOW';
					if(ping <= 1500 && ping > 1000) color = 'ORANGE';
					if(ping <= 2000 && ping > 1500) color = 'RED';
					if(ping > 2000) color = 'PURPLE';
					const PingEmbed = new Discord.MessageEmbed()
						.setColor(color)
						.setTitle('Pong! :ping_pong:')
						.setDescription(ping + 'ms');
					message.channel.send(PingEmbed);
				} else {
					const PingEmbed = new Discord.MessageEmbed()
						.setColor('RANDOM')
						.setTitle('Pong? :ping_pong:')
						.setDescription(`Emmm it is negative? ${ping} ms...`);
					message.channel.send(PingEmbed);
				}
				console.log(user.username + ' used ping');
				break;

			case 'snek':
				channel.send({
					files: [{
						attachment: 'https://cdn.discordapp.com/attachments/647616102339313667/795971177754525706/snek.jpg',
						name: 'snek.jpg'
					}]
				});
				console.log(user.username + ' used snek');
				break;

			case 'sunny':
				fs.readFile('./quotes.json', (err, result) => {
					if (err) return console.error(err);
					const sunnyQuotes = JSON.parse(result).quotes.filter(quote => quote.character == 'Sunny');
					channel.send(new Discord.MessageEmbed()
						.setDescription('"' + sunnyQuotes[randInt(0, sunnyQuotes.length)].quote + '"')
						.setTitle('Sunny said...')
						.setFooter('-Sunny')
						.setColor('GOLD')
					);
				});
				break;

			case 'snipe':
				if (server.members.resolve(user.id).roles.cache.has('751577896132280330') || server.members.resolve(user.id).roles.cache.has('795414220707463188')) {
					if (lastmessage != undefined) {
						channel.send(
							new Discord.MessageEmbed()
								.setAuthor(lastmessage.author.tag)
								.setColor('RED')
								.setDescription(lastmessage.content)
						);
						lastmessage = undefined;
					} else {
						channel.send('There is nothing to snipe!');
					}
				}
				break;

			case 'forbiddenwords':
				forbiddenWords.forEach((word) => {
					user.createDM()
						.then(DMchannel => {
							DMchannel.send('[' + (forbiddenWords.indexOf(word) + 1) + ']: ' + word);
						});
				});
				console.log('checked forbidden words');
				break;

			case 'serverinfo':
				// eslint-disable-next-line no-case-declarations
				let monthNumberToStr = new Map()
					.set(0, 'January')
					.set(1, 'February')
					.set(2, 'March')
					.set(3, 'April')
					.set(4, 'May')
					.set(5, 'June')
					.set(6, 'July')
					.set(7, 'August')
					.set(8, 'September')
					.set(9, 'October')
					.set(10, 'November')
					.set(11, 'December');
				// eslint-disable-next-line no-case-declarations
				let toHumanReadable = new Map()
					.set('us-east', 'US East');
				var memberco = message.guild.memberCount;
				var offlineCount = message.guild.members.cache.filter(m => m.presence.status === 'offline').size;
				var onlineCount = memberco - offlineCount;
				var creationdate = monthNumberToStr.get(message.guild.createdAt.getUTCMonth()) + ' ' + message.guild.createdAt.getUTCDate() + ', ' + message.guild.createdAt.getUTCFullYear();
				var serverIcon = message.guild.iconURL();
				var twoFA = new String();
				var defaultNotif = message.guild.defaultMessageNotifications;
				var features = [];
				message.guild.features.forEach((f, index) => {
					features[index] = toFirstUppercase(f.replace(/_/gi, ' '));
				});
				features = features.join(', ');
				// eslint-disable-next-line no-case-declarations
				function toFirstUppercase(entry) {
					if (typeof entry == 'string') {
						var entryArr = entry.split(' ');
						entryArr.forEach((word, index) => {
							entryArr[index] = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
						});
						return entryArr.join(' ');
					} else {
						process.stderr.write('Error: Not a string');
					}
				}
				defaultNotif = toFirstUppercase(defaultNotif);
				if (message.guild.mfaLevel == 0) {
					twoFA = 'Not Required';
				} else {
					twoFA = 'Required';
				}
				var rolesArray = [];
				rolesArray = message.guild.roles.cache.array().slice(0, 40);
				rolesArray.push('and ' + new Number(message.guild.roles.cache.size - 40) + ' more...');
				var emojisArray = [];
				emojisArray = message.guild.emojis.cache.array().slice(0, 30);
				emojisArray.push('and ' + new String(message.guild.emojis.cache.size - 30) + ` more. Run ${prefix}emotes for a full list!`);
				var serverinfoembed = new Discord.MessageEmbed()
					.setColor('RANDOM')
					.setTitle('Server Info for ' + message.guild.name)
					.addFields(
						{ name: 'Server Name', value: message.guild.name, inline: true },
						{ name: 'Owner', value: message.guild.owner.user.tag, inline: true },
						{ name: 'Region', value: toHumanReadable.get(message.guild.region), inline: true },
						{ name: '2FA Settings', value: twoFA, inline: true },
						{ name: 'Verification Level', value: toFirstUppercase(message.guild.verificationLevel.toString()), inline: true },
						{ name: 'Notifications', value: toFirstUppercase(defaultNotif), inline: true },
						{ name: 'Boost Status', value: message.guild.premiumSubscriptionCount + ' Boosts (Level ' + message.guild.premiumTier + ')', inline: true },
						{ name: 'Created on', value: creationdate, inline: true },
						{ name: 'Wof bot joined on', value: monthNumberToStr.get(server.members.resolve(client.user.id).joinedAt.getUTCMonth()) + ' ' + server.members.resolve(client.user.id).joinedAt.getUTCDate() + ', ' + server.members.resolve(client.user.id).joinedAt.getUTCFullYear(), inline: true },
						{ name: 'Members [' + memberco + ']', value: '🟢 Active Members: ' + onlineCount + '\n👥 Humans: ' + server.members.cache.filter(m => !m.user.bot).size + '\n🤖 Bots: ' + server.members.cache.filter(m => m.user.bot).size + '\n🔈 In VC: ' + server.members.cache.filter(m => typeof m.voice.speaking == 'boolean').size, inline: true },
						{ name: 'Channels [' + server.channels.cache.size + ']', value: '⌨️ Text: ' + server.channels.cache.filter(c => c.type == 'text').size + '\n🔈 Voice: ' + server.channels.cache.filter(c => c.type == 'voice').size + '\n📁 Category: ' + server.channels.cache.filter(c => c.type == 'category').size + '\n🗞 News/Store: ' + server.channels.cache.filter(c => c.type == 'news' || c.type == 'store').size, inline: true },
						{ name: 'Roles [' + message.guild.roles.cache.size + ']', value: rolesArray.slice(0, 41).join(' ') },
						{ name: 'Emotes [' + message.guild.emojis.cache.size + ']', value: emojisArray.slice(0, 31).join(' ') },
						{ name: 'Features', value: features }
					)
					.setThumbnail(serverIcon)
					.setFooter('Server Info for r/wingsoffire Discord Server');
				channel.send(serverinfoembed);
				console.log(user.username + ' requested the server\'s info');
				break;

			case 'emotes':
				// eslint-disable-next-line no-case-declarations
				let staticEmojis = [message.guild.emojis.cache.filter(e => !e.animated).array().slice(0, 30).join(' '), message.guild.emojis.cache.filter(e => !e.animated).array().slice(30).join(' ')];
				// eslint-disable-next-line no-case-declarations
				let animated = message.guild.emojis.cache.filter(e => e.animated).array().join(' ');
				channel.send(
					new Discord.MessageEmbed()
						.setTitle(server.name + '\'s emotes!')
						.addFields(
							{ name: 'Static', value: staticEmojis[0] },
							{ name: '_ _', value: staticEmojis[1] },
							{ name: 'Animated', value: animated }
						)
						.setColor('RANDOM')
				);
				break;

			case 'subredditinfo':
			case 'sri':
				// eslint-disable-next-line no-redeclare
				var memberco;
				// eslint-disable-next-line no-redeclare
				var offlineCount;
				// eslint-disable-next-line no-redeclare
				var onlineCount;
				// eslint-disable-next-line no-redeclare
				var creationDate;
				// eslint-disable-next-line no-redeclare
				var serverIcon;
				// eslint-disable-next-line no-case-declarations
				const req = https.request('https://www.reddit.com/r/WingsOfFire/about.json', res => {
					let chunks = [];
					res.on('data', (chunk) => {
						chunks.push(chunk);
					})
						.on('end', () => {
							let result = Buffer.concat(chunks);
							let tmpResult = result.toString();
							try {
								let parsedObj = JSON.parse(tmpResult);
								// Print the string if you want to debug or prettify.
								// console.log(tmpResult);
								if (parsedObj.data) {
									memberco = parsedObj.data.subscribers;
									onlineCount = parsedObj.data.active_user_count;
									offlineCount = memberco - onlineCount;
									creationDate = new Date(parsedObj.data.created_utc * 1000);
									// eslint-disable-next-line no-shadow
									let creationdate = creationDate.getMonth().toString() + '/' + creationDate.getDate().toString() + '/' + creationDate.getFullYear().toString() + ' at ' + creationDate.getHours().toString() + ':' + creationDate.getMinutes().toString() + ' UTC';
									serverIcon = parsedObj.data.icon_img;
									// eslint-disable-next-line no-shadow
									var serverinfoembed = new Discord.MessageEmbed()
										.setColor('GREEN')
										.setTitle('Subreddit Info for /r/WingsOfFire')
										.addFields(
											{ name: 'Member count', value: (memberco) },
											{ name: 'offline', value: offlineCount, inline: true },
											{ name: 'online', value: onlineCount, inline: true },
											{ name: 'Creation Date', value: (creationdate) }
										)
										.setImage(serverIcon)
										.setFooter('Subreddit Info for r/wingsoffire Discord Server');
									channel.send(serverinfoembed);
									console.log(user.username + ' requested the subreddit\'s info');
								}
							} catch (err) {
								console.log('There was an error!');
								console.log(err.stack);
								// I got an error, TypeError: Invalid data, chunk must be a string or buffer, not object
								// Also I got this, when I'd pushed d.toString to chunks:
								// TypeError: "list" argument must be an Array of Buffer or Uint8Array instances
								process.stderr.write(err);
							}
						});
				});

				req.on('error', err => {
					console.error(err);
				});

				req.end();
				break;

			default:
				if (message.content.toLowerCase().startsWith(prefix + 'help')) {
					var helpmsg = message.content.slice(6);
					if (helpmsg == 'forbiddenwords') {
						channel.send(new Discord.MessageEmbed()
							.setColor('DARK_GREEN')
							.setTitle('forbiddenwords command help')
							.setDescription('+forbiddenwords = sends a list of forbidden words to your dms. ')
							.setFooter('Contact Snek or Baguette Speaker if you have any questions.'));
					}
					else if (helpmsg == 'quote') {
						channel.send(new Discord.MessageEmbed()
							.setColor('DARK_GREEN')
							.setTitle('quote command help')
							.setDescription('+quote will give you a random quote from a character out of the books. Your goal is to guess which character said it before the time expires. Simply type the character\'s name in the chat when you think you know who it is.')
							.setFooter('Contact Snek or Baguette speaker if you have any questions.'));
					}
					else if ((helpmsg == 'fac') || (helpmsg == 'flipacoin')) {
						channel.send(new Discord.MessageEmbed()
							.setColor('DARK_GREEN')
							.setTitle('flipacoin command help')
							.setDescription('+flipacoin (or +fac) will do a coinflip, giving you either heads or tails as a result.')
							.setFooter('Contact Snek or Baguette speaker if you have any questions.'));
					}
					else if (helpmsg == 'ping') {
						channel.send(new Discord.MessageEmbed()
							.setColor('DARK_GREEN')
							.setTitle('ping command help')
							.setDescription('+ping checks the responsiveness of the bot and your internet. If the bot seems to be malfunctioning or not working at all, you can do +ping to see if it is working. If the bot does not respond, there may be a problem.')
							.setFooter('Contact Snek or Baguette speaker if you have any questions.'));
					}
					else if (helpmsg == 'sunny') {
						channel.send(new Discord.MessageEmbed()
							.setColor('DARK_GREEN')
							.setTitle('sunny command help')
							.setDescription('+sunny gives you a random, upbeat quote from sunny')
							.setFooter('Contact Snek or Baguette speaker if you have any questions.'));
					}
					else if (helpmsg == 'hybridgen') {
						channel.send(new Discord.MessageEmbed()
							.setColor('DARK_GREEN')
							.setTitle('hybridgen command help')
							.setDescription('+hybirdgen <pyrrhia/pantala/any> <py/pa/any> will give you a random hybrid combination within the peramaters that you chose. You may choose to specify "pyrrhia", "pantala", or "any" within the command. You can also leave it blank, and it will revert to <any> <any>. You may also only use one peramater, and leave the other blank. Any spot that is left blank will automatically use the "any" list.')
							.setFooter('Contact Snek or Baguette speaker if you have any questions.'));
					}
					else if (helpmsg == 'poll') {
						channel.send(new Discord.MessageEmbed()
							.setColor('DARK_GREEN')
							.setTitle('poll command help')
							.setDescription('+poll <thumbs/numbers> <question or proposal> will create a poll from the question or proposal you put in there. If you specifed thumbs, you would get reactions of thumbsup and thumbsdown. If you specified numbers, you will get reactions of numbers from 1-10. You can then react to vote on it.')
							.setFooter('Contact Snek or Baguette speaker if you have any questions.'));
					}
					else if ((helpmsg == 'whois') || (helpmsg == 'whatis')) {
						channel.send(new Discord.MessageEmbed()
							.setColor('DARK_GREEN')
							.setTitle('whatis/whois command help')
							.setDescription('+whatis (or +whois) Will search the wings of fire wiki for the thing or character you specified. If it does not match exactly, it may not work. This one is a bit touchy.')
							.setFooter('Contact Snek or Baguette speaker if you have any questions.'));
					}
					else if (helpmsg == 'sumthemup') {
						channel.send(new Discord.MessageEmbed()
							.setColor('DARK_GREEN')
							.setTitle('sumthemup command help')
							.setDescription('+sumthemup <user> will check out all the stats of the user specified.')
							.setFooter('Contact Snek or Baguette speaker if you have any questions.'));
					}
					else if (helpmsg == 'oc') {
						channel.send(new Discord.MessageEmbed()
							.setColor('DARK_GREEN')
							.setTitle('oc command help')
							.setDescription('+oc <oc name> will search the approved channel for a character by that name, and give you the bio, if it can be found.')
							.setFooter('Contact Snek or Baguette speaker if you have any questions.'));
					}
					else if (helpmsg == 'messagemods') {
						channel.send(new Discord.MessageEmbed()
							.setColor('DARK_GREEN')
							.setTitle('messagemods command help')
							.setDescription('+messagemods <message> is a command that is only to be used in the bot\'s dms. It will give your message directly to us, in a mod chat, and we can then respond through the bot. If you\'re familiar with it, it\'s basically reddit modmail on discord.')
							.setFooter('Contact Snek or Baguette speaker if you have any questions.'));
					}
					else if (helpmsg == '') {
						channel.send(new Discord.MessageEmbed()
							.setColor([0, 255, 0])
							.setTitle('Commands list')
							.addField('Specific Commands', 'You can do +help <command> for specifics on the command you select.\n ex: +help poll will tell you all about the poll command.')
							.setDescription(helpstr)
							.setFooter('Contact Snek or Baguette speaker if you have any questions.'));
					}
					else {
						channel.send(new Discord.MessageEmbed()
							.setColor([255, 0, 0])
							.setTitle('Error')
							.setDescription('Did you type in the wrong command name? Check it again.')
							.setFooter('Contact Snek or Baguette speaker if you have any questions.'));
					}
				}
				if (message.content.toLowerCase().startsWith(prefix + 'modhelp')) {
					if ((server.members.resolve(user.id).permissions.has('ADMINISTRATOR')) || (server.members.resolve(user.id).roles.cache.has('795847347397066773')) || (server.members.resolve(user.id).roles.cache.has('742827962944061593'))) {
						var modhelpmsg = message.content.slice(9);
						if (modhelpmsg == 'verbalwarn') {
							channel.send(new Discord.MessageEmbed()
								.setColor('DARK_BLUE')
								.setTitle('verbalwarn command help')
								.setDescription('+verbalwarn <reason/message> = obviously, warns the person, and sends that message in their dms. Bot will then send a message to <#718192469560262656>')
								.setFooter('Contact Snek or Baguette speaker if you have any questions.'));
						}
						else if (modhelpmsg == 'log') {
							channel.send(new Discord.MessageEmbed()
								.setColor('DARK_BLUE')
								.setTitle('bot log command help')
								.setDescription('+log <message> = will simply log any message you want to log to the bot\'s output console.')
								.setFooter('Contact Snek or Baguette speaker if you have any questions.'));
						}
						else if (modhelpmsg == 'clearword') {
							channel.send(new Discord.MessageEmbed()
								.setColor('DARK_BLUE')
								.setTitle('clwarword command help')
								.setDescription('+clearword <word> = adds the selected word to the forbiddenwords list, where it will delete any message containing that word.')
								.setFooter('Contact Snek or Baguette speaker if you have any questions.'));
						}
						else if (modhelpmsg == 'reply') {
							channel.send(new Discord.MessageEmbed()
								.setColor('DARK_BLUE')
								.setTitle('reply command help')
								.setDescription('+reply <modmail ID> <message> = Will send a message back to the person who sent the modmail message selected. It will send the message from <message>.')
								.setFooter('Contact Snek or Baguette speaker if you have any questions.'));
						}
						else if (modhelpmsg == 'getwarns') {
							channel.send(new Discord.MessageEmbed()
								.setColor('DARK_BLUE')
								.setTitle('getwarns command help')
								.setDescription('+getwarns <user> = will list out each of the verbalwarns that the user in question has recieved. (ping the user by doing "<@[id]>" and replacing the [id] with the user\'s ID.)')
								.setFooter('Contact Snek or Baguette speaker if you have any questions.'));
						}
						else if (modhelpmsg == 'allowword') {
							channel.send(new Discord.MessageEmbed()
								.setColor('DARK_BLUE')
								.setTitle('allowword command help')
								.setDescription('+allowword <worrd ID> = Removes the selected word from the forbiddenwords list, if it exists.')
								.setFooter('Contact Snek or Baguette speaker if you have any questions.'));
						}
						else if (modhelpmsg == 'clearwarn') {
							channel.send(new Discord.MessageEmbed()
								.setColor('DARK_BLUE')
								.setTitle('clearwarn command help')
								.setDescription('+clearwarn <user> = will get rid of all the verbalwarns that the user has accumlated.')
								.setFooter('Contact Snek or Baguette speaker if you have any questions.'));
						}
						else if ((modhelpmsg == 'reactionrole') || (helpmsg == 'rr')) {
							channel.send(new Discord.MessageEmbed()
								.setColor('DARK_BLUE')
								.setTitle('reactionrole (rr) command help')
								.setDescription('+reactionrole (or +rr) <channel mention> = Select a channel by mentioning it, then follow the prompts to create a reactionrole message. Then the reactionrole message will appear in the channel you selected.')
								.setFooter('Contact Snek or Baguette speaker if you have any questions.'));
						}
						else if (modhelpmsg == '') {
							channel.send(new Discord.MessageEmbed()
								.setColor([0, 0, 255])
								.setTitle('r/Wingsoffire Bot Mod Help')
								.addField('Specific Mod Commands', 'You can do +modhelp <command> for specifics on the command you select. ex: +clearwarn poll will tell you all about the clearwarn command.')
								.setDescription(modhelpstr)
								.setFooter('Contact Snek or Baguette speaker if you have any questions.'));
						}
						else {
							channel.send(new Discord.MessageEmbed()
								.setColor([255, 0, 0])
								.setTitle('Error')
								.setDescription('Did you type in the wrong command name? Check it again.')
								.setFooter('Contact Snek or Baguette speaker if you have any questions.'));
						}
					}
					else {
						channel.send(new Discord.MessageEmbed()
							.setColor([255, 0, 0])
							.setTitle('Permissions Issue')
							.setDescription('You don\t have permission to do that.')
							.setFooter('Contact Snek if this is an issue.'));
					}
				}
				if (message.content.toLowerCase().startsWith(prefix + 'hybridgen')) {
					if (message.content.slice(10 + prefix.length).toLowerCase().startsWith('pyrrhia')) {
						console.log(pytribes);
						var pytribegen1 = pytribes[Math.floor(Math.random() * pytribes.length)];
						if (message.content.slice(18 + prefix.length).toLowerCase() == 'pyrrhia') {
							var pytribegen2 = pytribes[Math.floor(Math.random() * pytribes.length)];
							if (pytribegen1 == pytribegen2) {
								console.log('double; ' + pytribegen1 + ' ' + pytribegen2);
								pytribegen2 = "reset";
								console.log(pytribegen2);
								pytribegen2 = pytribes[Math.floor(Math.random() * pytribes.length)];
								var hybridgenembed = (pytribegen1 + ' x ' + pytribegen2);
								channel.send(new Discord.MessageEmbed()
									.setColor('RANDOM')
									.setTitle('Random Hybrid Generator')
									.setFooter('This is a randomly generated hybrid combination.')
									.setDescription(hybridgenembed));
								console.log('double reset; ' + pytribegen1 + ' ' + pytribegen2);
							} else {
								var hybridgenembed = (pytribegen1 + ' x ' + pytribegen2);
								channel.send(new Discord.MessageEmbed()
									.setColor('RANDOM')
									.setTitle('Random Hybrid Generator')
									.setFooter('This is a randomly generated hybrid combination.')
									.setDescription(hybridgenembed));
							}
							console.log('normal');

						}
						if (message.content.slice(18 + prefix.length).toLowerCase() == 'pantala') {
							var patribegen2 = patribes[Math.floor(Math.random() * patribes.length)];
							if (pytribegen1 == patribegen2) {
								console.log('double; ' + pytribegen1 + ' ' + patribegen2);
								patribegen2 = "reset";
								console.log(patribegen2);
								patribegen2 = patribes[Math.floor(Math.random() * patribes.length)];
								var hybridgenembed = (pytribegen1 + ' x ' + patribegen2);
								channel.send(new Discord.MessageEmbed()
									.setColor('RANDOM')
									.setTitle('Random Hybrid Generator')
									.setFooter('This is a randomly generated hybrid combination.')
									.setDescription(hybridgenembed));
								console.log('double reset; ' + pytribegen1 + ' ' + patribegen2);
							} else {
								var hybridgenembed = (pytribegen1 + ' x ' + patribegen2);
								channel.send(new Discord.MessageEmbed()
									.setColor('RANDOM')
									.setTitle('Random Hybrid Generator')
									.setFooter('This is a randomly generated hybrid combination.')
									.setDescription(hybridgenembed));
							}
							console.log('normal');
						}

						else if ((message.content.toLowerCase() == prefix + 'hybridgen pyrrhia') || (message.content.slice(18 + prefix.length).toLowerCase() == 'any')) {
							var alltribegen2 = alltribes[Math.floor(Math.random() * alltribes.length)];
							if (pytribegen1 == alltribegen2) {
								console.log('double; ' + pytribegen1 + ' ' + alltribegen2);
								alltribegen2 = "reset";
								console.log(alltribegen2);
								alltribegen2 = alltribes[Math.floor(Math.random() * alltribes.length)];
								var hybridgenembed = (pytribegen1 + ' x ' + alltribegen2);
								channel.send(new Discord.MessageEmbed()
									.setColor('RANDOM')
									.setTitle('Random Hybrid Generator')
									.setFooter('This is a randomly generated hybrid combination.')
									.setDescription(hybridgenembed));
								console.log('double reset; ' + pytribegen1 + ' ' + alltribegen2);
							} else {
								var hybridgenembed = (pytribegen1 + ' x ' + alltribegen2);
								channel.send(new Discord.MessageEmbed()
									.setColor('RANDOM')
									.setTitle('Random Hybrid Generator')
									.setFooter('This is a randomly generated hybrid combination.')
									.setDescription(hybridgenembed));
							}
							console.log('normal');
						}

					} else if (message.content.slice(10 + prefix.length).toLowerCase().startsWith('pantala')) {
						console.log(patribes);
						var patribegen1 = patribes[Math.floor(Math.random() * patribes.length)];
						if (message.content.slice(18 + prefix.length).toLowerCase() == 'pyrrhia') {
							pytribegen2 = pytribes[Math.floor(Math.random() * pytribes.length)];
							if (patribegen1 == pytribegen2) {
								console.log('double; ' + patribegen1 + ' ' + pytribegen2);
								pytribegen2 = "reset";
								console.log(pytribegen2);
								pytribegen2 = pytribes[Math.floor(Math.random() * pytribes.length)];
								var hybridgenembed = (patribegen1 + ' x ' + pytribegen2);
								channel.send(new Discord.MessageEmbed()
									.setColor('RANDOM')
									.setTitle('Random Hybrid Generator')
									.setFooter('This is a randomly generated hybrid combination.')
									.setDescription(hybridgenembed));
								console.log('double reset; ' + patribegen1 + ' ' + pytribegen2);
							} else {
								var hybridgenembed = (patribegen1 + ' x ' + pytribegen2);
								channel.send(new Discord.MessageEmbed()
									.setColor('RANDOM')
									.setTitle('Random Hybrid Generator')
									.setFooter('This is a randomly generated hybrid combination.')
									.setDescription(hybridgenembed));
							}
							console.log('normal');
						}

						if (message.content.slice(18 + prefix.length).toLowerCase() == 'pantala') {
							// eslint-disable-next-line no-redeclare
							var patribegen2 = patribes[Math.floor(Math.random() * patribes.length)];
							if (patribegen1 == patribegen2) {
								console.log('double; ' + patribegen1 + ' ' + patribegen2);
								patribegen2 = "reset";
								console.log(patribegen2);
								patribegen2 = patribes[Math.floor(Math.random() * patribes.length)];
								var hybridgenembed = (patribegen1 + ' x ' + patribegen2);
								channel.send(new Discord.MessageEmbed()
									.setColor('RANDOM')
									.setTitle('Random Hybrid Generator')
									.setFooter('This is a randomly generated hybrid combination.')
									.setDescription(hybridgenembed));
								console.log('double reset; ' + patribegen1 + ' ' + patribegen2);
							} else {
								var hybridgenembed = (patribegen1 + ' x ' + patribegen2);
								channel.send(new Discord.MessageEmbed()
									.setColor('RANDOM')
									.setTitle('Random Hybrid Generator')
									.setFooter('This is a randomly generated hybrid combination.')
									.setDescription(hybridgenembed));
							}
							console.log('normal');
						}

						else if (message.content.toLowerCase() == prefix + 'hybridgen pantala' || (message.content.slice(18 + prefix.length).toLowerCase() == 'any')) {
							// eslint-disable-next-line no-redeclare
							var alltribegen2 = alltribes[Math.floor(Math.random() * alltribes.length)];
							if (patribegen1 == alltribegen2) {
								console.log('double; ' + patribegen1 + ' ' + alltribegen2);
								alltribegen2 = "reset";
								console.log(alltribegen2);
								alltribegen2 = alltribes[Math.floor(Math.random() * alltribes.length)];
								var hybridgenembed = (patribegen1 + ' x ' + alltribegen2);
								channel.send(new Discord.MessageEmbed()
									.setColor('RANDOM')
									.setTitle('Random Hybrid Generator')
									.setFooter('This is a randomly generated hybrid combination.')
									.setDescription(hybridgenembed));
								console.log('double reset; ' + patribegen1 + ' ' + alltribegen2);
							} else {
								var hybridgenembed = (patribegen1 + ' x ' + alltribegen2);
								channel.send(new Discord.MessageEmbed()
									.setColor('RANDOM')
									.setTitle('Random Hybrid Generator')
									.setFooter('This is a randomly generated hybrid combination.')
									.setDescription(hybridgenembed));
							}
							console.log('normal');
						}

					}

					else if (message.content.slice(10 + prefix.length).toLowerCase().startsWith('any')) {
						console.log(alltribes);
						var alltribegen1 = alltribes[Math.floor(Math.random() * alltribes.length)];
						// eslint-disable-next-line no-redeclare
						var alltribegen2 = alltribes[Math.floor(Math.random() * alltribes.length)];
						if (alltribegen1 == alltribegen2) {
							console.log('double; ' + alltribegen1 + ' ' + alltribegen2);
							alltribegen2 = "reset";
							console.log(alltribegen2);
							alltribegen2 = alltribes[Math.floor(Math.random() * alltribes.length)];
							var hybridgenembed = (alltribegen1 + ' x ' + alltribegen2);
							channel.send(new Discord.MessageEmbed()
								.setColor('RANDOM')
								.setTitle('Random Hybrid Generator')
								.setFooter('This is a randomly generated hybrid combination.')
								.setDescription(hybridgenembed));
							console.log('double reset; ' + alltribegen1 + ' ' + alltribegen2);
						}
						else {var hybridgenembed = (alltribegen1 + ' x ' + alltribegen2);
							channel.send(new Discord.MessageEmbed()
								.setColor('RANDOM')
								.setTitle('Random Hybrid Generator')
								.setFooter('This is a randomly generated hybrid combination.')
								.setDescription(hybridgenembed));}
						console.log('normal');
					}

					else if (message.content.toLowerCase() == prefix + 'hybridgen') {
						console.log(alltribes);
						// eslint-disable-next-line no-redeclare
						var alltribegen1 = alltribes[Math.floor(Math.random() * alltribes.length)];
						// eslint-disable-next-line no-redeclare
						var alltribegen2 = alltribes[Math.floor(Math.random() * alltribes.length)];
						if (alltribegen1 == alltribegen2) {
							console.log('double; ' + alltribegen1 + ' ' + alltribegen2);
							alltribegen2 = "reset";
							console.log(alltribegen2);
							alltribegen2 = alltribes[Math.floor(Math.random() * alltribes.length)];
							var hybridgenembed = (alltribegen1 + ' x ' + alltribegen2);
							channel.send(new Discord.MessageEmbed()
								.setColor('RANDOM')
								.setTitle('Random Hybrid Generator')
								.setFooter('This is a randomly generated hybrid combination.')
								.setDescription(hybridgenembed));
							console.log('double reset; ' + alltribegen1 + ' ' + alltribegen2);
						}
						else {var hybridgenembed = (alltribegen1 + ' x ' + alltribegen2);
							channel.send(new Discord.MessageEmbed()
								.setColor('RANDOM')
								.setTitle('Random Hybrid Generator')
								.setFooter('This is a randomly generated hybrid combination.')
								.setDescription(hybridgenembed));}
						console.log('normal');
					}

					else {
						console.log('somebody made a mistake on the hybrid gen command');
						channel.send(new Discord.MessageEmbed()
							.setColor([255, 0, 0])
							.setTitle('Random Hybrid Generator')
							.setFooter('Something is wrong.')
							.setDescription('Something is wrong with the selections you made. Please check your message for mistakes.'));
					}

				} else if ((message.content.toLowerCase().startsWith(prefix + 'rr') || message.content.toLowerCase().startsWith(prefix + 'reactionrole')) && server.members.resolve(user.id).hasPermission('MANAGE_ROLES')) {
					if (message.mentions.channels.first()) {
						let reactionChannel = message.mentions.channels.first();
						channel.send('Enter the base message');
						channel.awaitMessages(m => m.author.id == user.id, { max: 1 })
							.then((m) => {
								console.log('catched message');
								var end = false;
								var emojiRoles = new Map();
								function getReactions() {
									if (end) {
										reactionChannel.send(m.first().content)
											.then((msg) => {
												emojiRoles.forEach((value, key) => {
													msg.react(key);
													reactionRolesMessage.set(msg.id, emojiRoles);
												});
											});
									} else {
										console.log('entered loop');
										channel.send('Please send one of the emojis you want to use. End by saying end');
										channel.awaitMessages(msg => msg.author.id == user.id, { max: 1 })
											.then(react => {
												if (react.first().content.toLowerCase() == 'end') {
													end = true;
													getReactions();
												} else {
													channel.send('Mention the role you want to add when reacting with this emoji');
													channel.awaitMessages(msg => msg.author.id == user.id && msg.mentions.roles.first(), { max: 1 })
														.then((mention) => {
															emojiRoles.set(react.first().content, mention.first().mentions.roles.first().id);
															getReactions();
														});
												}
											});
									}
								}
								getReactions();
							});
					} else {
						channel.send('Please mention a channel');
					}
				} else if(message.content.toLowerCase().startsWith(prefix + 'log')) {
					console.log(user.username + ' wanted to log the message: ' + message.content.slice(6));
				} else if (message.content.toLowerCase().startsWith(prefix + 'enlarge ')) {
					var msgArray = message.content.toLowerCase().split(' ');
					channel.send(new Discord.MessageEmbed().setImage(server.emojis.resolve(msgArray[1].slice(-19, -1)).url).setColor('RANDOM'));
				} else if (message.content.startsWith(prefix + 'poll ')) {
					var content = message.content.split(' ');
					content.shift();
					message.delete();
					if (content[0].toLowerCase() == 'thumbs') {
						channel.send(new Discord.MessageEmbed()
							.setColor('GREEN')
							.setTitle('Poll')
							.setFooter('Poll made by user ' + user.username)
							.setDescription(content.slice(1).join(' ')))
							.then(poll => {
								poll.react('👍');
								poll.react('👎');
							});
					} else if (content[0].toLowerCase() == 'numbers') {
						channel.send(new Discord.MessageEmbed()
							.setColor('GREEN')
							.setTitle('Poll')
							.setFooter('Poll made by user ' + user.username)
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

					console.log('poll created in #' + message.channel.name + ' by ' + message.author.username);
				} else if (message.content.toLowerCase().startsWith(prefix + 'setprefix') && (user.id == '373515998000840714' || user.id == '306582338039709696' || server.members.resolve(user.id).permissions.has('ADMINISTRATOR'))) {
					prefix = message.content.toLowerCase().split(' ')[1];
					fs.readFile('./config.json', (err, res) => {
						if (err) process.stderr.write(err);
						var toWrite = res.toString().split('\n');
						toWrite[1] = `\t"prefix": "${prefix}"`;
						fs.writeFile('./config.json', toWrite.join('\n'), err => {
							if (err) process.stderr.write(err);
						});
					});
					message.reply(`Prefix changed. New prefix: ${prefix} This prefix will be resetted to ${prefix}on reboot.`);
					client.user.setActivity('Wings of Fire | Prefix: ' + prefix, { type: 'WATCHING' });
				} else if (message.content.toLowerCase().startsWith(prefix + 'rn ') || message.content.toLowerCase().startsWith(prefix + 'randomnumber ')) {
					const randomNumber = Math.floor((Math.random() * (new Number(message.content.split(' ')[2]) - new Number(message.content.split(' ')[1]))) + 1) + new Number(message.content.split(' ')[1]);
					message.channel.send('Here is a pseudo-random number for you: ' + randomNumber);
				} else if (message.content.toLowerCase().startsWith(prefix + 'whois ')) {
					const whoisEmbed = new Discord.MessageEmbed()
						.setColor('RED')
						.setTitle('Who is ' + message.content.split(' ').slice(1).join(' ') + '?')
						.setDescription('Find this out!')
						.setURL('https://wingsoffire.fandom.com/wiki/' + message.content.split(' ').slice(1).join('_'))
						.setThumbnail('https://wingsoffire.fandom.com/wiki/' + message.content.split(' ').slice(1).join('_'))
						.setFooter('The link isn\'t correct? Double check the case and the orthograph. Or maybe this entry just don\'t exist...');
					message.reply(whoisEmbed);
					console.log(user.username + ' didn\'t know who ' + message.content.split(' ').slice(1).join(' ') + ' was, but now they do!');
				} else if (message.content.toLowerCase().startsWith(prefix + 'whatis ')) {
					const whoisEmbed = new Discord.MessageEmbed()
						.setColor('RED')
						.setTitle('What is the ' + message.content.split(' ').slice(1).join(' ') + '?')
						.setDescription('Find this out!')
						.setURL('https://wingsoffire.fandom.com/wiki/' + message.content.split(' ').slice(1).join('_'))
						.setThumbnail('https://wingsoffire.fandom.com/wiki/' + message.content.split(' ').slice(1).join('_'))
						.setFooter('The link isn\'t correct? Double check the case and the orthograph. Or maybe this entry just don\'t exist...');
					message.reply(whoisEmbed);
					console.log(user.username + ' didn\'t know what ' + message.content.split(' ').slice(1).join(' ') + ' were, but now they do!');
				} else if (message.content.toLowerCase().startsWith(prefix + 'updootlimit ') && server.members.resolve(user.id).hasPermission('ADMINISTRATOR')) {
					if (server.members.resolve(user.id).hasPermission('MANAGE_CHANNELS')) {
						if (new Number(message.content.split(' ')[1])) {
							fs.readFile('./config.json', (err, res) => {
								if (err) process.stderr.write(err);
								var toWrite = res.toString().split('\n');
								toWrite[2] = `\t"upDootLimit": ${new Number(message.content.split(' ')[1])}`;
								fs.writeFile('./config.json', toWrite.join('\n'), err => {
									if (err) process.stderr.write(err);
								});
							});
						}
					}
				} else if (message.content.toLowerCase().startsWith(prefix + 'clearword ') && server.members.resolve(user.id).hasPermission('MANAGE_MESSAGES')) {
					if(server.members.resolve(user.id).permissions.has('MANAGE_MESSAGES')) {
						forbiddenWords.push(message.content.toLowerCase().slice(11));
						channel.send('That word has been generally set as forbidden.');
					}
					else {
						channel.send('You don\'t have permissions to do that! Requires manage messages permission.');
					}
					console.log(user.username + ' forbid a new word: ' + message.content.toLowerCase().slice(12));
				} else if (message.content.toLowerCase().startsWith(prefix + 'sumthemup')) {
					var messagesSent;
					if (message.mentions.users.size == 0) {
						if (!totalMessages.has(user.id)) totalMessages.set(user.id, 0);
						if (!warns.get(user.id)) warns.set(user.id, []);
						messagesSent = Math.floor(totalMessages.get(user.id));
						const sumEmbed = new Discord.MessageEmbed()
							.setColor('BLUE')
							.setTitle('Total messages sent from ' + user.username + ':')
							.setDescription('The user sent ' + messagesSent + ' messages and got ' + warns.get(user.id).length + ' warns since the ' + ('0' + (server.members.resolve(user.id).joinedAt.getMonth() + 1)).slice(-2) + '/' + ('0' + server.members.resolve(user.id).joinedAt.getDate()).slice(-2) + '/' + server.members.resolve(user.id).joinedAt.getFullYear());
						channel.stopTyping();
						channel.send(sumEmbed);
						console.log(user.username + ' requested their number of messages sent');

					} else {
						if (!totalMessages.has(message.mentions.users.last().id)) totalMessages.set(message.mentions.users.last().id, 0);
						if (!warns.get(message.mentions.users.last().id)) warns.set(message.mentions.users.last().id, []);
						messagesSent = Math.floor(totalMessages.get(message.mentions.users.last().id));
						const sumEmbed = new Discord.MessageEmbed()
							.setColor('BLUE')
							.setTitle('Total messages sent from ' + message.mentions.users.first().username + ':')
							.setDescription('The user sent ' + messagesSent + ' messages and got ' + warns.get(message.mentions.users.last().id).length + ' warns since the ' + ('0' + (server.members.resolve(message.mentions.users.last().id).joinedAt.getMonth() + 1)).slice(-2) + '/' + ('0' + server.members.resolve(message.mentions.users.last().id).joinedAt.getDate()).slice(-2) + '/' + server.members.resolve(message.mentions.users.last().id).joinedAt.getFullYear());
						channel.stopTyping();
						channel.send(sumEmbed);
						console.log(user.username + ' requested the number of messages ' + message.mentions.users.first().username + ' sent');
					}
				} else if (message.content.toLowerCase().startsWith(prefix + 'oc ')) {
					var found = false;
					server.channels.resolve('754470277634719845').messages.fetch({ limit: 100 })
						.then(oldMsg => {
							oldMsg.each(mess => {
								if (mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ') + '\n') || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ') + '\n') || mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ') + ' ') || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ') + ' ')))) {
									message.reply('Oc found!');
									channel.send(mess.url);
									found = true;
								}
							});
							if (!found) {
								server.channels.resolve('754470277634719845').messages.fetch({ limit: 100, before: oldMsg.last().id })
									.then(oldMsg2 => {
										oldMsg2.each(mess => {
											if (mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ') + '\n') || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ') + '\n') || mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ') + ' ') || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ') + ' ')))) {
												message.reply('Oc found!');
												channel.send(mess.url);
												found = true;
											}
										});
										if (!found) {
											server.channels.resolve('754470277634719845').messages.fetch({ limit: 100, before: oldMsg2.last().id })
												.then(oldMsg3 => {
													oldMsg3.each(mess => {
														if (mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ') + '\n') || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ') + '\n') || mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ') + ' ') || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ') + ' ')))) {
															message.reply('Oc found!');
															channel.send(mess.url);
															found = true;
														}
													});
													if (!found) {
														server.channels.resolve('754470277634719845').messages.fetch({ limit: 100, before: oldMsg3.last().id })
															.then(oldMsg4 => {
																oldMsg4.each(mess => {
																	if (mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ') + '\n') || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ') + '\n') || mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ') + ' ') || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ') + ' ')))) {
																		message.reply('Oc found!');
																		channel.send(mess.url);
																		found = true;
																	}
																});
																if (!found) {
																	server.channels.resolve('754470277634719845').messages.fetch({ limit: 100, before: oldMsg2.last().id })
																		.then(oldMsg5 => {
																			oldMsg5.each(mess => {
																				if (mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ') + '\n') || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ') + '\n') || mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ') + ' ') || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ') + ' ')))) {
																					message.reply('Oc found!');
																					channel.send(mess.url);
																					found = true;
																				}
																			});
																			if (!found) {
																				server.channels.resolve('754470277634719845').messages.fetch({ limit: 100, before: oldMsg2.last().id })
																					.then(oldMsg6 => {
																						oldMsg6.each(mess => {
																							if (mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ') + '\n') || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ') + '\n') || mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ') + ' ') || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ') + ' ')))) {
																								message.reply('Oc found!');
																								channel.send(mess.url);
																								found = true;
																							}
																						});
																						if (!found) {
																							server.channels.resolve('754470277634719845').messages.fetch({ limit: 100, before: oldMsg2.last().id })
																								.then(oldMsg7 => {
																									oldMsg7.each(mess => {
																										if (mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ') + '\n') || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ') + '\n') || mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ') + ' ') || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ') + ' ')))) {
																											message.reply('Oc found!');
																											channel.send(mess.url);
																											found = true;
																										}
																									});
																									if (!found) {
																										server.channels.resolve('754470277634719845').messages.fetch({ limit: 100, before: oldMsg2.last().id })
																											.then(oldMsg8 => {
																												oldMsg8.each(mess => {
																													if (mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ') + '\n') || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ') + '\n') || mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ') + ' ') || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ') + ' ')))) {
																														message.reply('Oc found!');
																														channel.send(mess.url);
																														found = true;
																													}
																												});
																												if (!found) {
																													message.reply('Oc not found. The submission is maybe too old, or you misstyped the name. Please check both of the possibilities. Please note that the submission has to include "name: <oc\'s name>.');
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
							}
						});
				} else if (message.content.toLowerCase().startsWith(prefix + 'setmessagecount ') && (server.members.resolve(user.id).hasPermission('MANAGE_MESSAGES') || server.members.resolve(user.id).roles.cache.has('795414220707463188'))) {
					if (message.mentions.members.size == 1 && message.content.split(' ').length == 3 && !isNaN(message.content.split(' ')[2])) {
						totalMessages.set(message.mentions.members.first().id, new Number(message.content.split(' ')[2]));
					} else {
						message.reply('Syntax incorrect. Please try again.');
					}
				} else if (message.content.toLowerCase().startsWith(prefix + 'reply ') && server.members.resolve(user.id).permissions.has('ADMINISTRATOR')) {
					if (!isNaN(message.content.split(' ')[1])) {
						channel.send(':thumbsup:');
						var reply = new Discord.MessageEmbed()
							.setColor('ORANGE')
							.setTitle('Response from r/wingsoffire Mod Team:')
							.setDescription(message.content.split(' ').slice(2).join(' '))
							.setFooter('This is a message directly from the r/wingsoffire mod team.');
						var userA = (client.users.resolve(messageMods[message.content.split(' ')[1]]));
						userA.createDM()
							.then((DMChannel) => {
								DMChannel.send(reply);
								console.log('the mods responded to ' + userA.username);
							});
					} else {
						message.reply('Syntax error. Please use the index of the message you want to answer to.');
					}
					// } else if (message.content.toLowerCase().startsWith(prefix + 'verbalwarn ') && ((server.members.resolve(user.id).permissions.has('ADMINISTRATOR')) || (server.members.resolve(user.id).roles.cache.has('795847347397066773')))) {
					// 	if (!message.mentions.users.first()) {
					// 		channel.send('Please specify a user');
					// 	}
					// 	else {
					// 		const warnUser = message.mentions.users.first();
					// 		const warn = new Warn(warnUser, message.content.slice(35), server);
					// 		if (warns.get(warnUser.id)) {
					// 			warns.set(warnUser.id, warns.get(warnUser.id).push(warn));
					// 		} else {
					// 			warns.set(warnUser.id, [warn]);
					// 		}
					// 	}
					// } else if (message.content.toLowerCase().startsWith(prefix + 'purge ') && server.members.resolve(user.id).permissions.has('MANAGE_MESSAGES')) {
					// channel.bulkDelete(new Number(message.content.split(' ')[1]));
					// } else if (message.content.toLowerCase().startsWith(prefix + 'clearwarn ') && server.members.resolve(user.id).permissions.has('ADMINISTRATOR')) {
					// if (!message.mentions.members.first()) {
					// message.reply('Please specify an user');
					// }
					// else {
					// warns.get(message.mentions.members.first().id).splice(message.content.slice(34) - 1);
					// channel.send('👍');
					// }
				// } else if (message.content.toLowerCase().startsWith(prefix + 'getwarns')) {
				// 	var warnsStr = '';
				// 	if (!message.mentions.members.first()) {
				// 		if (warns.has(user.id) && warns.get(user.id).length != 0) {
				// 			const mentionned = user;
				// 			const warnEmbed = new Discord.MessageEmbed()
				// 				.setColor('BLUE')
				// 				.setTitle('Warns of ' + mentionned.username + ':')
				// 				.setFooter('For a total of ' + warns.get(mentionned.id).length);
				// 			warns.get(mentionned.id).forEach((warn) => {
				// 				warnsStr = warnsStr + 'Warn #' + (warns.get(mentionned.id).indexOf(warn) + 1) + ': \n' + warn.getFullString() + '\n\n\n';
				// 			});
				// 			warnEmbed.setDescription(warnsStr);
				// 			channel.send(warnEmbed);
				// 		}
				// 		else {
				// 			message.reply('You have no warns!');
				// 		}
				// 	}
				// 	else if (warns.has(message.mentions.members.first().id) && warns.get(message.mentions.members.first().id).length != 0) {
				// 		const mentionned = message.mentions.members.first();
				// 		const warnEmbed = new Discord.MessageEmbed()
				// 			.setColor('BLUE')
				// 			.setTitle('Warns of ' + mentionned.username + ':')
				// 			.setFooter('For a total of ' + warns.get(mentionned.id).length);
				// 		warns.get(mentionned.id).forEach((warn) => {
				// 			warnsStr = warnsStr + 'Warn #' + (warns.get(mentionned.id).indexOf(warn) + 1) + ': \n' + warn.getFullString() + '\n\n\n';
				// 		});
				// 		warnEmbed.setDescription(warnsStr);
				// 		channel.send(warnEmbed);
				// 	}
				// 	else {
				// 		message.reply('This user has no warns!');
				// 	}
				} else if (message.content.toLowerCase().startsWith(prefix + 'allowword ') && server.members.resolve(user.id).permissions.has('MANAGE_MESSAGES')) {
					forbiddenWords.splice(message.content.toLowerCase().slice(12) - 1, 1);
					channel.send('Allowed word. Current forbidden words: ');
					forbiddenWords.forEach((word) => {
						channel.send('[' + (forbiddenWords.indexOf(word) + 1) + ']: ' + word);
					});
				}
				break;
			}
			

		} else {
			if(message.content.toLowerCase().startsWith(prefix + 'messagemods ')) {
				user.createDM()
					.then(DMchannel => {
						DMchannel.send(':thumbsup:');
					});
				var modsEmbed = new Discord.MessageEmbed()
					.setColor('ORANGE')
					.setTitle('New message from user:')
					.setAuthor(user.tag)
					.setDescription(message.content.slice(13))
					.setFooter(`This is an automated message. Please answer using ${prefix}reply ${messageMods.length} <message>`);
				client.channels.fetch('785612417379336263')
					.then(modChannel => {
						modChannel.send(modsEmbed);
					})
					.catch(() => {
						client.channels.fetch('647616102339313667')
							.then(officialModChannel => {
								officialModChannel.send(modsEmbed);
							});
					});
				messageMods.push(user.id);
				console.log('Somebody messaged the mods');
			}

			if (message.content.toLowerCase().startsWith(prefix + 'getfile') && (user.id == '373515998000840714' || user.id == '306582338039709696')) {
				user.createDM()
					.then((DMchannel) => {
						DMchannel.send({
							files: [{
								attachment: 'bot.js',
								name: 'bot.js'
							}]
						});
					});
				console.log(user.username + ' fetched the file. Have fun!');
			}
		}
	}
});

client.login(token);
