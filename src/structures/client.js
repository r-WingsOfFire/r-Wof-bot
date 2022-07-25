const Discord = require("discord.js");
const Discordx = require("discordx");

class Client extends Discordx.Client {
  commands = new Discord.Collection();
  quoteBusy = false;
}

module.exports = Client;
