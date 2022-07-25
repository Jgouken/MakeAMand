const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
	name: 'prefix',
	aliases: ['pre', 'p'],
	description: `Change the prefix of the server for this bot.`,
	minidesc: `Change the prefix of the server.`,
	permissions: ["MANAGE_GUILD"],

	async execute(message, member, args, cmds, config, bot) {
		if (args[0]) {
			const d = new Date().getMilliseconds();

			var row = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId(`yes_${d})`)
						.setLabel('Yes!')
						.setEmoji('👍')
						.setStyle('SUCCESS'),
					new MessageButton()
						.setCustomId(`no_${d})`)
						.setLabel('No!')
						.setEmoji('👎')
						.setStyle('DANGER'))

			message.reply({
				embeds: [
					embed = {
						color: `0xFF0000`,
						title: `Are you sure?`,
						description: `Are you sure you want to change the server's prefix for this bot to **${args[0]}**?`,
					}
				],
				allowedMentions: {
					repliedUser: false
				},
				components: [row]
			}).then((m) => {
				const filter = i => i.customId.includes(d) && i.user.id === message.author.id
				const collector = message.channel.createMessageComponentCollector({ filter, time: 30000, max: 1 });

				collector.on('collect', async i => {
					i.deferUpdate()
					if (i.customId.startsWith('yes')) {
						var prefix1 = await config.db.get(`prefix_${message.guild.id}`)
						await config.db.set(`prefix_${message.guild.id}`, args[0])
						var prefix = await config.db.get(`prefix_${message.guild.id}`).catch(() => {
							config.db.set(`prefix_${message.guild.id}`, 'm-')
							message.reply({
								embeds: [
									embed = {
										color: `0xFF0000`,
										title: `Somethin' Funky Happened...`,
										description: `I can't make that the prefix for the server for one of the following reasons:\n\n• Improper Format\n• Invalid Characters\n• Spam Protection\n• Blocked Words/Phrases\n\n**If this continues, please contact support.**`,
									}
								],
							})
						})
						if (!prefix) return;
						m.edit({
							embeds: [
								embed = {
									color: `0x00FF00`,
									title: `Prefix Changed`,
									description: `The server prefix for this bot has been changed to **${args[0]}**`,
								}
							],
						})
					} else if (i.customId.startsWith('no')) {
						m.edit({
							embeds: [
								embed = {
									color: `0x00FF00`,
									title: `Cancelled`,
									description: `The server prefix has not been changed!`,
								}
							],
						})
					}

					row.components.forEach(button => {
						if (button !== i) button.setStyle('SECONDARY').setDisabled()
						if (button.customId == i.customId) button.setStyle('SUCCESS')
					})
					m.edit({ components: [row] })
				})

				collector.on('end', collected => {
					if (collected.size == 0) row.components.forEach(button => {
						button.setStyle('SECONDARY').setDisabled()
					})
					m.edit({ components: [row] })
				})
			})

		} else {
			const d = new Date().getMilliseconds();

			var row = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId(`cancel_${d})`)
						.setLabel('Cancel')
						.setEmoji('❌')
						.setStyle('SUCCESS'));
			var rev = ''
			if (await config.db.get(`prefix_${message.guild.id}`) !== null && await config.db.get(`prefix_${message.guild.id}`) !== 'm-') {
				row.addComponents(new MessageButton()
					.setCustomId(`rev_${d})`)
					.setLabel('Revert')
					.setEmoji('🗑️')
					.setStyle('DANGER'))
				rev = ' Press Revert to go back to the prefix **m-**'
			}

			message.reply({
				embeds: [
					embed = {
						color: `0x00FF00`,
						title: `What would you like the prefix to be?`,
						description: `The current prefix is **${await config.db.get(`prefix_${message.guild.id}`) || 'm-'}**\n\nIn the chat, type the new prefix to set!${rev}`,
					}
				],
				allowedMentions: {
					repliedUser: false
				},
				components: [row]
			}).then((me) => {
				const filter = i => i.customId.includes(d) && i.user.id === message.author.id
				const mfilter = mf => mf.author.id === message.author.id
				const collector = message.channel.createMessageComponentCollector({ filter, time: 30000, max: 1 });
				const mcollector = message.channel.createMessageCollector({ mfilter, time: 30000, max: 1 });

				mcollector.on('collect', async m => {
					collector.stop()
					await config.db.set(`prefix_${message.guild.id}`, m.content.trim().split(/ +/)[0])
					me.edit({
						embeds: [
							embed = {
								color: `0x00FF00`,
								title: `Prefix Changed`,
								description: `The server prefix for this bot has been changed to **${m.content.trim().split(/ +/)[0]}**`,
							}
						],
					})

				})

				collector.on('collect', async i => {
					i.deferUpdate()
					mcollector.stop()
					if (i.customId.startsWith('cancel')) {
						me.edit({
							embeds: [
								embed = {
									color: `0x00FF00`,
									title: `Cancelled`,
									description: `The server prefix has not been changed!`,
								}
							],
						})
					} else {
						await config.db.set(`prefix_${message.guild.id}`, 'm-')

						me.edit({
							embeds: [
								embed = {
									color: `0x00FF00`,
									title: `Prefix Changed`,
									description: `The server prefix for this bot has been changed to **m-**`,
								}
							],
						})

					}

					row.components.forEach(button => {
						if (button !== i) button.setStyle('SECONDARY').setDisabled()
						if (button.customId == i.customId) button.setStyle('SUCCESS')
					})
					me.edit({ components: [row] })
				})

				collector.on('end', collected => {
					if (collected.size == 0) row.components.forEach(button => {
						button.setStyle('SECONDARY').setDisabled()
					})
					me.edit({ components: [row] })
				})
			})
		}
	}
}