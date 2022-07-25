const config = require('./config/config')
const { bot, Discord } = require('./config/config')
const fs = require('fs')
bot.commands = new Discord.Collection();
bot.aliases = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

let cmds = [];
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	bot.commands.set(command.name, command);
	cmds.push(command.name)
	command.aliases.forEach(alias => {
		bot.aliases.set(alias, command)
		cmds.push(alias)
	})
}

bot.on('ready', async () => {
	await config.db.delete(`test`)
	console.log(`\n\n${config.name} IS ONLINE!\n\n`);
	let types = ['LISTENING', 'WATCHING', 'PLAYING', 'STREAMING', 'COMPETING'];
	bot.user.setActivity(`m-${cmds[Math.floor(Math.random() * cmds.length)]}`, {
		type: types[Math.floor(Math.random() * types.length)],
	})

	setInterval(async () => {
		bot.user.setActivity(`m-${cmds[Math.floor(Math.random() * cmds.length)]}`, {
			type: types[Math.floor(Math.random() * types.length)],
		})
	}, 10000)

	bot.on('messageCreate', async message => {
		if (message.author.bot) return;
		if (message.channel.type == 'dm') return;
		if (!(message.guild.me).permissions.has("SEND_MESSAGES")) return;
		var prefix = await config.db.get(`prefix_${message.guild.id}`)
		if (!prefix) var commandArgs = message.content.slice(config.prefix.length).trim().split(/ +/);
		else var commandArgs = await message.content.slice(prefix.length).trim().split(/ +/)

		const member = await message.guild.members.fetch(message.author)
		const command = commandArgs.shift().toLowerCase()
		const called = bot.commands.get(command)

		if (message.content == '<@!932394428453232751>' || message.content == '<@932394428453232751>') return bot.commands.get('start').execute(message, member, commandArgs, bot.commands, config, bot)

		if (!prefix) {
			if (!message.content.toLocaleLowerCase().startsWith(config.prefix.toLocaleLowerCase())) return
		} else if (!message.content.toLocaleLowerCase().startsWith(prefix)) return;

		if (called) called.execute(message, member, commandArgs, bot.commands, config, bot)
		else if (bot.aliases.get(command)) bot.aliases.get(command).execute(message, member, commandArgs, bot.commands, config, bot)
	})
})

bot.login(config.TOKEN)
