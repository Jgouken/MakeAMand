const Discord = require('discord.js');
const Database = require("@replit/database")
const db = new Database()
const bot = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] })

module.exports = {
    Discord: Discord, 
    bot: bot,
		db: db,
    
    name: 'Make-A-Mand',
    TOKEN: `OTMyMzk0NDI4NDUzMjMyNzUx.YeSV-g.k9bSc2kacuS8OMAwKM3Kol89vNk`,
    prefix: `m-`
}