const Discord = require('discord.js');
const Database = require("@replit/database")
const db = new Database()
const bot = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] })

module.exports = {
    Discord: Discord, 
    bot: bot,
		db: db,
    
    name: 'Make-A-Mand',
    TOKEN: process.env.TOKEN,
    prefix: `m-`
}
