const Discord = require('discord.js');

module.exports = {
	name: 'ignore',
	description: 'Set text channels that will be ignored by the bot.',
	args: false,
	usage: '%prefixignore <channel mentions>',
	async execute(message, args, client, prefix) {

		const result = await client.schemas.get('guild').findOne({
			_id: message.guild.id,
		})

		const ignoredChannels = result.ignoredChannels || new Array()

		if (message.mentions.channels.size > 0) {

			message.mentions.channels.forEach(channel => {

				if (channel.guild === message.guild) {

					const index = ignoredChannels.indexOf(channel.id)

					if (index > -1) {
						ignoredChannels.splice(index, 1)
					}
					else {
						ignoredChannels.push(channel.id)
					}
				}
			})

			await client.schemas.get('guild').findOneAndUpdate({
				_id: message.guild.id,
			}, {
				_id: message.guild.id,
				ignoredChannels: ignoredChannels,
			}, {
				upsert: true,
			})
		}

		let deletedChange = false

		ignoredChannels.forEach(channel => {

			if (!client.channels.cache.find(s => s.id === channel)) {

				const index = ignoredChannels.indexOf(channel)

				if (index > -1) {
					ignoredChannels.splice(index, 1)
					deletedChange = true
				}
			}
		})

		if (deletedChange === true) {

			await client.schemas.get('guild').findOneAndUpdate({
				_id: message.guild.id,
			}, {
				_id: message.guild.id,
				ignoredChannels: ignoredChannels,
			}, {
				upsert: true,
			})
		}

		const Embed = new Discord.MessageEmbed()
			.setTitle('Ignored Channels')
			.setDescription('• <#' + ignoredChannels.join('>\n• <#') + '>')
			.setFooter(`Add and remove ignored channels using ${prefix}ignore <mention channels>`)
			.setAuthor(client.user.username, client.user.displayAvatarURL({ dynamic: true }))

		try {
			await message.channel.send(Embed)
		}
		catch (e) {
			return message.author.send(`I could not send a response into <#${message.channel.id}>. Please make sure I have the permissions to send messages.`)
		}

	},
};