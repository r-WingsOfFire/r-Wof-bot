const Discord = require('discord.js')
const { Client, Intents, MessageEmbed, Message } = Discord
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES] })
const { readFile, writeFile } = require('fs')
const { table } = require('quick.db')
var totalMessages = new table('totalMessage')
var stalking = new table('stalk')
var ocs = new table('OC')
const worker = require('worker_threads');

const process = require('process')
const exit = process.exit
var tokenBuffer = process.env.token
if(tokenBuffer == undefined) {
	const {token} = require('./config.json')
	tokenBuffer = token
}
var token = tokenBuffer
var prefix = '+'
try {
	{prefix} require('./config.json')
} catch (e) {
	console.log(e)
} finally {
	console.log(`prefix: ${prefix}`)
}

var reactionRolesMessage = new Map()
var messageMods = []

var forbiddenWords = ['placeholder1', 'placeholder2']
var warns = new Map()
const helpstr = `${prefix}forbiddenwords\n ${prefix}quote\n ${prefix}fac (or ${prefix}flipacoin)\n ${prefix}ping\n ${prefix}sunny\n  ${prefix}hybridgen <pyrrhia/pantala/any> <same for #2>\n ${prefix}poll <thumbs/numbers> <question>\n ${prefix}whois (or ${prefix}whatis) <name or thing>\n ${prefix}sumthemup <user>\n ${prefix}oc <oc name>\n${prefix}messagemods <message>`
const modhelpstr = prefix + `verbalwarn <mention user>\n ${prefix}log <message>\n${prefix}clearword <word>\n ${prefix}reply <modmail message ID> <message>\n ${prefix}getwarns <user>\n ${prefix}allowword <word ID>\n ${prefix}clearwarn <user>\n ${prefix}reactionrole (or ${prefix}rr) <channel>`
const pytribes = ['skywing', 'seawing', 'icewing', 'nightwing', 'sandwing', 'mudwing', 'rainwing']
const patribes = ['leafwing', 'hivewing', 'silkwing']
const alltribes = ['skywing', 'seawing', 'icewing', 'nightwing', 'sandwing', 'mudwing', 'rainwing', 'leafwing', 'hivewing', 'silkwing']

var lastmessage = undefined

var quoteBusy = false

var rWingsOfFireServer

/**
 * Transforms a string to another string but with the first letter being uppercase.
 * @param {String} str the base string
 * @returns {String} the transformed string
 */
function toFirstUppercase(str) {
	if (str == '') return

	str = str.toLowerCase()
	var bufferArray = str.split('')
	bufferArray[0] = bufferArray[0].toUpperCase()
	return bufferArray.join('')
}

/** Searches for a text in a message
 * @param {Message} message the message to search in
 * @param {String} text The text to look for
 * @param {bool} word If true, only returns the next word.
 * @returns {String} The next word or the end of the line
*/
function searchInMessage(message, text, word = true) {
	var output = ''
	if(message.content.toLowerCase().includes(text.toLowerCase())) {
		message.content.split('\n').forEach(line => {
			if (line.toLowerCase().includes(text.toLowerCase()) && output === '' && !line.toLowerCase().includes(' name ')) {
				if(word) {
					var foundInLine = false
					line.split(' ').forEach(words => {
						if (words.toLowerCase().includes(text.toLowerCase())) foundInLine = true
						if (text.toLowerCase().includes(words.toLowerCase())) foundInLine = true
						if (!(words.toLowerCase().includes(text.toLowerCase()) || words.toLowerCase().includes(':') || words.toLowerCase().includes('resubmit') || words.toLowerCase().includes('resub')) && foundInLine && output === '') {
							output = words
						}
					})
				} else {
					output = line.toLowerCase().split(text.toLowerCase()).join('').split(':').join('')
				}
			}
		})
	} else {
		return 'N/A. If this is not supposed to be there, please contact <@373515998000840714>'
	}
	return output
}

async function fetchOCs() {
	rWingsOfFireServer = client.guilds.resolve('716601325269549127')
	var ocChannel = rWingsOfFireServer.channels.resolve('854858811101937704')
	var lastMessage = Array.from((await ocChannel.messages.fetch({ limit: 100 })).sort((msg1, msg2) => msg2.createdTimestamp - msg1.createdTimestamp),([, value]) => (value))
	var lastMessageTimestamp = lastMessage[0].createdTimestamp
	var limit = 0
	if(ocs.all().length === 0)
		limit = ocChannel.createdTimestamp
	else
		limit = (await ocChannel.messages.fetch(ocs.all()[0].data.message.Snowflake)).id
	/*let mess = await ocChannel.messages.fetch({ limit: 100 })
	limit = mess.get('901743692749086720').createdTimestamp*/
	let messages = await ocChannel.messages.fetch({ limit: 100 })
	messages = Array.from(messages.sort((msg1, msg2) => msg2.createdTimestamp - msg1.createdTimestamp),([, value]) => (value))
	var message = messages[0]
	var name = ''
	var indexAdd = 0
	var index = 0;
	do {
		if(!messages[index + indexAdd].content.toLowerCase().includes(' name')) {
			if (messages[index + indexAdd].content.toLowerCase().includes('name and common nicknames')) {
				name = searchInMessage(messages[index + indexAdd], 'name and common nicknames', false)
			} else if (messages[index + indexAdd].content.toLowerCase().includes('name and common and nicknams')) {
				name = searchInMessage(messages[index + indexAdd], 'name and common and nicknams', false)
			} else if (messages[index + indexAdd].content.toLowerCase().includes('name and common and nicknames')) {
				name = searchInMessage(messages[index + indexAdd], 'name and common and nicknames', false)
			} else if (messages[index + indexAdd].content.toLowerCase().includes('name and common nickname')) {
				name = searchInMessage(messages[index + indexAdd], 'name and common nickname', false)
			} else if (messages[index + indexAdd].content.toLowerCase().includes('name')) {
				name = searchInMessage(messages[index + indexAdd], 'name', false)
			}
		}
		indexAdd++
	} while(name === '')
	var nameArr = name.split(';')[0]
		.split(',')[0]
		.split('|')[0]
		.split(' or ')[0]
		.split('(')[0]
		.split('*').join('')
		.split('-').join(' ')
		.split('  ').join(' ')
		.split(' ')
	if(nameArr[0] == '') nameArr.shift()
	if(nameArr[-1] == '') nameArr.pop()
	nameArr = nameArr.join(' ').split(' ')
	nameArr.forEach((namePart, i) => {
		if(namePart != '') nameArr[i] = toFirstUppercase(namePart)
	})
	name = nameArr.join(' ')
	ocs.set(`${name}.message.Snowflake`, message.id)
	ocs.set(`${name}.message.URL`, `https://discord.com/channels/716601325269549127/854858811101937704/${message.id}`)
	if(message.embeds.length > 0) ocs.set(`${name}.image`, message.embeds[0].url)
	if(message.mentions.users.size > 0) ocs.set(`${name}.owner`, message.mentions.users.first().username)
	if(!searchInMessage(message,'age').includes('N/A')) ocs.set(`${name}.age`, Number(searchInMessage(message, 'age')))
	if(!searchInMessage(message,'gender').includes('N/A')) ocs.set(`${name}.gender`, searchInMessage(message, 'gender'))
	if(message.attachments.size > 0) ocs.set(`${name}.image`, message.attachments.first().url)
	if(!searchInMessage(message, 'tribes', false).includes('N/A')) {
		var tribes = []
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
			.split(' ')
		var finalTribes = []
		tribes.forEach(tribe => {
			if (tribe.toLowerCase().includes('mud')) {
				finalTribes.push('mudwing')
			} else if (tribe.toLowerCase().includes('sand')) {
				finalTribes.push('sandwing')
			} else if (tribe.toLowerCase().includes('night')) {
				finalTribes.push('nightwing')
			} else if (tribe.toLowerCase().includes('sea')) {
				finalTribes.push('seawing')
			} else if (tribe.toLowerCase().includes('sky')) {
				finalTribes.push('skywing')
			} else if (tribe.toLowerCase().includes('rain')) {
				finalTribes.push('rainwing')
			} else if (tribe.toLowerCase().includes('ice')) {
				finalTribes.push('icewing')
			} else if (tribe.toLowerCase().includes('leaf')) {
				finalTribes.push('leafwing')
			} else if (tribe.toLowerCase().includes('hive')) {
				finalTribes.push('hivewing')
			} else if (tribe.toLowerCase().includes('silk')) {
				finalTribes.push('silkwing')
			}
		})
		ocs.set(`${name}.tribes`, finalTribes)
	} else if (!searchInMessage(message, 'tribe(s)', false).includes('N/A')) {
		tribes = []
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
			.split(' ')
		finalTribes = []
		tribes.forEach(tribe => {
			if (tribe.toLowerCase().includes('mud')) {
				finalTribes.push('mudwing')
			} else if (tribe.toLowerCase().includes('sand')) {
				finalTribes.push('sandwing')
			} else if (tribe.toLowerCase().includes('night')) {
				finalTribes.push('nightwing')
			} else if (tribe.toLowerCase().includes('sea')) {
				finalTribes.push('seawing')
			} else if (tribe.toLowerCase().includes('sky')) {
				finalTribes.push('skywing')
			} else if (tribe.toLowerCase().includes('rain')) {
				finalTribes.push('rainwing')
			} else if (tribe.toLowerCase().includes('ice')) {
				finalTribes.push('icewing')
			} else if (tribe.toLowerCase().includes('leaf')) {
				finalTribes.push('leafwing')
			} else if (tribe.toLowerCase().includes('hive')) {
				finalTribes.push('hivewing')
			} else if (tribe.toLowerCase().includes('silk')) {
				finalTribes.push('silkwing')
			}
		})
		ocs.set(`${name}.tribes`, finalTribes)
	} else if (!searchInMessage(message, 'tribe', false).includes('N/A')) {
		ocs.push(`${name}.tribes`, searchInMessage(message, 'tribe'))
	}

	lastMessageTimestamp = messages[messages.length - 1].createdTimestamp
	lastMessage = messages[1].id
	do {
		let messages = await ocChannel.messages.fetch({ limit: 100, before: lastMessage.id })
		messages = Array.from(messages.sort((msg1, msg2) => msg2.createdTimestamp - msg1.createdTimestamp),([, value]) => (value))
		messages.forEach((message, index) => {
			var name = ''
			var indexAdd = 0
			do {
				if(index + indexAdd >= 100) return

				if(!messages[index + indexAdd].content.toLowerCase().includes(' name')) {
					if (messages[index + indexAdd].content.toLowerCase().includes('name and common nicknames')) {
						name = searchInMessage(messages[index + indexAdd], 'name and common nicknames', false)
					} else if (messages[index + indexAdd].content.toLowerCase().includes('name and common and nicknams')) {
						name = searchInMessage(messages[index + indexAdd], 'name and common and nicknams', false)
					} else if (messages[index + indexAdd].content.toLowerCase().includes('name and common and nicknames')) {
						name = searchInMessage(messages[index + indexAdd], 'name and common and nicknames', false)
					} else if (messages[index + indexAdd].content.toLowerCase().includes('name and common nickname')) {
						name = searchInMessage(messages[index + indexAdd], 'name and common nickname', false)
					} else if (messages[index + indexAdd].content.toLowerCase().includes('name')) {
						name = searchInMessage(messages[index + indexAdd], 'name', false)
					}
				}
				indexAdd++
			} while(name === '')
			var nameArr = name.split(';')[0]
				.split(',')[0]
				.split('|')[0]
				.split(' or ')[0]
				.split('(')[0]
				.split('*').join('')
				.split('-').join(' ')
				.split('  ').join(' ')
				.split(' ')
			if(nameArr[0] == '') nameArr.shift()
			if(nameArr[nameArr.length - 1] == '') nameArr.pop()
			nameArr = nameArr.join(' ').split(' ')
			nameArr.forEach((namePart, i) => {
				if(namePart != '') nameArr[i] = toFirstUppercase(namePart)
			})
			name = nameArr.join(' ')
			ocs.set(`${name}.message.Snowflake`, message.id)
			ocs.set(`${name}.message.URL`, `https://discord.com/channels/716601325269549127/854858811101937704/${message.id}`)
			if(message.embeds.length > 0) ocs.set(`${name}.image`, message.embeds[0].url)
			if(message.mentions.users.size > 0) ocs.set(`${name}.owner`, message.mentions.users.first().username)
			if(!searchInMessage(message,'age').includes('N/A')) ocs.set(`${name}.age`, new Number(searchInMessage(message, 'age')))
			if(!searchInMessage(message,'gender').includes('N/A')) ocs.set(`${name}.gender`, searchInMessage(message, 'gender'))
			if(message.attachments.size > 0) ocs.set(`${name}.image`, message.attachments.first().url)
			if(!searchInMessage(message, 'tribes', false).includes('N/A')) {
				var tribes = []
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
					.split(' ')
				var finalTribes = []
				tribes.forEach(tribe => {
					if (tribe.toLowerCase().includes('mud')) {
						finalTribes.push('mudwing')
					} else if (tribe.toLowerCase().includes('sand')) {
						finalTribes.push('sandwing')
					} else if (tribe.toLowerCase().includes('night')) {
						finalTribes.push('nightwing')
					} else if (tribe.toLowerCase().includes('sea')) {
						finalTribes.push('seawing')
					} else if (tribe.toLowerCase().includes('sky')) {
						finalTribes.push('skywing')
					} else if (tribe.toLowerCase().includes('rain')) {
						finalTribes.push('rainwing')
					} else if (tribe.toLowerCase().includes('ice')) {
						finalTribes.push('icewing')
					} else if (tribe.toLowerCase().includes('leaf')) {
						finalTribes.push('leafwing')
					} else if (tribe.toLowerCase().includes('hive')) {
						finalTribes.push('hivewing')
					} else if (tribe.toLowerCase().includes('silk')) {
						finalTribes.push('silkwing')
					}
				})
				ocs.set(`${name}.tribes`, finalTribes)
			} else if (!searchInMessage(message, 'tribe(s)', false).includes('N/A')) {
				tribes = []
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
					.split(' ')
				finalTribes = []
				tribes.forEach(tribe => {
					if (tribe.toLowerCase().includes('mud')) {
						finalTribes.push('mudwing')
					} else if (tribe.toLowerCase().includes('sand')) {
						finalTribes.push('sandwing')
					} else if (tribe.toLowerCase().includes('night')) {
						finalTribes.push('nightwing')
					} else if (tribe.toLowerCase().includes('sea')) {
						finalTribes.push('seawing')
					} else if (tribe.toLowerCase().includes('sky')) {
						finalTribes.push('skywing')
					} else if (tribe.toLowerCase().includes('rain')) {
						finalTribes.push('rainwing')
					} else if (tribe.toLowerCase().includes('ice')) {
						finalTribes.push('icewing')
					} else if (tribe.toLowerCase().includes('leaf')) {
						finalTribes.push('leafwing')
					} else if (tribe.toLowerCase().includes('hive')) {
						finalTribes.push('hivewing')
					} else if (tribe.toLowerCase().includes('silk')) {
						finalTribes.push('silkwing')
					}
				})
				ocs.set(`${name}.tribes`, finalTribes)
			} else if (!searchInMessage(message, 'tribe', false).includes('N/A')) {
				ocs.push(`${name}.tribes`, searchInMessage(message, 'tribe'))
			}
		})
		if (lastMessageTimestamp >= messages[messages.length - 1].createdTimestamp) return 1

		lastMessageTimestamp = messages[messages.length - 1].createdTimestamp
		lastMessage = messages[messages.length - 10].id
	} while (lastMessageTimestamp > limit)
	return 0
}

client.once('ready', async () => {
	rWingsOfFireServer = client.guilds.resolve('716601325269549127')
	//rWingsOfFireServer.channels.resolve('724790540721455144').send('I am now online!')
	client.user.setUsername(`r/WOF Bot (${prefix})`)
	console.log('[' + ('0' + new Date(Date.now()).getHours()).slice(-2) + ':' + ('0' + new Date(Date.now()).getMinutes()).slice(-2) + ':' + ('0' + new Date(Date.now()).getSeconds()).slice(-2) + `] Logged in as ${client.user.tag}; ready!`)
	rWingsOfFireServer.roles.resolve('795414220707463188').setMentionable(true)
	fetchOCs().then(n => {console.log(n)})
	setInterval(() => {
		stalking.all().forEach((stalk) => {
			stalk.data.forEach((stalked, index) => {
				rWingsOfFireServer.members.fetch({ withPresences: true }).then(fetchedMembers => {
					const totalOnline = fetchedMembers.filter(member => member.presence?.status === 'online' || member.presence?.status === 'dnd')
					console.log(fetchedMembers.get(stalked).presence)
					if(totalOnline.has(fetchedMembers.get(stalked).id)) {
						fetchedMembers.get(stalk.ID).send(`${fetchedMembers.get(stalked).user.username} is online!`)
						var stalkArray = stalking.get(`${stalk.ID}`)
						console.log(stalking.get(`${stalk.ID}`))
						try {
							stalkArray.splice(index, 1)
							console.log(stalkArray)
							stalking.set(`${stalk.ID}`, stalkArray)
						} catch {
							stalking.delete(stalk.ID)
						}
					}
				})
			})
		})
	}, 5000)
	if (!client.application?.owner) await client.application?.fetch();

	const command = await client.guilds.cache.get('716601325269549127')?.commands.fetch('910250822779162714');

	const permissions = [
		{
			id: '795414220707463188',
			type: 'ROLE',
			permission: true,
		},
		{
			id: '716603740051996703',
			type: 'ROLE',
			permission: true,
		},
	];

	await command.permissions.add({ permissions });
})

/**
 * Kinda like a dice.
 * @param {Number} min The lowest number possible
 * @param {Number} max The highest number possible
 * @returns {Number} A pseudo-random nuber in the range [min ]max
 */
function randInt(min, max) {
	return Math.floor(Math.random() * max - min) + min
}



client.on('messageDelete', (msg) => {
	lastmessage = msg
})

client.on('messageCreate', (message) => {
	if (!message.author.bot) {
		var user = message.author
		var channel = message.channel
		if (message.content.toLowerCase().includes('quibli')) {
			message.reply('it is spelled Qibli.')
			console.log(user.username + ' misspelled qibli')
		}
		if (channel.type === 'text' && message.content.startsWith(prefix)) {
			var command = message.content.toLowerCase().slice(prefix.length).split(' ')[0]
			var server = message.guild

			forbiddenWords.forEach(slur => {
				if(message.content.toLowerCase().includes(' ' + slur) || message.content.toLowerCase().includes(slur + ' ')) {
					message.delete({ reason: 'Contains a forbidden word.' })
					channel.send('*This message was automatically deleted, because it contains a forbidden word. Please check your message twice before sending it.*')

					var badword = new MessageEmbed()
						.setColor('RED')
						.setTitle(user.tag + ' said something bad in #' + message.channel.name)
						.setDescription(message.content)
						.setFooter('This is an automated message. The original message was deleted and logged here insted.')
					client.channels.fetch('718192469560262656')
						.then(logChannel => {
							logChannel.send(badword)
						})
					console.log(user.username + ' said something bad')
				}
			})

			switch (command) {
			
			

			case 'fac':
			case 'flipacoin':
				var random = Math.random()
				if(random < 0.5) {
					message.reply(
						new MessageEmbed().setDescription('It\'s tails!')
							.setTitle('The coin says...')
							.setColor('BLUE')
							.setThumbnail('https://cdn.discordapp.com/attachments/785186788003282987/792399120925065216/unknown.png')
					)
				}
				else if(random > 0.5) {
					message.reply(
						new MessageEmbed().setDescription('It\'s heads!')
							.setTitle('The coin says...')
							.setColor('BLUE')
							.setThumbnail('https://cdn.discordapp.com/attachments/785186788003282987/792399253040922664/unknown.png')
					)
				} else {
					message.reply('It\'s... Oh, well the piece landed on its edge...')
					// almost impossibe, but still funny
				}
				break

			case 'idiot':
				channel.send('Here is an idiot for you: ' + user.tag)
				break

			case 'snipe':
				if (server.members.resolve(user.id).roles.cache.has('751577896132280330') || server.members.resolve(user.id).roles.cache.has('795414220707463188')) {
					if (lastmessage != undefined) {
						channel.send(
							new MessageEmbed()
								.setAuthor(lastmessage.author.tag)
								.setColor('RED')
								.setDescription(lastmessage.content)
						)
						lastmessage = undefined
					} else {
						channel.send('There is nothing to snipe!')
					}
				}
				break

			case 'forbiddenwords':
				forbiddenWords.forEach((word) => {
					user.createDM()
						.then(DMchannel => {
							DMchannel.send('[' + (forbiddenWords.indexOf(word) + 1) + ']: ' + word)
						})
				})
				console.log('checked forbidden words')
				break

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
					.set(11, 'December')
				// eslint-disable-next-line no-case-declarations
				let toHumanReadable = new Map()
					.set('us-east', 'US East')
				var memberco = message.guild.memberCount
				var offlineCount = message.guild.members.cache.filter(m => m.presence.status === 'offline').size
				var onlineCount = memberco - offlineCount
				var creationdate = monthNumberToStr.get(message.guild.createdAt.getUTCMonth()) + ' ' + message.guild.createdAt.getUTCDate() + ', ' + message.guild.createdAt.getUTCFullYear()
				var serverIcon = message.guild.iconURL()
				var twoFA = new String()
				var defaultNotif = message.guild.defaultMessageNotifications
				var features = []
				message.guild.features.forEach((f, index) => {
					features[index] = toFirstUppercase(f.replace(/_/gi, ' '))
				})
				features = features.join(', ')
				defaultNotif = toFirstUppercase(defaultNotif)
				if (message.guild.mfaLevel == 0) {
					twoFA = 'Not Required'
				} else {
					twoFA = 'Required'
				}
				var rolesArray = []
				rolesArray = message.guild.roles.cache.array().slice(0, 40)
				rolesArray.push('and ' + new Number(message.guild.roles.cache.size - 40) + ' more...')
				var emojisArray = []
				emojisArray = message.guild.emojis.cache.array().slice(0, 30)
				emojisArray.push('and ' + new String(message.guild.emojis.cache.size - 30) + ` more. Run ${prefix}emotes for a full list!`)
				var serverinfoembed = new MessageEmbed()
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
					.setFooter('Server Info for r/wingsoffire Discord Server')
				channel.send(serverinfoembed)
				console.log(user.username + ' requested the server\'s info')
				break

			case 'emotes':
				// eslint-disable-next-line no-case-declarations
				let staticEmojis = [message.guild.emojis.cache.filter(e => !e.animated).array().slice(0, 30).join(' '), message.guild.emojis.cache.filter(e => !e.animated).array().slice(30).join(' ')]
				// eslint-disable-next-line no-case-declarations
				let animated = message.guild.emojis.cache.filter(e => e.animated).array().join(' ')
				channel.send(
					new MessageEmbed()
						.setTitle(server.name + '\'s emotes!')
						.addFields(
							{ name: 'Static', value: staticEmojis[0] },
							{ name: '_ _', value: staticEmojis[1] },
							{ name: 'Animated', value: animated }
						)
						.setColor('RANDOM')
				)
				break

			default:
				if (message.content.toLowerCase().startsWith(prefix + 'help')) {
					var helpmsg = message.content.slice(6)
					if (helpmsg == 'forbiddenwords') {
						channel.send(new MessageEmbed()
							.setColor('DARK_GREEN')
							.setTitle('forbiddenwords command help')
							.setDescription('+forbiddenwords = sends a list of forbidden words to your dms. ')
							.setFooter('Contact Snek or Baguette Speaker if you have any questions.'))
					}
					else if (helpmsg == 'quote') {
						channel.send(new MessageEmbed()
							.setColor('DARK_GREEN')
							.setTitle('quote command help')
							.setDescription('+quote will give you a random quote from a character out of the books. Your goal is to guess which character said it before the time expires. Simply type the character\'s name in the chat when you think you know who it is.')
							.setFooter('Contact Snek or Baguette speaker if you have any questions.'))
					}
					else if ((helpmsg == 'fac') || (helpmsg == 'flipacoin')) {
						channel.send(new MessageEmbed()
							.setColor('DARK_GREEN')
							.setTitle('flipacoin command help')
							.setDescription('+flipacoin (or +fac) will do a coinflip, giving you either heads or tails as a result.')
							.setFooter('Contact Snek or Baguette speaker if you have any questions.'))
					}
					else if (helpmsg == 'ping') {
						channel.send(new MessageEmbed()
							.setColor('DARK_GREEN')
							.setTitle('ping command help')
							.setDescription('+ping checks the responsiveness of the bot and your internet. If the bot seems to be malfunctioning or not working at all, you can do +ping to see if it is working. If the bot does not respond, there may be a problem.')
							.setFooter('Contact Snek or Baguette speaker if you have any questions.'))
					}
					else if (helpmsg == 'sunny') {
						channel.send(new MessageEmbed()
							.setColor('DARK_GREEN')
							.setTitle('sunny command help')
							.setDescription('+sunny gives you a random, upbeat quote from sunny')
							.setFooter('Contact Snek or Baguette speaker if you have any questions.'))
					}
					else if (helpmsg == 'hybridgen') {
						channel.send(new MessageEmbed()
							.setColor('DARK_GREEN')
							.setTitle('hybridgen command help')
							.setDescription('+hybirdgen <pyrrhia/pantala/any> <py/pa/any> will give you a random hybrid combination within the peramaters that you chose. You may choose to specify "pyrrhia", "pantala", or "any" within the command. You can also leave it blank, and it will revert to <any> <any>. You may also only use one peramater, and leave the other blank. Any spot that is left blank will automatically use the "any" list.')
							.setFooter('Contact Snek or Baguette speaker if you have any questions.'))
					}
					else if (helpmsg == 'poll') {
						channel.send(new MessageEmbed()
							.setColor('DARK_GREEN')
							.setTitle('poll command help')
							.setDescription('+poll <thumbs/numbers> <question or proposal> will create a poll from the question or proposal you put in there. If you specifed thumbs, you would get reactions of thumbsup and thumbsdown. If you specified numbers, you will get reactions of numbers from 1-10. You can then react to vote on it.')
							.setFooter('Contact Snek or Baguette speaker if you have any questions.'))
					}
					else if ((helpmsg == 'whois') || (helpmsg == 'whatis')) {
						channel.send(new MessageEmbed()
							.setColor('DARK_GREEN')
							.setTitle('whatis/whois command help')
							.setDescription('+whatis (or +whois) Will search the wings of fire wiki for the thing or character you specified. If it does not match exactly, it may not work. This one is a bit touchy.')
							.setFooter('Contact Snek or Baguette speaker if you have any questions.'))
					}
					else if (helpmsg == 'sumthemup') {
						channel.send(new MessageEmbed()
							.setColor('DARK_GREEN')
							.setTitle('sumthemup command help')
							.setDescription('+sumthemup <user> will check out all the stats of the user specified.')
							.setFooter('Contact Snek or Baguette speaker if you have any questions.'))
					}
					else if (helpmsg == 'oc') {
						channel.send(new MessageEmbed()
							.setColor('DARK_GREEN')
							.setTitle('oc command help')
							.setDescription('+oc <oc name> will search the approved channel for a character by that name, and give you the bio, if it can be found.')
							.setFooter('Contact Snek or Baguette speaker if you have any questions.'))
					}
					else if (helpmsg == 'messagemods') {
						channel.send(new MessageEmbed()
							.setColor('DARK_GREEN')
							.setTitle('messagemods command help')
							.setDescription('+messagemods <message> is a command that is only to be used in the bot\'s dms. It will give your message directly to us, in a mod chat, and we can then respond through the bot. If you\'re familiar with it, it\'s basically reddit modmail on discord.')
							.setFooter('Contact Snek or Baguette speaker if you have any questions.'))
					}
					else if (helpmsg == '') {
						channel.send(new MessageEmbed()
							.setColor([0, 255, 0])
							.setTitle('Commands list')
							.addField('Specific Commands', 'You can do +help <command> for specifics on the command you select.\n ex: +help poll will tell you all about the poll command.')
							.setDescription(helpstr)
							.setFooter('Contact Snek or Baguette speaker if you have any questions.'))
					}
					else {
						channel.send(new MessageEmbed()
							.setColor([255, 0, 0])
							.setTitle('Error')
							.setDescription('Did you type in the wrong command name? Check it again.')
							.setFooter('Contact Snek or Baguette speaker if you have any questions.'))
					}
				}
				if (message.content.toLowerCase().startsWith(prefix + 'modhelp')) {
					if ((server.members.resolve(user.id).permissions.has('ADMINISTRATOR')) || (server.members.resolve(user.id).roles.cache.has('795847347397066773')) || (server.members.resolve(user.id).roles.cache.has('742827962944061593'))) {
						var modhelpmsg = message.content.slice(9)
						if (modhelpmsg == 'verbalwarn') {
							channel.send(new MessageEmbed()
								.setColor('DARK_BLUE')
								.setTitle('verbalwarn command help')
								.setDescription('+verbalwarn <reason/message> = obviously, warns the person, and sends that message in their dms. Bot will then send a message to <#718192469560262656>')
								.setFooter('Contact Snek or Baguette speaker if you have any questions.'))
						}
						else if (modhelpmsg == 'log') {
							channel.send(new MessageEmbed()
								.setColor('DARK_BLUE')
								.setTitle('bot log command help')
								.setDescription('+log <message> = will simply log any message you want to log to the bot\'s output console.')
								.setFooter('Contact Snek or Baguette speaker if you have any questions.'))
						}
						else if (modhelpmsg == 'clearword') {
							channel.send(new MessageEmbed()
								.setColor('DARK_BLUE')
								.setTitle('clwarword command help')
								.setDescription('+clearword <word> = adds the selected word to the forbiddenwords list, where it will delete any message containing that word.')
								.setFooter('Contact Snek or Baguette speaker if you have any questions.'))
						}
						else if (modhelpmsg == 'reply') {
							channel.send(new MessageEmbed()
								.setColor('DARK_BLUE')
								.setTitle('reply command help')
								.setDescription('+reply <modmail ID> <message> = Will send a message back to the person who sent the modmail message selected. It will send the message from <message>.')
								.setFooter('Contact Snek or Baguette speaker if you have any questions.'))
						}
						else if (modhelpmsg == 'getwarns') {
							channel.send(new MessageEmbed()
								.setColor('DARK_BLUE')
								.setTitle('getwarns command help')
								.setDescription('+getwarns <user> = will list out each of the verbalwarns that the user in question has recieved. (ping the user by doing "<@[id]>" and replacing the [id] with the user\'s ID.)')
								.setFooter('Contact Snek or Baguette speaker if you have any questions.'))
						}
						else if (modhelpmsg == 'allowword') {
							channel.send(new MessageEmbed()
								.setColor('DARK_BLUE')
								.setTitle('allowword command help')
								.setDescription('+allowword <worrd ID> = Removes the selected word from the forbiddenwords list, if it exists.')
								.setFooter('Contact Snek or Baguette speaker if you have any questions.'))
						}
						else if (modhelpmsg == 'clearwarn') {
							channel.send(new MessageEmbed()
								.setColor('DARK_BLUE')
								.setTitle('clearwarn command help')
								.setDescription('+clearwarn <user> = will get rid of all the verbalwarns that the user has accumlated.')
								.setFooter('Contact Snek or Baguette speaker if you have any questions.'))
						}
						else if ((modhelpmsg == 'reactionrole') || (helpmsg == 'rr')) {
							channel.send(new MessageEmbed()
								.setColor('DARK_BLUE')
								.setTitle('reactionrole (rr) command help')
								.setDescription('+reactionrole (or +rr) <channel mention> = Select a channel by mentioning it, then follow the prompts to create a reactionrole message. Then the reactionrole message will appear in the channel you selected.')
								.setFooter('Contact Snek or Baguette speaker if you have any questions.'))
						}
						else if (modhelpmsg == '') {
							channel.send(new MessageEmbed()
								.setColor([0, 0, 255])
								.setTitle('r/Wingsoffire Bot Mod Help')
								.addField('Specific Mod Commands', 'You can do +modhelp <command> for specifics on the command you select. ex: +clearwarn poll will tell you all about the clearwarn command.')
								.setDescription(modhelpstr)
								.setFooter('Contact Snek or Baguette speaker if you have any questions.'))
						}
						else {
							channel.send(new MessageEmbed()
								.setColor([255, 0, 0])
								.setTitle('Error')
								.setDescription('Did you type in the wrong command name? Check it again.')
								.setFooter('Contact Snek or Baguette speaker if you have any questions.'))
						}
					}
					else {
						channel.send(new MessageEmbed()
							.setColor([255, 0, 0])
							.setTitle('Permissions Issue')
							.setDescription('You don\t have permission to do that.')
							.setFooter('Contact Snek if this is an issue.'))
					}
				}
				if (message.content.toLowerCase().startsWith(prefix + 'hybridgen')) {
					if (message.content.slice(10 + prefix.length).toLowerCase().startsWith('pyrrhia')) {
						console.log(pytribes)
						var pytribegen1 = pytribes[Math.floor(Math.random() * pytribes.length)]
						if (message.content.slice(18 + prefix.length).toLowerCase() == 'pyrrhia') {
							var pytribegen2 = pytribes[Math.floor(Math.random() * pytribes.length)]
							if (pytribegen1 == pytribegen2) {
								console.log('double; ' + pytribegen1 + ' ' + pytribegen2)
								pytribegen2 = 'reset'
								console.log(pytribegen2)
								pytribegen2 = pytribes[Math.floor(Math.random() * pytribes.length)]
								var hybridgenembed = (pytribegen1 + ' x ' + pytribegen2)
								channel.send(new MessageEmbed()
									.setColor('RANDOM')
									.setTitle('Random Hybrid Generator')
									.setFooter('This is a randomly generated hybrid combination.')
									.setDescription(hybridgenembed))
								console.log('double reset; ' + pytribegen1 + ' ' + pytribegen2)
							} else {
								hybridgenembed = (pytribegen1 + ' x ' + pytribegen2)
								channel.send(new MessageEmbed()
									.setColor('RANDOM')
									.setTitle('Random Hybrid Generator')
									.setFooter('This is a randomly generated hybrid combination.')
									.setDescription(hybridgenembed))
							}
							console.log('normal')

						}
						if (message.content.slice(18 + prefix.length).toLowerCase() == 'pantala') {
							var patribegen2 = patribes[Math.floor(Math.random() * patribes.length)]
							if (pytribegen1 == patribegen2) {
								console.log('double; ' + pytribegen1 + ' ' + patribegen2)
								patribegen2 = 'reset'
								console.log(patribegen2)
								patribegen2 = patribes[Math.floor(Math.random() * patribes.length)]
								hybridgenembed = (pytribegen1 + ' x ' + patribegen2)
								channel.send(new MessageEmbed()
									.setColor('RANDOM')
									.setTitle('Random Hybrid Generator')
									.setFooter('This is a randomly generated hybrid combination.')
									.setDescription(hybridgenembed))
								console.log('double reset; ' + pytribegen1 + ' ' + patribegen2)
							} else {
								hybridgenembed = (pytribegen1 + ' x ' + patribegen2)
								channel.send(new MessageEmbed()
									.setColor('RANDOM')
									.setTitle('Random Hybrid Generator')
									.setFooter('This is a randomly generated hybrid combination.')
									.setDescription(hybridgenembed))
							}
							console.log('normal')
						}

						else if ((message.content.toLowerCase() == prefix + 'hybridgen pyrrhia') || (message.content.slice(18 + prefix.length).toLowerCase() == 'any')) {
							var alltribegen2 = alltribes[Math.floor(Math.random() * alltribes.length)]
							if (pytribegen1 == alltribegen2) {
								console.log('double; ' + pytribegen1 + ' ' + alltribegen2)
								alltribegen2 = 'reset'
								console.log(alltribegen2)
								alltribegen2 = alltribes[Math.floor(Math.random() * alltribes.length)]
								hybridgenembed = (pytribegen1 + ' x ' + alltribegen2)
								channel.send(new MessageEmbed()
									.setColor('RANDOM')
									.setTitle('Random Hybrid Generator')
									.setFooter('This is a randomly generated hybrid combination.')
									.setDescription(hybridgenembed))
								console.log('double reset; ' + pytribegen1 + ' ' + alltribegen2)
							} else {
								hybridgenembed = (pytribegen1 + ' x ' + alltribegen2)
								channel.send(new MessageEmbed()
									.setColor('RANDOM')
									.setTitle('Random Hybrid Generator')
									.setFooter('This is a randomly generated hybrid combination.')
									.setDescription(hybridgenembed))
							}
							console.log('normal')
						}

					} else if (message.content.slice(10 + prefix.length).toLowerCase().startsWith('pantala')) {
						console.log(patribes)
						var patribegen1 = patribes[Math.floor(Math.random() * patribes.length)]
						if (message.content.slice(18 + prefix.length).toLowerCase() == 'pyrrhia') {
							pytribegen2 = pytribes[Math.floor(Math.random() * pytribes.length)]
							if (patribegen1 == pytribegen2) {
								console.log('double; ' + patribegen1 + ' ' + pytribegen2)
								pytribegen2 = 'reset'
								console.log(pytribegen2)
								pytribegen2 = pytribes[Math.floor(Math.random() * pytribes.length)]
								hybridgenembed = (patribegen1 + ' x ' + pytribegen2)
								channel.send(new MessageEmbed()
									.setColor('RANDOM')
									.setTitle('Random Hybrid Generator')
									.setFooter('This is a randomly generated hybrid combination.')
									.setDescription(hybridgenembed))
								console.log('double reset; ' + patribegen1 + ' ' + pytribegen2)
							} else {
								hybridgenembed = (patribegen1 + ' x ' + pytribegen2)
								channel.send(new MessageEmbed()
									.setColor('RANDOM')
									.setTitle('Random Hybrid Generator')
									.setFooter('This is a randomly generated hybrid combination.')
									.setDescription(hybridgenembed))
							}
							console.log('normal')
						}

						if (message.content.slice(18 + prefix.length).toLowerCase() == 'pantala') {
							// eslint-disable-next-line no-redeclare
							var patribegen2 = patribes[Math.floor(Math.random() * patribes.length)]
							if (patribegen1 == patribegen2) {
								console.log('double; ' + patribegen1 + ' ' + patribegen2)
								patribegen2 = 'reset'
								console.log(patribegen2)
								patribegen2 = patribes[Math.floor(Math.random() * patribes.length)]
								hybridgenembed = (patribegen1 + ' x ' + patribegen2)
								channel.send(new MessageEmbed()
									.setColor('RANDOM')
									.setTitle('Random Hybrid Generator')
									.setFooter('This is a randomly generated hybrid combination.')
									.setDescription(hybridgenembed))
								console.log('double reset; ' + patribegen1 + ' ' + patribegen2)
							} else {
								hybridgenembed = (patribegen1 + ' x ' + patribegen2)
								channel.send(new MessageEmbed()
									.setColor('RANDOM')
									.setTitle('Random Hybrid Generator')
									.setFooter('This is a randomly generated hybrid combination.')
									.setDescription(hybridgenembed))
							}
							console.log('normal')
						}

						else if (message.content.toLowerCase() == prefix + 'hybridgen pantala' || (message.content.slice(18 + prefix.length).toLowerCase() == 'any')) {
							// eslint-disable-next-line no-redeclare
							var alltribegen2 = alltribes[Math.floor(Math.random() * alltribes.length)]
							if (patribegen1 == alltribegen2) {
								console.log('double; ' + patribegen1 + ' ' + alltribegen2)
								alltribegen2 = 'reset'
								console.log(alltribegen2)
								alltribegen2 = alltribes[Math.floor(Math.random() * alltribes.length)]
								hybridgenembed = (patribegen1 + ' x ' + alltribegen2)
								channel.send(new MessageEmbed()
									.setColor('RANDOM')
									.setTitle('Random Hybrid Generator')
									.setFooter('This is a randomly generated hybrid combination.')
									.setDescription(hybridgenembed))
								console.log('double reset; ' + patribegen1 + ' ' + alltribegen2)
							} else {
								hybridgenembed = (patribegen1 + ' x ' + alltribegen2)
								channel.send(new MessageEmbed()
									.setColor('RANDOM')
									.setTitle('Random Hybrid Generator')
									.setFooter('This is a randomly generated hybrid combination.')
									.setDescription(hybridgenembed))
							}
							console.log('normal')
						}

					}

					else if (message.content.slice(10 + prefix.length).toLowerCase().startsWith('any')) {
						console.log(alltribes)
						var alltribegen1 = alltribes[Math.floor(Math.random() * alltribes.length)]
						// eslint-disable-next-line no-redeclare
						var alltribegen2 = alltribes[Math.floor(Math.random() * alltribes.length)]
						if (alltribegen1 == alltribegen2) {
							console.log('double; ' + alltribegen1 + ' ' + alltribegen2)
							alltribegen2 = 'reset'
							console.log(alltribegen2)
							alltribegen2 = alltribes[Math.floor(Math.random() * alltribes.length)]
							hybridgenembed = (alltribegen1 + ' x ' + alltribegen2)
							channel.send(new MessageEmbed()
								.setColor('RANDOM')
								.setTitle('Random Hybrid Generator')
								.setFooter('This is a randomly generated hybrid combination.')
								.setDescription(hybridgenembed))
							console.log('double reset; ' + alltribegen1 + ' ' + alltribegen2)
						}
						else {
							hybridgenembed = (alltribegen1 + ' x ' + alltribegen2)
							channel.send(new MessageEmbed()
								.setColor('RANDOM')
								.setTitle('Random Hybrid Generator')
								.setFooter('This is a randomly generated hybrid combination.')
								.setDescription(hybridgenembed))}
						console.log('normal')
					}

					else if (message.content.toLowerCase() == prefix + 'hybridgen') {
						console.log(alltribes)
						// eslint-disable-next-line no-redeclare
						var alltribegen1 = alltribes[Math.floor(Math.random() * alltribes.length)]
						// eslint-disable-next-line no-redeclare
						var alltribegen2 = alltribes[Math.floor(Math.random() * alltribes.length)]
						if (alltribegen1 == alltribegen2) {
							console.log('double; ' + alltribegen1 + ' ' + alltribegen2)
							alltribegen2 = 'reset'
							console.log(alltribegen2)
							alltribegen2 = alltribes[Math.floor(Math.random() * alltribes.length)]
							hybridgenembed = (alltribegen1 + ' x ' + alltribegen2)
							channel.send(new MessageEmbed()
								.setColor('RANDOM')
								.setTitle('Random Hybrid Generator')
								.setFooter('This is a randomly generated hybrid combination.')
								.setDescription(hybridgenembed))
							console.log('double reset; ' + alltribegen1 + ' ' + alltribegen2)
						}
						else {
							hybridgenembed = (alltribegen1 + ' x ' + alltribegen2)
							channel.send(new MessageEmbed()
								.setColor('RANDOM')
								.setTitle('Random Hybrid Generator')
								.setFooter('This is a randomly generated hybrid combination.')
								.setDescription(hybridgenembed))}
						console.log('normal')
					}

					else {
						console.log('somebody made a mistake on the hybrid gen command')
						channel.send(new MessageEmbed()
							.setColor([255, 0, 0])
							.setTitle('Random Hybrid Generator')
							.setFooter('Something is wrong.')
							.setDescription('Something is wrong with the selections you made. Please check your message for mistakes.'))
					}

				} else if ((message.content.toLowerCase().startsWith(prefix + 'rr') || message.content.toLowerCase().startsWith(prefix + 'reactionrole')) && server.members.resolve(user.id).hasPermission('MANAGE_ROLES')) {
					if (message.mentions.channels.first()) {
						let reactionChannel = message.mentions.channels.first()
						channel.send('Enter the base message')
						channel.awaitMessages(m => m.author.id == user.id, { max: 1 })
							.then((m) => {
								console.log('catched message')
								var end = false
								var emojiRoles = new Map()
								function getReactions() {
									if (end) {
										reactionChannel.send(m.first().content)
											.then((msg) => {
												emojiRoles.forEach((value, key) => {
													msg.react(key)
													reactionRolesMessage.set(msg.id, emojiRoles)
												})
											})
									} else {
										console.log('entered loop')
										channel.send('Please send one of the emojis you want to use. End by saying end')
										channel.awaitMessages(msg => msg.author.id == user.id, { max: 1 })
											.then(react => {
												if (react.first().content.toLowerCase() == 'end') {
													end = true
													getReactions()
												} else {
													channel.send('Mention the role you want to add when reacting with this emoji')
													channel.awaitMessages(msg => msg.author.id == user.id && msg.mentions.roles.first(), { max: 1 })
														.then((mention) => {
															emojiRoles.set(react.first().content, mention.first().mentions.roles.first().id)
															getReactions()
														})
												}
											})
									}
								}
								getReactions()
							})
					} else {
						channel.send('Please mention a channel')
					}
				} else if(message.content.toLowerCase().startsWith(prefix + 'log')) {
					console.log(user.username + ' wanted to log the message: ' + message.content.slice(6))
				} else if (message.content.toLowerCase().startsWith(prefix + 'enlarge ')) {
					var msgArray = message.content.toLowerCase().split(' ')
					channel.send(new MessageEmbed().setImage(server.emojis.resolve(msgArray[1].slice(-19, -1)).url).setColor('RANDOM'))
				} else if (message.content.startsWith(prefix + 'poll ')) {
					var content = message.content.split(' ')
					content.shift()
					message.delete()
					if (content[0].toLowerCase() == 'thumbs') {
						channel.send(new MessageEmbed()
							.setColor('GREEN')
							.setTitle('Poll')
							.setFooter('Poll made by user ' + user.username)
							.setDescription(content.slice(1).join(' ')))
							.then(poll => {
								poll.react('👍')
								poll.react('👎')
							})
					} else if (content[0].toLowerCase() == 'numbers') {
						channel.send(new MessageEmbed()
							.setColor('GREEN')
							.setTitle('Poll')
							.setFooter('Poll made by user ' + user.username)
							.setDescription(content.slice(1).join(' ')))
							.then(poll => {
								poll.react('1️⃣')
								poll.react('2️⃣')
								poll.react('3️⃣')
								poll.react('4️⃣')
								poll.react('5️⃣')
								poll.react('6️⃣')
								poll.react('7️⃣')
								poll.react('8️⃣')
								poll.react('9️⃣')
								poll.react('🔟')
							})

					}

					console.log('poll created in #' + message.channel.name + ' by ' + message.author.username)
				} else if (message.content.toLowerCase().startsWith(prefix + 'setprefix') && (user.id == '373515998000840714' || user.id == '306582338039709696' || server.members.resolve(user.id).permissions.has('ADMINISTRATOR'))) {
					prefix = message.content.toLowerCase().split(' ')[1]
					readFile('./config.json', (err, res) => {
						if (err) process.stderr.write(err)
						var toWrite = res.toString().split('\n')
						toWrite[1] = `\t"prefix": "${prefix}"`
						writeFile('./config.json', toWrite.join('\n'), err => {
							if (err) process.stderr.write(err)
						})
					})
					message.reply(`Prefix changed. New prefix: ${prefix} This prefix will be resetted to ${prefix}on reboot.`)
					client.user.setActivity('Wings of Fire | Prefix: ' + prefix, { type: 'WATCHING' })
				} else if (message.content.toLowerCase().startsWith(prefix + 'rn ') || message.content.toLowerCase().startsWith(prefix + 'randomnumber ')) {
					const randomNumber = Math.floor((Math.random() * (new Number(message.content.split(' ')[2]) - new Number(message.content.split(' ')[1]))) + 1) + new Number(message.content.split(' ')[1])
					message.channel.send('Here is a pseudo-random number for you: ' + randomNumber)
				} else if (message.content.toLowerCase().startsWith(prefix + 'whois ')) {
					const whoisEmbed = new MessageEmbed()
						.setColor('RED')
						.setTitle('Who is ' + message.content.split(' ').slice(1).join(' ') + '?')
						.setDescription('Find this out!')
						.setURL('https://wingsoffire.fandom.com/wiki/' + message.content.split(' ').slice(1).join('_'))
						.setThumbnail('https://wingsoffire.fandom.com/wiki/' + message.content.split(' ').slice(1).join('_'))
						.setFooter('The link isn\'t correct? Double check the case and the orthograph. Or maybe this entry just don\'t exist...')
					message.reply(whoisEmbed)
					console.log(user.username + ' didn\'t know who ' + message.content.split(' ').slice(1).join(' ') + ' was, but now they do!')
				} else if (message.content.toLowerCase().startsWith(prefix + 'whatis ')) {
					const whoisEmbed = new MessageEmbed()
						.setColor('RED')
						.setTitle('What is the ' + message.content.split(' ').slice(1).join(' ') + '?')
						.setDescription('Find this out!')
						.setURL('https://wingsoffire.fandom.com/wiki/' + message.content.split(' ').slice(1).join('_'))
						.setThumbnail('https://wingsoffire.fandom.com/wiki/' + message.content.split(' ').slice(1).join('_'))
						.setFooter('The link isn\'t correct? Double check the case and the orthograph. Or maybe this entry just don\'t exist...')
					message.reply(whoisEmbed)
					console.log(user.username + ' didn\'t know what ' + message.content.split(' ').slice(1).join(' ') + ' were, but now they do!')
				} else if (message.content.toLowerCase().startsWith(prefix + 'updootlimit ') && server.members.resolve(user.id).hasPermission('ADMINISTRATOR')) {
					if (server.members.resolve(user.id).hasPermission('MANAGE_CHANNELS')) {
						if (new Number(message.content.split(' ')[1])) {
							readFile('./config.json', (err, res) => {
								if (err) process.stderr.write(err)
								var toWrite = res.toString().split('\n')
								toWrite[2] = `\t"upDootLimit": ${new Number(message.content.split(' ')[1])}`
								writeFile('./config.json', toWrite.join('\n'), err => {
									if (err) process.stderr.write(err)
								})
							})
						}
					}
				} else if (message.content.toLowerCase().startsWith(prefix + 'clearword ') && server.members.resolve(user.id).hasPermission('MANAGE_MESSAGES')) {
					if(server.members.resolve(user.id).permissions.has('MANAGE_MESSAGES')) {
						forbiddenWords.push(message.content.toLowerCase().slice(11))
						channel.send('That word has been generally set as forbidden.')
					}
					else {
						channel.send('You don\'t have permissions to do that! Requires manage messages permission.')
					}
					console.log(user.username + ' forbid a new word: ' + message.content.toLowerCase().slice(12))
				} else if (message.content.toLowerCase().startsWith(prefix + 'sumthemup')) {
					var messagesSent
					if (message.mentions.users.size == 0) {
						if (!totalMessages.has(user.id)) totalMessages.set(user.id, 0)
						if (!warns.get(user.id)) warns.set(user.id, [])
						messagesSent = Math.floor(totalMessages.get(user.id))
						const sumEmbed = new MessageEmbed()
							.setColor('BLUE')
							.setTitle('Total messages sent from ' + user.username + ':')
							.setDescription('The user sent ' + messagesSent + ' messages and got ' + warns.get(user.id).length + ' warns since the ' + ('0' + (server.members.resolve(user.id).joinedAt.getMonth() + 1)).slice(-2) + '/' + ('0' + server.members.resolve(user.id).joinedAt.getDate()).slice(-2) + '/' + server.members.resolve(user.id).joinedAt.getFullYear())
						channel.stopTyping()
						channel.send(sumEmbed)
						console.log(user.username + ' requested their number of messages sent')

					} else {
						if (!totalMessages.has(message.mentions.users.last().id)) totalMessages.set(message.mentions.users.last().id, 0)
						if (!warns.get(message.mentions.users.last().id)) warns.set(message.mentions.users.last().id, [])
						messagesSent = Math.floor(totalMessages.get(message.mentions.users.last().id))
						const sumEmbed = new MessageEmbed()
							.setColor('BLUE')
							.setTitle('Total messages sent from ' + message.mentions.users.first().username + ':')
							.setDescription('The user sent ' + messagesSent + ' messages and got ' + warns.get(message.mentions.users.last().id).length + ' warns since the ' + ('0' + (server.members.resolve(message.mentions.users.last().id).joinedAt.getMonth() + 1)).slice(-2) + '/' + ('0' + server.members.resolve(message.mentions.users.last().id).joinedAt.getDate()).slice(-2) + '/' + server.members.resolve(message.mentions.users.last().id).joinedAt.getFullYear())
						channel.stopTyping()
						channel.send(sumEmbed)
						console.log(user.username + ' requested the number of messages ' + message.mentions.users.first().username + ' sent')
					}
				} else if (message.content.toLowerCase().startsWith(prefix + 'oc ')) {
					var found = false
					server.channels.resolve('754470277634719845').messages.fetch({ limit: 100 })
						.then(oldMsg => {
							oldMsg.each(mess => {
								if (mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ') + '\n') || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ') + '\n') || mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ') + ' ') || (mess.content.toLowerCase().includes(`name:${message.content.toLowerCase().split(' ').slice(1).join(' ')} `)))) {
									message.reply('Oc found!')
									channel.send(mess.url)
									found = true
								}
							})
							if (!found) {
								server.channels.resolve('754470277634719845').messages.fetch({ limit: 100, before: oldMsg.last().id })
									.then(oldMsg2 => {
										oldMsg2.each(mess => {
											if (mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ') + '\n') || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ') + '\n') || mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ') + ' ') || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ') + ' ')))) {
												message.reply('Oc found!')
												channel.send(mess.url)
												found = true
											}
										})
										if (!found) {
											server.channels.resolve('754470277634719845').messages.fetch({ limit: 100, before: oldMsg2.last().id })
												.then(oldMsg3 => {
													oldMsg3.each(mess => {
														if (mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ') + '\n') || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ') + '\n') || mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ') + ' ') || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ') + ' ')))) {
															message.reply('Oc found!')
															channel.send(mess.url)
															found = true
														}
													})
													if (!found) {
														server.channels.resolve('754470277634719845').messages.fetch({ limit: 100, before: oldMsg3.last().id })
															.then(oldMsg4 => {
																oldMsg4.each(mess => {
																	if (mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ') + '\n') || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ') + '\n') || mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ') + ' ') || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ') + ' ')))) {
																		message.reply('Oc found!')
																		channel.send(mess.url)
																		found = true
																	}
																})
																if (!found) {
																	server.channels.resolve('754470277634719845').messages.fetch({ limit: 100, before: oldMsg2.last().id })
																		.then(oldMsg5 => {
																			oldMsg5.each(mess => {
																				if (mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ') + '\n') || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ') + '\n') || mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ') + ' ') || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ') + ' ')))) {
																					message.reply('Oc found!')
																					channel.send(mess.url)
																					found = true
																				}
																			})
																			if (!found) {
																				server.channels.resolve('754470277634719845').messages.fetch({ limit: 100, before: oldMsg2.last().id })
																					.then(oldMsg6 => {
																						oldMsg6.each(mess => {
																							if (mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ') + '\n') || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ') + '\n') || mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ') + ' ') || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ') + ' ')))) {
																								message.reply('Oc found!')
																								channel.send(mess.url)
																								found = true
																							}
																						})
																						if (!found) {
																							server.channels.resolve('754470277634719845').messages.fetch({ limit: 100, before: oldMsg2.last().id })
																								.then(oldMsg7 => {
																									oldMsg7.each(mess => {
																										if (mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ') + '\n') || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ') + '\n') || mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ') + ' ') || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ') + ' ')))) {
																											message.reply('Oc found!')
																											channel.send(mess.url)
																											found = true
																										}
																									})
																									if (!found) {
																										server.channels.resolve('754470277634719845').messages.fetch({ limit: 100, before: oldMsg2.last().id })
																											.then(oldMsg8 => {
																												oldMsg8.each(mess => {
																													if (mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ') + '\n') || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ') + '\n') || mess.content.toLowerCase().includes('name: ' + message.content.toLowerCase().split(' ').slice(1).join(' ') + ' ') || (mess.content.toLowerCase().includes('name:' + message.content.toLowerCase().split(' ').slice(1).join(' ') + ' ')))) {
																														message.reply('Oc found!')
																														channel.send(mess.url)
																														found = true
																													}
																												})
																												if (!found) {
																													message.reply('Oc not found. The submission is maybe too old, or you misstyped the name. Please check both of the possibilities. Please note that the submission has to include "name: <oc\'s name>.')
																												}
																											})
																									}
																								})
																						}
																					})
																			}
																		})
																}
															})
													}
												})
										}
									})
							}
						})
				} else if (message.content.toLowerCase().startsWith(prefix + 'setmessagecount ') && (server.members.resolve(user.id).hasPermission('MANAGE_MESSAGES') || server.members.resolve(user.id).roles.cache.has('795414220707463188'))) {
					if (message.mentions.members.size == 1 && message.content.split(' ').length == 3 && !isNaN(message.content.split(' ')[2])) {
						totalMessages.set(message.mentions.members.first().id, new Number(message.content.split(' ')[2]))
					} else {
						message.reply('Syntax incorrect. Please try again.')
					}
				} else if (message.content.toLowerCase().startsWith(prefix + 'reply ') && server.members.resolve(user.id).permissions.has('ADMINISTRATOR')) {
					if (!isNaN(message.content.split(' ')[1])) {
						channel.send(':thumbsup:')
						var reply = new MessageEmbed()
							.setColor('ORANGE')
							.setTitle('Response from r/wingsoffire Mod Team:')
							.setDescription(message.content.split(' ').slice(2).join(' '))
							.setFooter('This is a message directly from the r/wingsoffire mod team.')
						var userA = (client.users.resolve(messageMods[message.content.split(' ')[1]]))
						userA.createDM()
							.then((DMChannel) => {
								DMChannel.send(reply)
								console.log('the mods responded to ' + userA.username)
							})
					} else {
						message.reply('Syntax error. Please use the index of the message you want to answer to.')
					}
					/* } else if (message.content.toLowerCase().startsWith(prefix + 'verbalwarn ') && ((server.members.resolve(user.id).permissions.has('ADMINISTRATOR')) || (server.members.resolve(user.id).roles.cache.has('795847347397066773')))) {
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
				 	} */
				} else if (message.content.toLowerCase().startsWith(prefix + 'allowword ') && server.members.resolve(user.id).permissions.has('MANAGE_MESSAGES')) {
					forbiddenWords.splice(message.content.toLowerCase().slice(12) - 1, 1)
					channel.send('Allowed word. Current forbidden words: ')
					forbiddenWords.forEach((word) => {
						channel.send('[' + (forbiddenWords.indexOf(word) + 1) + ']: ' + word)
					})
				}
				break
			}


		} else {
			if(message.content.toLowerCase().startsWith(prefix + 'messagemods ')) {
				user.createDM()
					.then(DMchannel => {
						DMchannel.send(':thumbsup:')
					})
				var modsEmbed = new MessageEmbed()
					.setColor('ORANGE')
					.setTitle('New message from user:')
					.setAuthor(user.tag)
					.setDescription(message.content.slice(13))
					.setFooter(`This is an automated message. Please answer using ${prefix}reply ${messageMods.length} <message>`)
				client.channels.fetch('785612417379336263')
					.then(modChannel => {
						modChannel.send(modsEmbed)
					})
					.catch(() => {
						client.channels.fetch('647616102339313667')
							.then(officialModChannel => {
								officialModChannel.send(modsEmbed)
							})
					})
				messageMods.push(user.id)
				console.log('Somebody messaged the mods')
			}

			if (message.content.toLowerCase().startsWith(prefix + 'getfile') && (user.id == '373515998000840714' || user.id == '306582338039709696')) {
				user.createDM()
					.then((DMchannel) => {
						DMchannel.send({
							files: [{
								attachment: 'bot.js',
								name: 'bot.js'
							}]
						})
					})
				console.log(user.username + ' fetched the file. Have fun!')
			}
		}
	}
})

client.on('interactionCreate', async interaction => {
	if(!interaction.isCommand()) return

	switch(interaction.commandName) {
	case 'kill':
		if (interaction.member.roles.resolve('795414220707463188')) {
			await interaction.reply('Alright, the bot is logging out...')
				.catch((e) => {
					console.error('tf is going on? an error occured... check that out:\n' + e)
				})
				.then(() => {
					var killer = interaction.user.username
					console.warn('The bot got killed by ' + killer)
					client.destroy()
					exit()
				})
		} else {
			await interaction.reply({ 'content': 'You don\'t have permission to do that!', 'ephemeral': true })
		}
		break

	case 'ping':
		var ping = new Date(Date.now()) - interaction.createdAt
		var color
		if(ping >= 0) {
			if(ping <= 500) color = 'GREEN'
			if(ping <= 1000 && ping > 500) color = 'YELLOW'
			if(ping <= 1500 && ping > 1000) color = 'ORANGE'
			if(ping <= 2000 && ping > 1500) color = 'RED'
			if(ping > 2000) color = 'PURPLE'
			const PingEmbed = new MessageEmbed()
				.setColor(color)
				.setTitle('Pong! :ping_pong:')
				.setDescription(ping + 'ms')
			await interaction.reply({ 'embeds': [PingEmbed] })
		} else {
			const PingEmbed = new MessageEmbed()
				.setColor('RANDOM')
				.setTitle('Pong? :ping_pong:')
				.setDescription(`Emmm it is negative? ${ping} ms...`)
			await interaction.reply({ 'embeds': [PingEmbed] })
		}
		console.log(interaction.user.username + ' used ping')
		break

	case 'snek':
		await interaction.reply({
			files: [{
				attachment: 'https://cdn.discordapp.com/attachments/647616102339313667/795971177754525706/snek.jpg',
				name: 'snek.jpg'
			}]
		})
		console.log(interaction.user.username + ' used snek')
		break

	case 'stalk':
		var stalked = interaction.options.getUser('user')
		await interaction.reply({ 'content': `You are now stalking ${stalked.username}. You will be notified when they log on.`, 'ephemeral': true })
		stalking.push(interaction.user.id, stalked.id)
		break

	case 'oc':
		var ocArr = []
		var oc = ''
		interaction.options.getString('name').split(' ').forEach((namePart, i) => {
			ocArr[i] = toFirstUppercase(namePart)
		})
		oc = ocArr.join(' ')
			
		if(ocs.has(oc))	{
			if(ocs.has(oc))	{
				switch(ocs.get(`${ocs}.tribes[0]`)) {
				case 'skywing':
					color = 'RED'
					break

				case 'seawing':
					color = 'NAVY'
					break

				case 'sandwing':
					color = 'GOLD'
					break
							
				case 'nightwing':
					color = 'DARK_PURPLE'
					break
							
				case 'icewing':
					color = [221, 255, 255]
					break
							
				case 'mudwing':
					color = [112, 84, 62]
					break
							
				case 'rainwing':
					color = 'RANDOM'
					break
							
				case 'hivewing':
					color = 'DEFAULT'
					break
							
				case 'silkwing':
					color = 'RANDOM'
					break
							
				case 'leafwing':
					color = [48, 183, 0]
					break
							
				}
				try {
					let embed = new MessageEmbed()
						.setTitle(oc)
						.setColor(color)
						.setAuthor(ocs.get(`${oc}.owner`) | 'unavailable')
						.setURL(ocs.get(`${oc}.message.URL`) | 'https://discord.com/channels/716601325269549127/854858811101937704')
						.setImage(ocs.get(`${oc}.image`) | 'https://nelowvision.com/wp-content/uploads/2018/11/Picture-Unavailable.jpg')
						.setFooter('This sheet might not be 100% accurate. If there is an error, please immediately report it to <@373515998000840714>')
						.addField('Tribe(s)', ocs.get(`${oc}.tribes`).join(' / ') | 'unavailable', true)
						.addField('Age', ocs.get(`${oc}.age`) | 'unavailable', true)
						.addField('Gender', ocs.get(`${oc}.gender`) | 'unavailable', true)
					await interaction.reply({ 'embeds': [embed], 'ephemeral': false})
				} catch (e) {
					console.log(ocs.get(`${oc}.owner`),
					ocs.get(`${oc}.message.URL`),
					ocs.get(`${oc}.image`),
					ocs.get(`${oc}.tribes`).join(' / '),
					ocs.get(`${oc}.age`),
					ocs.get(`${oc}.gender`))
					console.warn(e)
					ocs.delete(oc)
				}
			} else {
				await interaction.reply('This oc is invalid. Please try again.')
			}
		}	
		break

	case 'editoc':
		var name = interaction.options.getString('name')
		var nameArr = name.split(';')[0]
			.split(',')[0]
			.split('|')[0]
			.split(' or ')[0]
			.split('(')[0]
			.split('*').join('')
			.split('-').join(' ')
			.split('  ').join(' ')
			.split(' ')
		if(nameArr[0] == '') nameArr.shift()
		if(nameArr[nameArr.length - 1] == '') nameArr.pop()
		nameArr = nameArr.join(' ').split(' ')
		nameArr.forEach((namePart, i) => {
			if(namePart != '') nameArr[i] = toFirstUppercase(namePart)
		})
		name = nameArr.join(' ')
		var key = interaction.options.getString('key')
		var	value = interaction.options.getString('value')

		if(key === 'deltribe') {
			if(ocs.has(name)) {
				if (ocs.get(name + '.owner') != interaction.user.username || ocs.get(name + '.owner') != undefined) {
					interaction.reply('You do not have the premissions to edit that oc!')
					return
				}
				if(ocs.get(`${name}.tribes`).includes(value.toLowerCase())) {
					array = ocs.get(`${name}.tribes`)
					array.splice(array.indexOf(value), 1)
					ocs.set(name + '.tribes', array)
					interaction.reply("The tribe was successfully removed!")
				} else {
					await interaction.reply(`The oc you specified does not have the ${value} tribe!`)
				}
			} else {
				await interaction.reply('The oc you specified is not in the database!')
			}
		} else {
			if(ocs.has(name)) {
				if (ocs.get(name + '.owner') != interaction.user.username && ocs.get(name + '.owner') != undefined && !interaction.member.roles.cache.has('795414220707463188') && !interaction.member.roles.cache.has('762526998274113548')) {
					interaction.reply('You do not have the premissions to edit that oc!')
					console.log(interaction.user.username);
					return
				}
				if(key === 'tribes') {
					var tribe = "";
					if (tribe.toLowerCase().includes('mud')) {
						tribe = 'mudwing'
					} else if (tribe.toLowerCase().includes('sand')) {
						tribe = 'sandwing'
					} else if (tribe.toLowerCase().includes('night')) {
						tribe = 'nightwing'
					} else if (tribe.toLowerCase().includes('sea')) {
						tribe = 'seawing'
					} else if (tribe.toLowerCase().includes('sky')) {
						tribe = 'skywing'
					} else if (tribe.toLowerCase().includes('rain')) {
						tribe = 'rainwing'
					} else if (tribe.toLowerCase().includes('ice')) {
						tribe = 'icewing'
					} else if (tribe.toLowerCase().includes('leaf')) {
						tribe = 'leafwing'
					} else if (tribe.toLowerCase().includes('hive')) {
						tribe = 'hivewing'
					} else if (tribe.toLowerCase().includes('silk')) {
						tribe = 'silkwing'
					} else {
						interaction.reply("The tribe is invalid!")
					}
					if(ocs.get(name + '.tribes').includes(tribe)) {
						interaction.reply("The oc already has this tribe!")
					}
				} else if (key === 'owner') {
					ocs.set(`${name}.owner`, client.users.resolve(value.slice(3, -1)).username)
					interaction.reply("The oc was successfully edited!")
				} else if(key === 'age') {
					if(!isNaN(value)) {
						ocs.set(name + '.' + key, new Number(value))
						interaction.reply("The oc was successfully edited!")
					}
					else interaction.reply("Please insert a number")
				} else {
					ocs.set(name + '.' + key, value)
					interaction.reply("The oc was successfully edited!")
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
					)
				let reply = await interaction.reply({ content: 'This oc is not in the database! Do you want to create one?', components: [buttons], fetchReply: true})
				reply.awaitMessageComponent({componentType: 'BUTTON', time: 15000, filter: interact => interact.user.id === interaction.user.id}).then(interactionB => {
					if(interactionB.customId === 'yes') {
						if(key === 'tribes') {
							if (tribe.toLowerCase().includes('mud')) {
								ocs.push(name + '.tribes', 'mudwing')
								interactionB.update("The oc was successfully added!")
							} else if (tribe.toLowerCase().includes('sand')) {
								ocs.push(name + '.tribes', 'sandwing')
								interactionB.update("The oc was successfully added!")
							} else if (tribe.toLowerCase().includes('night')) {
								ocs.push(name + '.tribes', 'nightwing')
								interactionB.update("The oc was successfully added!")
							} else if (tribe.toLowerCase().includes('sea')) {
								ocs.push(name + '.tribes', 'seawing')
								interactionB.update("The oc was successfully added!")
							} else if (tribe.toLowerCase().includes('sky')) {
								ocs.push(name + '.tribes', 'skywing')
								interactionB.update("The oc was successfully added!")
							} else if (tribe.toLowerCase().includes('rain')) {
								ocs.push(name + '.tribes', 'rainwing')
								interactionB.update("The oc was successfully added!")
							} else if (tribe.toLowerCase().includes('ice')) {
								ocs.push(name + '.tribes', 'icewing')
								interactionB.update("The oc was successfully added!")
							} else if (tribe.toLowerCase().includes('leaf')) {
								ocs.push(name + '.tribes', 'leafwing')
								interactionB.update("The oc was successfully added!")
							} else if (tribe.toLowerCase().includes('hive')) {
								ocs.push(name + '.tribes', 'hivewing')
								interactionB.update("The oc was successfully added!")
							} else if (tribe.toLowerCase().includes('silk')) {
								ocs.push(name + '.tribes', 'silkwing')
								interactionB.update("The oc was successfully added!")
							} else {
								interactionB.update("The tribe is invalid!")
							}
						} else if(key === 'age') {
							if(!isNaN(value)) {
								ocs.set(name + '.age', new Number(value))
								interactionB.update("The oc was successfully added!")
							}
							else interaction.reply("Please insert a number")
						} else if (key === 'owner') {
							ocs.set(name + '.owner', client.users.resolve(value.slice(3, -1)).username)
							interactionB.update("The oc was successfully added!")
						} else if(key === 'message') {
							ocs.set(name + '.message.URL', value)
							ocs.set(name + '.message.Snowflake', value.split('/')[value.split('/').length - 1])
						} else {
							ocs.set(name + '.' + key, value)
							interactionB.update("The oc was successfully added!")
						}
					} else {
						interactionB.update("Alright, aborting...")
					}
				})
				
			}
		}
		break;

	case 'quote':
		if (!quoteBusy) {
			quoteBusy = true
			//readFile('./quotes.json', (err, result) => {
				const { quotes } = require('./quotes.json')
				//if (err) console.error(err)
				const theChoosenOne = quotes[Math.floor((Math.random() * quotes.length) + 1) - 1]
				//var hahYouLose = []
				const quoteEmbed = new MessageEmbed()
					.setTitle('Who said this?')
					.setDescription(theChoosenOne.quote)
					.setFooter('You have 20 seconds, and only one try')
					.setColor('GREEN')
				interaction.reply({embeds: [quoteEmbed]})
				var stopIt = false
				let timeOut = setTimeout(() => {
					stopIt = true
					interaction.editReply({content: 'This quizz is finished.', embeds: []})
					interaction.channel.send({content: 'The quizz is finished. The answer was ' + theChoosenOne.character, embeds: []})
					quoteBusy = false
				}, 20000)
				var answers = []
				quotes.forEach(quote => {
					answers.push(quote.character.toLowerCase())
				})
				const filter = quizzAnswer => quizzAnswer.author.id != client.user.id && answers.includes(quizzAnswer.content.toLowerCase())
				function guess() {
					interaction.channel.awaitMessages({filter,  max: 1 }).then(quizzAnswer => {
						if(stopIt) {
							return;
						}
						//if (!hahYouLose.includes(quizzAnswer.first()?.author.id)) {
							if (quizzAnswer.first().content.toLowerCase() == theChoosenOne.character.toLowerCase()) {
								quizzAnswer.first().reply('Congratulation! This is correct!')
								clearTimeout(timeOut)
								quoteBusy = false
								stopIt = true
							} else {
								quizzAnswer.first().reply('Well... no, this is wrong.')
								guess()
								//hahYouLose.push(quizzAnswer.first().author.id)
							}
						//}
					})
				}
				guess()
			//})
		}
		break;
	
	case 'sunny':
		const { quotes } = require('./quotes.json')
		const sunnyQuotes = quotes.filter(quote => quote.character == 'Sunny')
		interaction.reply({embeds: [new MessageEmbed()
			.setDescription('"' + sunnyQuotes[randInt(0, sunnyQuotes.length)].quote + '"')
			.setFooter('-Sunny')
			.setColor('GOLD')]
		})
		break

	case 'fuck' :
		interaction.reply('fuck')
		break
		
	}
})

client.login(token)
