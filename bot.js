/* eslint-disable no-inner-declarations */
/* eslint-disable no-redeclare */
/* eslint-disable no-inline-comments */
const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');

var totalMessages = new Map();
const https = require('https');
const { exit } = require('process');
var { /* upDootLimit, */ prefix } = require('./config.json');

var reactionRolesMessage = new Map();
var messageMods = new Array();

var forbiddenWords = ['peepee', 'penis'];
var warns = new Map();
var helpstr = prefix + 'forbiddenwords = gets a list of forbidden words\n ' + prefix + 'quote = will give you a quote, and you have to guess who said it.\n ' + prefix + 'fac = “flip a coin”. Means just that, will flip a coin and you will either get heads or tails.\n ' + prefix + 'ping = just checks to see what the response time is between you and the bot.\n ' + prefix + 'sunny = says a random quote from sunny\n  ' + prefix + 'hybridgen <pyrrhia/pantala/any> <same for #2> = generates a random hybrid from the inputs. If you choose pyrrhia, pantala, it will give you a hybrid of one tribe from each. You could also choose ‘any’ to allow the use of both pyrrhian and pantalan tribes in the generation. Also, if you leave the second, or both fields blank, it will default to <any> <any>.\n ' + prefix + 'poll <thumbs/numbers> <question> = creates a poll for you, of any question you want, and automatically adds :thumbsup: and :thumbsdown: reactions or numbers reactions to it.\n ' + prefix + 'rn = random number generator.\n ' + prefix + 'whois (or ' + prefix + 'whatis) <name or thing> = put in a canon character’s name and get the link to the wiki to read up about them\n ' + prefix + 'sumthemup <user> = checks the messages of a user excluding the channels meant to be excluded.\n ' + prefix + 'oc <oc name> = searches for the name of an oc in the approved characters channel\n' + prefix + 'messagemods <message> = send this to the bot in it’s DMs. It will send the mods the message in a channel where any of us can see and reply to it, which will come back to you through the bot.';
var modhelpstr = prefix + 'verbalwarn <mention user>\n ' + prefix + 'log <message>\n' + prefix + 'clearword <word>\n ' + prefix + 'reply <modmail message ID> <message>\n ' + prefix + 'getwarns <user>\n ' + prefix + 'allowword <word ID>\n ' + prefix + 'clearwarn <user>\n ' + prefix + 'reactionrole (or ' + prefix + 'rr) <channel>';
var pytribes = ["skywing", "seawing", "icewing", "nightwing", "sandwing", "mudwing", "rainwing"];
var patribes = ["leafwing", "hivewing", "silkwing"];
var alltribes = ["skywing", "seawing", "icewing", "nightwing", "sandwing", "mudwing", "rainwing", "leafwing", "hivewing", "silkwing"];
// var starBoard = new Map();

var lastmessage = undefined;

var quoteBusy = false;

/* const searchReddit = function() {
	fs.readFile('./cacheBetweenBoots.json', (err, jsonRes) => {
		if (err) return console.error(err);
		const req = https.request(`https://www.reddit.com/r/WingsOfFire/new.json?before=${JSON.parse(jsonRes).lastRedditPost}&limit=99`, (res) => {
			let chunks = [];
			res.on('data', (d) => {
				// d is a Buffer object.
				chunks.push(d);
			}).on('end', () => {
				let result = Buffer.concat(chunks);
				let tmpResult = result.toString();
				try {
					let parsedObj = JSON.parse(tmpResult);
					// Print the string if you want to debug or prettify.
					// console.log(tmpResult);
					processSelfText(parsedObj);
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

		req.on('error', (error) => {
			process.stderr.write(error);
		});

		req.end();
	});
};

const processSelfText = function(obj) {
	if (obj.data && obj.data.children && obj.data.children.length) {
		fs.readFile('./cacheBetweenBoots.json', (err, res) => {
			if (err) return console.error(err);
			var toWrite = res.toString();
			toWrite = new String(toWrite).split('\n');
			toWrite[1] = `\t"lastRedditPost": "${obj.data.children[obj.data.children.length - 1].data.name},"`;
			var toWriteStr = toWrite.join('\n');
			fs.writeFile('./cacheBetweenBoots.json', toWriteStr, (err) =>{
				if (err) return console.error('Could not access to the file: ' + err);
			});
		});
		obj.data.children.forEach(function(item) {
			if (item.data) {
				console.log('we got a post');
				if (item.data.post_hint == 'image') {
					if (item.data.spoiler) {
						client.channels.resolve('716617066261643314').send(new Discord.MessageEmbed()
							.setURL('https://www.reddit.com' + item.data.permalink)
							.setColor([255, 0, 0])
							.addField('Post Author', '/u/' + item.data.author, true)
							.addField('Content Warning', 'Spoiler', true)
							.setAuthor('New image post on r/WingsOfFire')
							.setTitle(item.data.title)
						);
					} else if(item.data.over_18) {
						client.channels.resolve('716617066261643314').send(new Discord.MessageEmbed()
							.setURL('https://www.reddit.com' + item.data.permalink)
							.setColor([255, 0, 0])
							.addField('Post Author', '/u/' + item.data.author, true)
							.addField('Content Warning', 'NSFW', true)
							.setAuthor('New image post on r/WingsOfFire')
							.setTitle(item.data.title));
					} else {
						client.channels.resolve('716617066261643314').send(new Discord.MessageEmbed()
							.setURL('https://www.reddit.com' + item.data.permalink)
							.setImage(item.data.url)
							.setColor([255, 0, 0])
							.addField('Post Author', '/u/' + item.data.author, true)
							.setAuthor('New image post on /r/WingsOfFire')
							.addField('Content Warning', 'None', true)
							.setTitle(item.data.title));
					}
				} else {
					// eslint-disable-next-line no-lonely-if
					if (item.data.spoiler) {
						client.channels.resolve('716617066261643314').send(new Discord.MessageEmbed()
							.setURL('https://www.reddit.com' + item.data.permalink)
							.setColor([255, 0, 0])
							.addField('Post Author', '/u/' + item.data.author, true)
							.addField('Content Warning', 'Spoiler', true)
							.setAuthor('New post on r/WingsOfFire')
							.setDescription(item.data.selftext)
							.setTitle(item.data.title));
					} else if(item.data.over_18) {
						client.channels.resolve('716617066261643314').send(new Discord.MessageEmbed()
							.setURL('https://www.reddit.com' + item.data.permalink)
							.setColor([255, 0, 0])
							.addField('Post Author', '/u/' + item.data.author, true)
							.addField('Content Warning', 'NSFW', true)
							.setAuthor('New post on r/WingsOfFire')
							.setDescription(item.data.selftext)
							.setTitle(item.data.title));
					} else {
						client.channels.resolve('716617066261643314').send(new Discord.MessageEmbed()
							.setURL('https://www.reddit.com' + item.data.permalink)
							.setColor([255, 0, 0])
							.addField('Post Author ', '/u/' + item.data.author, true)
							.setAuthor('New post on /r/WingsOfFire')
							.addField('Content Warning', 'None', true)
							.setDescription(item.data.selftext)
							.setTitle(item.data.title));
					}
				}
			}
		});
	}
};*/


class Warn {
	/**
	 * Use this object to create a warn.
	 * @param {Discord.User} user The user to warn
	 * @param {String} reason The reason of the warn
	 * @param {Discord.Guild} server The server on which the warn happens
	 */
	constructor(user, reason, server) {
		this.user = user;
		this.reason = reason;
		this.server = server;
		const warnEmbed = new Discord.MessageEmbed()
			.setColor('RED')
			.setTitle('Warning from r/wingsoffire')
			.setDescription(this.reason)
			.setFooter('This is a message sent from the r/wingsoffire discord server mod team.');
		this.server.members.resolve(this.user.id).createDM()
			.then(channel => {
				channel.send(warnEmbed);
				console.log(this.user.username + ' was verbally warned');
				const warnlog = new Discord.MessageEmbed()
					.setColor('RED')
					.setTitle(this.user.username + ' was verbally warned')
					.setDescription(this.reason)
					.setFooter('this is an automated log of a verbal warn given to ' + this.user.username);
				client.channels.fetch('718192469560262656')
					.then(logChannel => {
						logChannel.send(warnlog);
					});
			});
		this.date = new Date(Date.now());
	}

	get user() {
		return this.user;
	}

	get reason() {
		return this.reason;
	}

	get date() {
		return this.date;
	}

	get server() {
		return this.server;
	}

	set user(value) {
		// eslint-disable-next-line no-undef
		user = value;
	}

	set reason(value) {
		// eslint-disable-next-line no-undef
		reason = value;
	}

	set date(value) {
		// eslint-disable-next-line no-undef
		date = value;
	}

	set server(value) {
		// eslint-disable-next-line no-undef
		server = value;
	}

	getFullString() {
		return this.reason + '\n Warned the ' + this.date.getMonth() + '/' + this.date.getDate() + '/' + this.date.getFullYear() + ' at ' + this.date.getHours() + ':' + this.date.getMinutes();
	}

}
// an async function is just a function that, when we execute it, the program will continue to execute without waiting for it to finish.

/*
async function checkDragonetBigwings() {
	const timeStart = Date.now();
	let clientGuild = client.guilds.resolve('716601325269549127');
	clientGuild.members.cache.each((clientMember) => {
		fs.readFile('./messagecount.json', (err, res) => {
			if (err) process.stderr.write(err);
			if (res.toString().includes(`"${clientMember.id}": `)) {
				res.toString().split('\n').slice(1, -1).forEach((element, index) => {
					if (element.includes(`"${clientMember.id}": `)) {
						if (index == res.toString().split('\n').slice(1, -1).length - 1) {
							totalMessages.set(element.split(':')[0].slice(2, -1), new Number(element.split(':')[1].slice(1)));
						} else {
							totalMessages.set(element.split(':')[0].slice(2, -1), new Number(element.split(':')[1].slice(1, -1)));
						}
					}
				});
			} else {
				totalMessages.set(clientMember.id, 0);
			}
		});
		if (!totalMessages.has(clientMember.id)) totalMessages.set(clientMember.id, 0);
		fs.readFile('./vanityblacklist.json', (err, res) => {
			if (err) process.stderr.write(err);
			var jsonRes = JSON.parse(res);
			if (clientGuild.id == '716601325269549127') {
				if (totalMessages.get(clientMember.id) >= 7500 && !jsonRes.Bigwing.includes(clientMember.id)) {
					clientMember.roles.add('754760458896146554');
					clientMember.roles.remove('754760045602013255');
					client.channels.resolve('718192469560262656').send(clientMember.user.tag + ' was automatically upgraded to the Bigwing rank!');
					fs.writeFile('./vanityblacklist.json', '{\n\t"Dragonet": [\n\t\t"' + jsonRes.Dragonet.join('",\n\t\t"') + '"\n\t],\n\t"Bigwing": [\n\t\t"' + jsonRes.Bigwing.join('",\n\t\t"') + '",\n\t\t"' + clientMember.id + '"\n\t]\n}', err => {
						if (err) process.stderr.write(err);
					});
				}
				else if (totalMessages.get(clientMember.id) >= 1500 && totalMessages.get(clientMember.id) < 7500 && !jsonRes.Dragonet.includes(clientMember.id)) {
					clientMember.roles.add('754760045602013255');
					clientMember.roles.remove('716601325269549128');
					client.channels.resolve('718192469560262656').send(clientMember.user.tag + ' was automatically upgraded to the Dragonet rank!');
					fs.writeFile('./vanityblacklist.json', '{\n\t"Dragonet": [\n\t\t"' + jsonRes.Dragonet.join('",\n\t\t"') + '",\n\t\t"' + clientMember.id + '"\n\t],\n\t"Bigwing": [\n\t\t"' + jsonRes.Bigwing.join('",\n\t\t"') + '"\n\t]\n}', err => {
						if (err) process.stderr.write(err);
					});
				}
			}
		});
	});
	// let is the same as const, but you can redefine it later
	const timeEnd = Date.now() - timeStart;
	console.log('Check finished! Took ' + timeEnd.toString() + 'ms.');
	client.user.setPresence({ status: 'online' });
	client.user.setActivity('Wings of Fire | Prefix: ' + prefix, { type: 'WATCHING' });
	console.log('Done.');
	return undefined;
}
*/
client.on('ready', () => {
	console.log('[' + ('0' + new Date(Date.now()).getHours()).slice(-2) + ':' + ('0' + new Date(Date.now()).getMinutes()).slice(-2) + ':' + ('0' + new Date(Date.now()).getSeconds()).slice(-2) + `] Logged in as ${client.user.tag}; ready!`);
	// setInterval(checkDragonetBigwings, 60000);
	// checkDragonetBigwings(false);
	// searchReddit();
	// setInterval(searchReddit, 30000);
	fs.readFile('./cacheBetweenBoots.json', (err, res) => {
		if(err) return console.error(err);
		reactionRolesMessage = new Map(JSON.parse(res).reactionRoles);
	});
	client.user.setUsername('r/WOF Bot (' + prefix + ')');
	fs.readFile('./cacheBetweenBoots.json', (err, res) => {
		if (err) process.stderr.write(err);
		var resolved = JSON.parse(res);
		if (resolved.rpSeekPinged) {
			client.guilds.resolve('716601325269549127').roles.resolve('735212949639135272').setMentionable(true);
			var toWrite = res.toString().split('\n');
			toWrite[2] = '\t"rpSeekPinged": false';
			toWrite[3] = '}';
			fs.writeFile('./cacheBetweenBoots.json', toWrite.join('\n'), (err) => {
				if (err) process.stderr.write(err);
			});
		}
	});
});

/**
 * Kinda like a dice.
 * @param {Number} min The lowest number possible
 * @param {Number} max The highest number possible
 * @returns {Number} A pseudo-random nuber in the range [min ]max
 */
function randInt(min, max) {
	return Math.floor(Math.random() * max - min) + min;
}

/*
client.on('messageReactionAdd', (reac, user) => {
	if (reac.message.author.id == client.user.id && reactionRolesMessage.has(reac.message.id)) {
		if(reactionRolesMessage.get(reac.message.id).has(reac.emoji.toString())) {
			reac.message.guild.members.resolve(user.id).roles.add(reactionRolesMessage.get(reac.message.id).get(reac.emoji.toString()));
		}
	} else if (reac.emoji.id == '724795433540386878' || reac.emoji.id == '724795407305146378') {
		if (reac.emoji.id == '724795433540386878') {
			console.log('got an updoot');
			if (starBoard.has(reac.message.id)) {
				if (starBoard.get(reac.message.id).length == 2) {
					starBoard.set(reac.message.id, [starBoard.get(reac.message.id)[0] + 1, starBoard.get(reac.message.id)[1]]);
				} else {
					starBoard.set(reac.message.id, [starBoard.get(reac.message.id)[0] + 1]);
				}
			} else {
				starBoard.set(reac.message.id, new Array(new Number(1)));
			}
		} else if (reac.emoji.id == '724795407305146378') {
			console.log('got a downdoot');
			if (starBoard.has(reac.message.id)) {
				if (starBoard.get(reac.message.id).length == 2) {
					starBoard.set(reac.message.id, [starBoard.get(reac.message.id)[0] - 1, starBoard.get(reac.message.id)[1]]);
				} else {
					starBoard.set(reac.message.id, [starBoard.get(reac.message.id)[0] - 1]);
				}
			} else {
				starBoard.set(reac.message.id, new Array(new Number(-1)));
			}
		}
		if (starBoard.get(reac.message.id)[0] >= upDootLimit) {
			console.log('enough updoots');
			if (starBoard.get(reac.message.id).length == 2) {
				starBoard.get(reac.message.id)[1].edit(starBoard.get(reac.message.id)[1].embeds[0]
					.setTitle('<:Updoot:724795433540386878> ' + starBoard.get(reac.message.id)[0])
				);
			} else if (reac.message.attachments.size == 0) {
				client.channels.resolve('734222580126318592').send(new Discord.MessageEmbed()
					.setAuthor(reac.message.author.tag)
					.setTitle('<:Updoot:724795433540386878> ' + starBoard.get(reac.message.id))
					.setDescription(reac.message.content + `\n\n[Click here to jump to the message](${reac.message.url})`)
				)
					.then(msg => {
						starBoard.set(reac.message.id, [starBoard.get(reac.message.id)[0], msg]);
					});
			} else {
				client.channels.resolve('734222580126318592').send(new Discord.MessageEmbed()
					.setAuthor(reac.message.author.tag)
					.setTitle('<:Updoot:724795433540386878> ' + starBoard.get(reac.message.id))
					.setDescription(reac.message.content + `\n\n[Click here to jump to the message](${reac.message.url})`)
					.setImage(reac.message.attachments.first().url)
				)
					.then(msg => {
						starBoard.set(reac.message.id, [starBoard.get(reac.message.id)[0], msg]);
					});
			}
		} else if (starBoard.get(reac.message.id)[0] <= 0 - upDootLimit) {
			console.log('enough downdoots');
			if (starBoard.get(reac.message.id).length == 2) {
				starBoard.get(reac.message.id)[1].edit(starBoard.get(reac.message.id)[1].embeds[0]
					.setTitle('<:Downdoot:724795407305146378> ' + Math.abs(starBoard.get(reac.message.id)[0]))
				);
			} else if (reac.message.attachments.size == 0) {
				client.channels.resolve('734222580126318592').send(new Discord.MessageEmbed()
					.setAuthor(reac.message.author.tag)
					.setTitle('<:Downdoot:724795407305146378> ' + Math.abs(starBoard.get(reac.message.id)))
					.setDescription(reac.message.content + `\n\n[Click here to jump to the message](${reac.message.url})`)
				)
					.then(msg => {
						starBoard.set(reac.message.id, [starBoard.get(reac.message.id)[0], msg]);
					});
			} else {
				client.channels.resolve('734222580126318592').send(new Discord.MessageEmbed()
					.setAuthor(reac.message.author.tag)
					.setTitle('<:Downdoot:724795407305146378> ' + Math.abs(starBoard.get(reac.message.id)))
					.setDescription(reac.message.content + `\n\n[Click here to jump to the message](${reac.message.url})`)
					.setImage(reac.message.attachments.first().url)
				)
					.then(msg => {
						starBoard.set(reac.message.id, [starBoard.get(reac.message.id)[0], msg]);
					});
			}
		} else if (starBoard.get(reac.message.id)[1] && starBoard.get(reac.message.id)[0] > 0 - upDootLimit && starBoard.get(reac.message.id)[0] < upDootLimit) {
			starBoard.get(reac.message.id)[1].delete();
			starBoard.set(reac.message.id, [starBoard.get(reac.message.id)[0]]);
		}
	}
});
*/

client.on('messageDelete', (msg) => {
	lastmessage = msg;
});
/*
client.on('messageReactionRemove', (reac, user) => {
	if (reac.message.author.id == client.user.id && reactionRolesMessage.has(reac.message.id)) {
		if(reactionRolesMessage.get(reac.message.id).has(reac.emoji.toString())) {
			reac.message.guild.members.resolve(user.id).roles.remove(reactionRolesMessage.get(reac.message.id).get(reac.emoji.toString()));
		}
	} else if (reac.emoji.id == '724795433540386878' || reac.emoji.id == '724795407305146378') {
		if (reac.emoji.id == '724795433540386878') {
			console.log('got an updoot');
			if (starBoard.has(reac.message.id)) {
				if (starBoard.get(reac.message.id).length == 2) {
					starBoard.set(reac.message.id, [starBoard.get(reac.message.id)[0] - 1, starBoard.get(reac.message.id)[1]]);
				} else {
					starBoard.set(reac.message.id, [starBoard.get(reac.message.id)[0] - 1]);
				}
			} else {
				starBoard.set(reac.message.id, new Array(new Number(1)));
			}
		} else if (reac.emoji.id == '724795407305146378') {
			console.log('got a downdoot');
			if (starBoard.has(reac.message.id)) {
				if (starBoard.get(reac.message.id).length == 2) {
					starBoard.set(reac.message.id, [starBoard.get(reac.message.id)[0] + 1, starBoard.get(reac.message.id)[1]]);
				} else {
					starBoard.set(reac.message.id, [starBoard.get(reac.message.id)[0] + 1]);
				}
			} else {
				starBoard.set(reac.message.id, new Array(new Number(-1)));
			}
		}
		if (starBoard.get(reac.message.id)[0] >= upDootLimit) {
			console.log('enough updoots');
			if (starBoard.get(reac.message.id).length == 2) {
				starBoard.get(reac.message.id)[1].edit(starBoard.get(reac.message.id)[1].embeds[0]
					.setTitle('<:Updoot:724795433540386878> ' + starBoard.get(reac.message.id)[0])
				);
			} else if (reac.message.attachments.size == 0) {
				client.channels.resolve('734222580126318592').send(new Discord.MessageEmbed()
					.setAuthor(reac.message.author.tag)
					.setTitle('<:Updoot:724795433540386878> ' + starBoard.get(reac.message.id))
					.setDescription(reac.message.content + `\n\n[Click here to jump to the message](${reac.message.url})`)
				)
					.then(msg => {
						starBoard.set(reac.message.id, [starBoard.get(reac.message.id)[0], msg]);
					});
			} else {
				client.channels.resolve('734222580126318592').send(new Discord.MessageEmbed()
					.setAuthor(reac.message.author.tag)
					.setTitle('<:Updoot:724795433540386878> ' + starBoard.get(reac.message.id))
					.setDescription(reac.message.content + `\n\n[Click here to jump to the message](${reac.message.url})`)
					.setImage(reac.message.attachments.first().url)
				)
					.then(msg => {
						starBoard.set(reac.message.id, [starBoard.get(reac.message.id)[0], msg]);
					});
			}
		} else if (starBoard.get(reac.message.id)[0] <= 0 - upDootLimit) {
			console.log('enough downdoots');
			if (starBoard.get(reac.message.id).length == 2) {
				starBoard.get(reac.message.id)[1].edit(starBoard.get(reac.message.id)[1].embeds[0]
					.setTitle('<:Downdoot:724795407305146378> ' + Math.abs(starBoard.get(reac.message.id)[0]))
				);
			} else if (reac.message.attachments.size == 0) {
				client.channels.resolve('734222580126318592').send(new Discord.MessageEmbed()
					.setAuthor(reac.message.author.tag)
					.setTitle('<:Downdoot:724795407305146378> ' + Math.abs(starBoard.get(reac.message.id)))
					.setDescription(reac.message.content + `\n\n[Click here to jump to the message](${reac.message.url})`)
				)
					.then(msg => {
						starBoard.set(reac.message.id, [starBoard.get(reac.message.id)[0], msg]);
					});
			} else {
				client.channels.resolve('734222580126318592').send(new Discord.MessageEmbed()
					.setAuthor(reac.message.author.tag)
					.setTitle('<:Downdoot:724795407305146378> ' + Math.abs(starBoard.get(reac.message.id)))
					.setDescription(reac.message.content + `\n\n[Click here to jump to the message](${reac.message.url})`)
					.setImage(reac.message.attachments.first().url)
				)
					.then(msg => {
						starBoard.set(reac.message.id, [starBoard.get(reac.message.id)[0], msg]);
					});
			}
		} else if (starBoard.get(reac.message.id)[1] && starBoard.get(reac.message.id)[0] > 0 - upDootLimit && starBoard.get(reac.message.id)[0] < upDootLimit) {
			starBoard.get(reac.message.id)[1].delete();
			starBoard.set(reac.message.id, [starBoard.get(reac.message.id)[0]]);
		}
	}
});
*/
client.on('message', (message) => {
	if (!message.author.bot) {
		var user = message.author;
		if (message.channel.type === 'text') {
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

			switch (message.content.toLowerCase()) {
			case prefix + 'quote':
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
			case prefix + 'fuck':
				channel.send('fuck');
				break;

			case prefix + 'fac':
			case prefix + 'flipacoin':
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

			case prefix + 'idiot':
				channel.send('Here is an idiot for you: ' + user.tag);
				break;

			case prefix + 'kill':
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

			case prefix + 'ping':
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

			case prefix + 'snek':
				channel.send({
					files: [{
						attachment: 'https://cdn.discordapp.com/attachments/647616102339313667/795971177754525706/snek.jpg',
						name: 'snek.jpg'
					}]
				});
				console.log(user.username + ' used snek');
				break;

			case prefix + 'sunny':
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

			case prefix + 'snipe':
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

			case prefix + 'forbiddenwords':
				forbiddenWords.forEach((word) => {
					user.createDM()
						.then(DMchannel => {
							DMchannel.send('[' + (forbiddenWords.indexOf(word) + 1) + ']: ' + word);
						});
				});
				console.log('checked forbidden words');
				break;

			case prefix + 'serverinfo':
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
				emojisArray.push('and ' + new String(message.guild.emojis.cache.size - 30) + ' more. Run ' + prefix + 'emotes for a full list!');
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

			case prefix + 'emotes':
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

			case prefix + 'subredditinfo':
			case prefix + 'sri':
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
				if(server.id == '716601325269549127') {
					if(message.mentions.roles.first() == server.roles.cache.get('735212949639135272')) {
						server.roles.cache.get('735212949639135272').setMentionable(false);
						setTimeout(() => {
							server.roles.cache.get('735212949639135272').setMentionable(true);
							fs.readFile('./cacheBetweenBoots.json', (err, res) => {
								if (err) process.stderr.write(err);
								var toWrite = res.toString().split('\n');
								toWrite[2] = '\t"rpSeekPinged": false';
								toWrite[3] = '}';
								fs.writeFile('./cacheBetweenBoots.json', toWrite.join('\n'), (err) => {
									if (err) process.stderr.write(err);
								});
							});
						}, 3600000);
						console.log(user.username + ' is looking for someone to rp with');
						fs.readFile('./cacheBetweenBoots.json', (err, res) => {
							if (err) process.stderr.write(err);
							var toWrite = res.toString().split('\n');
							toWrite[2] = '\t"rpSeekPinged": true';
							toWrite[3] = '}';
							fs.writeFile('./cacheBetweenBoots.json', toWrite.join('\n'), (err) => {
								if (err) process.stderr.write(err);
							});
						});
					}
				}
				if (message.content.toLowerCase().startsWith(prefix + 'help')) {
					var helpmsg = message.content.slice(6);
					if (helpmsg == 'forbiddenwords') {
						channel.send(new Discord.MessageEmbed()
							.setColor('DARK_GREEN')
							.setTitle('forbiddenwords command help')
							.setDescription('+forbiddenwords = sends a list of forbiddenwords to your dms. ')
							.setFooter('Contact Snek or Baguette Speaker if you have any questions.'));
					}
					if (helpmsg == '') {
						channel.send(new Discord.MessageEmbed()
							.setColor('DARK_GREEN')
							.setTitle(' command help')
							.setDescription(helpstr)
							.setFooter('Contact Snek or Baguette speaker if you have any questions.'));
					}
					if (helpmsg == '') {
						channel.send(new Discord.MessageEmbed()
							.setColor('DARK_GREEN')
							.setTitle(' command help')
							.setDescription('')
							.setFooter('Contact Snek or Baguette speaker if you have any questions.'));
					}
				}
				if ((message.content.toLowerCase().startsWith(prefix + 'modhelp')) && ((server.members.resolve(user.id).permissions.has('ADMINISTRATOR')) || (server.members.resolve(user.id).roles.cache.has('795847347397066773')))) {
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
							.setDescription(modhelpstr)
							.setFooter('Contact Snek or Baguette speaker if you have any questions. You can do +modhelp <command> for specifics on one command.'));
					}
					else {
						channel.send(new Discord.MessageEmbed()
							.setColor([255, 0, 0])
							.setTitle('Error')
							.setDescription('Did you type in the wrong command name? Check it again.')
							.setFooter('Contact Snek or Baguette speaker if you have any questions.'));
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
													fs.readFile('./cacheBetweenBoots.json', (err, res) => {
														if (err) return console.error(err);
														var toWrite = res.toString().split('\n');
														var entriesJaggedArray = new Array();
														// eslint-disable-next-line max-nested-callbacks
														reactionRolesMessage.forEach((val, k) => {
															entriesJaggedArray.push([val, k]);
														});
														toWrite[2] = '\t"reactionRoles": ' + entriesJaggedArray;
														toWrite[3] = '}';
														var toWriteStr = '';
														// eslint-disable-next-line max-nested-callbacks
														toWrite.forEach(elemInArray => {
															toWriteStr = toWriteStr + elemInArray + '\n';
														});
														// eslint-disable-next-line max-nested-callbacks
														// fs.writeFile('./cacheBetweenBoots.json', toWriteStr, (err) => {
														// console.error(err);
														// });
													});
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
						toWrite[1] = '\t"prefix": "' + prefix + '"';
						fs.writeFile('./config.json', toWrite.join('\n'), err => {
							if (err) process.stderr.write(err);
						});
					});
					message.reply('Prefix changed. New prefix: ' + prefix + ' This prefix will be resetted to ' + prefix + 'on reboot.');
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
				} else if (message.content.toLowerCase().includes('quibli')) {
					message.reply('it is spelled Qibli.');
					console.log(user.username + ' misspelled qibli');
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
						forbiddenWords.push(message.content.toLowerCase().slice(12));
						channel.send('That word has been generally set as forbidden.');
					}
					else {
						channel.send('You don\'t have permissions to do that! Requires manage messages permission.');
					}
					console.log(user.username + ' forbid a new word: ' + message.content.toLowerCase().slice(12));
				} else if (message.content.toLowerCase().startsWith(prefix + 'sumthemup')) {
					var messagesSent;
					if (message.mentions.users.size == 0) {
						if (!totalMessages.get(user.id)) totalMessages.set(user.id, 0);
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
						if (!totalMessages.get(message.mentions.users.last().id)) totalMessages.set(message.mentions.users.last().id, 0);
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
								if (mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ')) || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ')))) {
									message.reply('Oc found!');
									channel.send(mess.url);
									found = true;
								}
							});
							if (!found) {
								server.channels.resolve('754470277634719845').messages.fetch({ limit: 100, before: oldMsg.last().id })
									.then(oldMsg2 => {
										oldMsg2.each(mess => {
											if (mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ')) || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ')))) {
												message.reply('Oc found!');
												channel.send(mess.url);
												found = true;
											}
										});
										if (!found) {
											server.channels.resolve('754470277634719845').messages.fetch({ limit: 100, before: oldMsg2.last().id })
												.then(oldMsg3 => {
													oldMsg3.each(mess => {
														if (mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ')) || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ')))) {
															message.reply('Oc found!');
															channel.send(mess.url);
															found = true;
														}
													});
													if (!found) {
														server.channels.resolve('754470277634719845').messages.fetch({ limit: 100, before: oldMsg3.last().id })
															.then(oldMsg4 => {
																// eslint-disable-next-line max-nested-callbacks
																oldMsg4.each(mess => {
																	if (mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ')) || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ')))) {
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
				} else if (message.content.toLowerCase().startsWith(prefix + 'setmessagecount ') && (server.members.resolve(user.id).hasPermission('MANAGE_MESSAGES') || server.members.resolve(user.id).roles.cache.has('795414220707463188'))) {
					if (message.mentions.members.size == 1 && message.content.split(' ').length == 3 && !isNaN(message.content.split(' ')[2])) {
						fs.readFile('./messagecount.json', (err, res) => {
							var toWrite = res.toString().split('\n');
							if (err) process.stderr.write(err);
							if (!res.toString().includes(message.mentions.members.first().id)) {
								toWrite[toWrite.length - 2] = toWrite[toWrite.length - 2] + ',';
								toWrite[toWrite.length - 1] = `\t"${message.mentions.members.first().id}": ${message.content.split(' ')[2]}`;
								toWrite[toWrite.length] = '}';
							} else {
								toWrite.forEach(entry => {
									if (entry.includes(`"${message.mentions.members.first().id}": `)) {
										if (toWrite.indexOf(entry) == toWrite.length - 2) {
											toWrite[toWrite.indexOf(entry)] = entry.split(':')[0] + ': ' + (message.content.split(' ')[2]);
										} else {
											toWrite[toWrite.indexOf(entry)] = entry.split(':')[0] + ': ' + (message.content.split(' ')[2]) + ',';
										}
									}
								});
							}
							fs.writeFile('./messagecount.json', toWrite.join('\n'), err => {
								if (err) process.stderr.write(err);
							});
							channel.send('The number of messages for this person has been sucessfully updated.');
						});
						fs.readFile('./messagecount.json', (err, res) => {
							if (err) process.stderr.write(err);
							if (res.toString().includes(`"${message.mentions.members.first().id}": `)) {
								res.toString().split('\n').slice(1, -1).forEach((element, index) => {
									if (element.includes(`"${message.mentions.members.first().id}": `)) {
										if (index == res.toString().split('\n').slice(1, -1).length - 1) {
											totalMessages.set(element.split(':')[0].slice(2, -1), new Number(element.split(':')[1].slice(1)));
										} else {
											totalMessages.set(element.split(':')[0].slice(2, -1), new Number(element.split(':')[1].slice(1, -1)));
										}
									}
								});
							} else {
								totalMessages.set(message.mentions.members.first().id, 0);
							}
						});
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
				} else if (message.content.toLowerCase().startsWith(prefix + 'verbalwarn ') && ((server.members.resolve(user.id).permissions.has('ADMINISTRATOR')) || (server.members.resolve(user.id).roles.cache.has('795847347397066773')))) {
					if (!message.mentions.users.first()) {
						channel.send('Please specify a user');
					}
					else {
						const warnUser = message.mentions.users.first();
						const warn = new Warn(warnUser, message.content.slice(35), server);
						if (warns.get(warnUser.id)) {
							warns.set(warnUser.id, warns.get(warnUser.id).push(warn));
						} else {
							warns.set(warnUser.id, [warn]);
						}
					}
				} else if (message.content.toLowerCase().startsWith(prefix + 'purge ') && server.members.resolve(user.id).permissions.has('MANAGE_MESSAGES')) {
					channel.bulkDelete(new Number(message.content.split(' ')[1]));
				} else if (message.content.toLowerCase().startsWith(prefix + 'clearwarn ') && server.members.resolve(user.id).permissions.has('ADMINISTRATOR')) {
					if (!message.mentions.members.first()) {
						message.reply('Please specify an user');
					}
					else {
						warns.get(message.mentions.members.first().id).splice(message.content.slice(34) - 1);
						channel.send('👍');
					}
				} else if (message.content.toLowerCase().startsWith(prefix + 'getwarns')) {
					var warnsStr = '';
					if (!message.mentions.members.first()) {
						if (warns.has(user.id) && warns.get(user.id).length != 0) {
							const mentionned = user;
							const warnEmbed = new Discord.MessageEmbed()
								.setColor('BLUE')
								.setTitle('Warns of ' + mentionned.username + ':')
								.setFooter('For a total of ' + warns.get(mentionned.id).length);
							warns.get(mentionned.id).forEach((warn) => {
								warnsStr = warnsStr + 'Warn #' + (warns.get(mentionned.id).indexOf(warn) + 1) + ': \n' + warn.getFullString() + '\n\n\n';
							});
							warnEmbed.setDescription(warnsStr);
							channel.send(warnEmbed);
						}
						else {
							message.reply('You have no warns!');
						}
					}
					else if (warns.has(message.mentions.members.first().id) && warns.get(message.mentions.members.first().id).length != 0) {
						const mentionned = message.mentions.members.first();
						const warnEmbed = new Discord.MessageEmbed()
							.setColor('BLUE')
							.setTitle('Warns of ' + mentionned.username + ':')
							.setFooter('For a total of ' + warns.get(mentionned.id).length);
						warns.get(mentionned.id).forEach((warn) => {
							warnsStr = warnsStr + 'Warn #' + (warns.get(mentionned.id).indexOf(warn) + 1) + ': \n' + warn.getFullString() + '\n\n\n';
						});
						warnEmbed.setDescription(warnsStr);
						channel.send(warnEmbed);
					}
					else {
						message.reply('This user has no warns!');
					}
				} else if (message.content.toLowerCase().startsWith(prefix + 'allowword ') && server.members.resolve(user.id).permissions.has('MANAGE_MESSAGES')) {
					forbiddenWords.splice(message.content.toLowerCase().slice(12) - 1, 1);
					channel.send('Allowed word. Current forbidden words: ');
					forbiddenWords.forEach((word) => {
						channel.send('[' + (forbiddenWords.indexOf(word) + 1) + ']: ' + word);
					});
				} else if (!message.guild.channels.resolve('752320436699922462').children.has(message.id) && !message.guild.channels.resolve('754482269166633000').children.has(message.id) && !message.guild.channels.resolve('754476064746504272').children.has(message.id) && !message.guild.channels.resolve('757031225893322892').children.has(message.id) && !message.guild.channels.resolve('754491019768365157').children.has(message.id) && !message.guild.channels.resolve('754489573660295168').children.has(message.id)) {
					// eslint-disable-next-line no-lonely-if
					if (totalMessages.get(user.id)) {
						totalMessages.set(user.id, totalMessages.get(user.id) + 1);
					} else {
						totalMessages.set(user.id, 1);
					}
					fs.readFile('./messagecount.json', (err, res) => {
						var toWrite = res.toString().split('\n');
						if (err) process.stderr.write(err);
						if (!res.toString().includes(user.id)) {
							toWrite[toWrite.length - 2] = toWrite[toWrite.length - 2] + ',';
							toWrite[toWrite.length - 1] = `\t"${user.id}": 1`;
							toWrite[toWrite.length] = '}';
						} else {
							toWrite.forEach(entry => {
								if (entry.includes(`"${user.id}": `)) {
									if (toWrite.indexOf(entry) == toWrite.length - 2) {
										toWrite[toWrite.indexOf(entry)] = entry.split(':')[0] + ': ' + (new Number(entry.split(':')[1].slice(1, -1)) + 1);
									} else {
										toWrite[toWrite.indexOf(entry)] = entry.split(':')[0] + ': ' + (new Number(entry.split(':')[1].slice(1, -1)) + 1) + ',';
									}
								}
							});
						}
						fs.writeFile('./messagecount.json', toWrite.join('\n'), err => {
							if (err) process.stderr.write(err);
						});
					});
				} else if (message.guild.channels.resolve('752320436699922462').children.has(message.id) || message.guild.channels.resolve('754482269166633000').children.has(message.id) || message.guild.channels.resolve('754476064746504272').children.has(message.id) || message.guild.channels.resolve('757031225893322892').children.has(message.id) || message.guild.channels.resolve('754491019768365157').children.has(message.id) || message.guild.channels.resolve('754489573660295168').children.has(message.id)) {
					if (totalMessages.get(user.id)) {
						totalMessages.set(user.id, totalMessages.get(user.id) + 0.5);
					} else {
						totalMessages.set(user.id, 0.5);
					}
					fs.readFile('./messagecount.json', (err, res) => {
						var toWrite = res.toString().split('\n');
						if (err) process.stderr.write(err);
						if (!res.toString().includes(user.id)) {
							toWrite[toWrite.length - 2] = toWrite[toWrite.length - 2] + ',';
							toWrite[toWrite.length - 1] = `\t"${user.id}": 0.5`;
							toWrite[toWrite.length] = '}';
						} else {
							toWrite.forEach(entry => {
								if (entry.includes(`"${user.id}": `)) {
									if (toWrite.indexOf(entry) == toWrite.length - 2) {
										toWrite[toWrite.indexOf(entry)] = entry.split(':')[0] + ': ' + (new Number(entry.split(':')[1].slice(1, -1)) + 0.5);
									} else {
										toWrite[toWrite.indexOf(entry)] = entry.split(':')[0] + ': ' + (new Number(entry.split(':')[1].slice(1, -1)) + 0.5) + ',';
									}
								}
							});
						}
						fs.writeFile('./messagecount.json', toWrite.join('\n'), err => {
							if (err) process.stderr.write(err);
						});
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
					.setFooter('This is an automated message. Please answer using ' + prefix + 'reply ' + messageMods.length + ' <message>');
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
						fs.readFile('./cacheBetweenBoots.json', (err, res) => {
							if (err) process.stderr.write(err);
							DMchannel.send('The last post id (the thing to put in cacheBetweenBoots.json) is:' + res.toString().split('\n')[1]);
						});
					});
				console.log(user.username + ' fetched the file. Have fun!');
			}
		}
	}
});

client.login('NzcxOTQ1OTEzMDQ0MzAzOTEy.X5zgpw.7VJrx-IK1SCRRUB_XxaK7kmhBfg');
