const { MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');

module.exports = {
	name: `start`,
	aliases: [`help`, `commands`, `command`, `h`],
	description: `Access the 'home' interface that allows you to use this bot without commands!`,
	minidesc: `Access the starting interface.`,

	async execute(message, member, args, cmds, config, bot) {
		let greetings = [
			'Hey',
			`What's shakin'`,
			'How is your day',
			'Greetings & Salutations',
			'Aloha',
			'Hope you slept well',
			`"${message.author.username}"...what a fun name you have`,
			`There's like 20 of these greetings`,
			`This will always end with: `,
			`Let's play a game`,
			`I'm here to help`,
			`I wonder what you're gonna do`,
			`I wasn't asleep`,
			`Hello`,
			`Let's get started`,
			`You're beautiful`,
			`Good day to you`,
			`Oh, I didn't see you there`,
			`${Number(message.author.tag.slice(message.author.username.length + 1)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} is one of my favorite numbers`
		]

		let expla = [
			`Take a look around, admire the scenery!`,
			`Care to shop around my wares?`,
			`Avast! I don't know how to speak pirate :(`,
			`*insert meme here*`,
			`Don't you love characteristic randomization? Or are you just confused?`,
			`It's dangerous to go alone! Take this.`,
			`All your base are belong to us.`,
			`Can I comment on other popular Discord bots like \`You7\`?`,
			`Whilst other bots require 'args' for commands, this bot makes those completely optional. This is to influence your own laziness.`,
			`Coding is just banging your head against the wall *as a job.*`,
			`Can you tell that I enjoy using buttons and menus?`,
			`How was your rest? Are you doing well?`,
			`I'm in like ${bot.guilds.cache.size} servers with like ${bot.users.cache.size} people.`,
			`*hair flip*`,
			`Are you tired of me yet?`,
			`Random title, color, and description? This is getting out of hand!`
		]

		const d = new Date().getMilliseconds();
		var row = undefined
		function manageGuild() {
			row = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId(`run_${d}`)
						.setLabel('Run Command')
						.setEmoji('⚡')
						.setStyle('SUCCESS')
						.setDisabled(false),
					new MessageButton()
						.setCustomId(`help_${d}`)
						.setLabel('Help')
						.setEmoji('❔')
						.setStyle('PRIMARY')
						.setDisabled(false));
		}

		manageGuild()
		let fields = []
		var edit = false

		await bot.commands.forEach(async (command) => {
			if (command.name == 'start') return
			await fields.push({
				name: `\`${await config.db.get(`prefix_${message.guild.id}`) || 'm-'}${command.name}\``,
				value: command.minidesc || "Not Described",
				inline: true
			})
		})

		message.reply({
			embeds: [
				{
					title: `${greetings[Math.floor(Math.random() * greetings.length)]}, ${member.nickname || message.author.username}!`,
					description: expla[Math.floor(Math.random() * expla.length)],
					color: `#${Math.floor(Math.random() * 0xFFFFF).toString(16).padStart(6, 0).toUpperCase()}`,
					fields: fields,
					footer: {
						text: `The current server prefix is ${await config.db.get(`prefix_${message.guild.id}`) || 'm-'}`
					}
				}
			],
			allowedMentions: {
				repliedUser: false
			},
			components: [row]
		}).then(async (m) => {
			async function start() {
				manageGuild()

				if (edit) m.edit({
					embeds: [
						{
							title: `${greetings[Math.floor(Math.random() * greetings.length)]}, ${member.nickname || message.author.username}!`,
							description: expla[Math.floor(Math.random() * expla.length)],
							fields: fields,
							footer: {
								text: `The current server prefix is ${await config.db.get(`prefix_${message.guild.id}`) || 'm-'}\nPlease ignore the interaction error message.`
							}
						}
					],
					allowedMentions: {
						repliedUser: false
					},
					components: [row]
				})

				const filter = i => i.customId.includes(d) && i.user.id === message.author.id
				const collector = message.channel.createMessageComponentCollector({ filter, time: 60000, max: 1 });

				collector.on('collect', async i => {
					i.deferUpdate()
					var row2 = new MessageActionRow()
						.addComponents(
							msm = new MessageSelectMenu()
								.setCustomId(`select_${d}`)
								.setPlaceholder('Nothing Selected')
								.addOptions([
									{
										label: '⬅ Back',
										description: 'Go back to the starting interface.',
										value: `start_${d}`,
									},
								])
						);
					let list = []

					bot.commands.forEach(async (command) => {
						if (list.includes(command.name)) return;
						if (command.name == 'start') return;
						list.push(command.name.toLowerCase())
						await msm.addOptions([{
							label: command.name.charAt(0).toUpperCase() + command.name.slice(1),
							description: command.minidesc || "Not Described",
							value: `${command.name.toLowerCase()}`
						}])
					})
					if (i.customId.startsWith('run')) {
						m.edit({
							embeds: [
								{
									title: "Run Command",
									description: `From here, ya got some options! Using the select menu, run either a custom or premade command. Please ignore the interaction error message.`,
									fields: fields
								}
							],
						})
							.then(() => {
								m.edit({ components: [row2] })
								const minifilter = i => i.customId.includes(d) && i.user.id === message.author.id
								const minicollector = message.channel.createMessageComponentCollector({ minifilter, time: 60000, max: 1 });

								minicollector.on('collect', async i => {
									if (i.values[0].startsWith('start')) {
										edit = true
										start()
										return;
									}
									m.edit({ embeds: [{ title: `Running Command: ${await config.db.get(`prefix_${message.guild.id}`) || 'm-'}${i.values[0]}` }], components: [] })
									setTimeout(() => { m.delete() }, 5000)
									await bot.commands.get(i.values[0]).execute(message, member, args, cmds, config, bot)
								})
							})
						return;
					} else if (i.customId.startsWith('help')) {
						var helpRow = new MessageActionRow()
							.addComponents(
								new MessageButton()
									.setCustomId(`back_${d}`)
									.setLabel('Back')
									.setEmoji('⬅')
									.setStyle('PRIMARY')
									.setDisabled(false),
								new MessageButton()
									.setCustomId(`about_${d}`)
									.setLabel('About')
									.setEmoji('📙')
									.setStyle('SECONDARY')
									.setDisabled(false),
								new MessageButton()
									.setCustomId(`res_${d}`)
									.setLabel('Reset Prefix')
									.setEmoji('🗑')
									.setStyle('DANGER')
									.setDisabled(false),
								new MessageButton()
									.setURL(`https://discord.gg/j8VxsFX576`)
									.setLabel('Support')
									.setEmoji('❔')
									.setStyle('LINK'));

						m.edit({
							embeds: [
								{
									color: `0x00FF00`,
									title: `Help`,
									description: `Hey, ${member.nickname || message.author.username}! A little confuzzled? Sorry about that, I'm here to help!`,
									footer: {
										text: `Press any button to assist you with more capabilities!`
									}
								}
							],
							components: [helpRow]
						})

						const minifilter = i => i.customId.includes(d) && i.user.id === message.author.id
						const minicollector = message.channel.createMessageComponentCollector({ minifilter, time: 30000, max: 1 });

						minicollector.on('collect', async i => {
							if (i.customId.startsWith('back')) {
								edit = true
								start()
								return;
							} else if (i.customId.startsWith('about')) {
								var backb = new MessageActionRow()
									.addComponents(
										new MessageButton()
											.setCustomId(`back_${d}`)
											.setLabel('Back')
											.setEmoji('⬅')
											.setStyle('PRIMARY')
											.setDisabled(false));

								m.edit({
									embeds: [
										{
											title: `About Me`,
											description: `My name is M-A-M, a bot that helps anyone create custom commands easily in their server.`,
											fields: [
												{
													name: `Created By:`,
													value: `Jgouken#4861`,
													inline: true
												},
												{
													name: `Primary Goal`,
													value: `This has mostly formed into a command-testing bot.`,
													inline: true
												},
												{
													name: `Why?`,
													value: `Jgouken has a lot of freetime, so he might as well put it to something useful, such as programming.`,
													inline: true
												},
												{
													name: `When`,
													value: `Created: ${bot.user.createdAt.toLocaleString().replace(`,`, ` at`)}`
												}
											]
										}
									],
									components: [backb]
								}).then(() => {
									const miniminifilter = i => i.customId.includes(d) && i.user.id === message.author.id
									const miniminicollector = message.channel.createMessageComponentCollector({ miniminifilter, time: 30000, max: 1 });

									miniminicollector.on(`collect`, async i => {
										if (i.customId.startsWith(`back`)) {
											edit = true
											start()
										}
									})

									miniminicollector.on('end', collected => {
										if (collected.size == 0) {
											backb.components.forEach(button => {
												button.setStyle('SECONDARY').setDisabled()
											})
											m.edit({ components: [backb] })
										}
									})
								})
								return;
							}

							config.db.delete(`prefix_${message.guild.id}`)
							m.edit({ embeds: [{ title: `Reset Prefix to: **m-**` }], components: [] })
							setTimeout(() => { edit = true; start(); return; }, 3000)
						})

						minicollector.on('end', collected => {
							if (collected.size == 0) {
								helpRow.components.forEach(button => {
									if (!button.customId) return;
									button.setStyle('SECONDARY').setDisabled()
								})
								m.edit({ components: [helpRow] })
							}
						})

						return;
					}
					/*
					row.components.forEach(button => {
						if (button !== i) button.setStyle('SECONDARY').setDisabled()
						if (button.customId == i.customId) button.setStyle('SUCCESS')
					})
					*/
					m.edit({ components: [row] })
				});

				collector.on('end', collected => {
					if (collected.size == 0) {
						row.components.forEach(button => {
							button.setStyle('SECONDARY').setDisabled()
						})
						m.edit({ components: [row] })
					}
				})

			}
			await start()
		})
	}
}