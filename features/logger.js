const Discord = require('discord.js')

module.exports = client => {

	client.on('channelCreate', async channel => {

		if (channel.type === 'dm') return

		const { logs, logsChannelId } = await client.schemas.get('guild').findOne({ _id: channel.guild.id })

		const logsChannel = channel.guild.channels.cache.find(c => c.id === logsChannelId)

		if (!logs || !logs.get('channelCreate') || !logsChannel) return

		const Embed = new Discord.MessageEmbed()
			.setTitle('Channel Created')
			.setColor('#00FF48')
			.addField('Name', channel.name, true)
			.addField('Type', channel.type, true)
			.addField('ID', `\`\`\`js\nCHANNEL = ${channel.id}\`\`\``)
			.setFooter(client.user.username, client.user.displayAvatarURL())
			.setTimestamp(Date.now())

		const fetchedLog = (await channel.guild.fetchAuditLogs({ limit: 1, type: 'CHANNEL_CREATE' })).entries.first()

		if (fetchedLog && fetchedLog.target === channel) {
			Embed.setAuthor(fetchedLog.executor.tag, fetchedLog.executor.displayAvatarURL())
		}

		logsChannel.send(Embed)

	})

	client.on('channelDelete', async channel => {

		if (channel.type === 'dm') return

		const { logs, logsChannelId } = await client.schemas.get('guild').findOne({ _id: channel.guild.id })

		const logsChannel = channel.guild.channels.cache.find(c => c.id === logsChannelId)

		if (!logs || !logs.get('channelDelete') || !logsChannel) return

		const Embed = new Discord.MessageEmbed()
			.setTitle('Channel Deleted')
			.setColor('RED')
			.addField('Name', channel.name, true)
			.addField('Type', channel.type, true)
			.addField('ID', `\`\`\`js\nCHANNEL = ${channel.id}\`\`\``)
			.setFooter(client.user.username, client.user.displayAvatarURL())
			.setTimestamp(Date.now())

		const fetchedLog = (await channel.guild.fetchAuditLogs({ limit: 1, type: 'CHANNEL_DELETE' })).entries.first()

		console.log(fetchedLog)

		if (fetchedLog && fetchedLog.target.id === channel.id) {
			Embed.setAuthor(fetchedLog.executor.tag, fetchedLog.executor.displayAvatarURL())
		}

		logsChannel.send(Embed)

	})

	client.on('channelUpdate', async (oldChannel, newChannel) => {

		if (oldChannel.type === 'dm' || newChannel.type === 'dm') return

		const { logs, logsChannelId } = await client.schemas.get('guild').findOne({ _id: newChannel.guild.id })

		const logsChannel = newChannel.guild.channels.cache.find(c => c.id === logsChannelId)

		if (!logs || !logs.get('channelUpdate') || !logsChannel) return

		const Embed = new Discord.MessageEmbed()
			.setTitle('Channel Updated')
			.setColor('YELLOW')
			.setFooter(client.user.username, client.user.displayAvatarURL())
			.setTimestamp(Date.now())

		if (oldChannel.name !== newChannel.name) {

			Embed.addField('Name Before', oldChannel.name, true)
			Embed.addField('Name Now', newChannel.name, true)

		}
		else {
			Embed.addField('Name', newChannel.name, false)
		}
		if (oldChannel.parent !== newChannel.parent) {

			Embed.setDescription('Channel Moved')

			let oldParent = 'none', newParent = 'none'

			if (oldChannel.parent) oldParent = oldChannel.parent.name
			if (newChannel.parent) newParent = newChannel.parent.name

			Embed.addField('Category Before', oldParent, true)
			Embed.addField('Category After', newParent, true)

		}

		if (newChannel.type === 'text') {

			if (oldChannel.nsfw !== newChannel.nsfw) {

				if (newChannel.nsfw) {
					Embed.addField('NSFW Change', 'Changed channel to be NSFW.')
				}
				else {
					Embed.addField('NSFW Change', 'Changed channel not to be NSFW anymore.')
				}

			}

			if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
				Embed.addField('Slowmode Changed', `${oldChannel.rateLimitPerUser}s => ${newChannel.rateLimitPerUser}s`)
			}

			if (oldChannel.topic !== newChannel.topic) {
				if (newChannel.topic) {
					Embed.addField('Topic Changed', newChannel.topic)
				}
				else {
					Embed.addField('Topic Removed', oldChannel.topic)
				}

			}

		}
		else if (newChannel.type === 'voice') {

			if (oldChannel.bitrate !== newChannel.bitrate) {
				Embed.addField('Bitrate Change', `${oldChannel.bitrate} => ${newChannel.bitrate}`, false)
			}

			if (oldChannel.userLimit !== newChannel.userLimit) {
				Embed.addField('Userlimit Change', `${oldChannel.userLimit} => ${newChannel.userLimit}`, false)
			}

		}

		// How the fuck do I print the permission changes of a channel. pls help


		if (Embed.fields.length > 1) {

			Embed.addField('ID', `\`\`\`js\nCHANNEL = ${newChannel.id}\`\`\``)

			const fetchedLog = (await newChannel.guild.fetchAuditLogs({ limit: 1, type: 'CHANNEL_UPDATE' })).entries.first()

			if (fetchedLog && fetchedLog.target.id === newChannel.id) Embed.setAuthor(fetchedLog.executor.tag, fetchedLog.executor.displayAvatarURL())

			logsChannel.send(Embed)

		}


	})

	client.on('guildBanAdd', async (guild, user) => {

		const { logs, logsChannelId } = await client.schemas.get('guild').findOne({ _id: guild.id })

		const logsChannel = guild.channels.cache.find(c => c.id === logsChannelId)

		if (!logs || !logs.get('guildBanAdd') || !logsChannel) return

		const Embed = new Discord.MessageEmbed()
			.setTitle('Member Banned')
			.setColor('RED')
			.addField('User', user.tag)
			.setFooter(client.user.username, client.user.displayAvatarURL())
			.setTimestamp(Date.now())

		const fetchedLog = (await guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_BAN_ADD' })).entries.first()

		if (fetchedLog && fetchedLog.target.id === user.id) Embed.setAuthor(fetchedLog.executor.tag, fetchedLog.executor.displayAvatarURL())

		logsChannel.send(Embed)

	})

	client.on('guildBanRemove', async (guild, user) => {

		const { logs, logsChannelId } = await client.schemas.get('guild').findOne({ _id: guild.id })

		const logsChannel = guild.channels.cache.find(c => c.id === logsChannelId)

		if (!logs || !logs.get('guildBanRemove') || !logsChannel) return

		const Embed = new Discord.MessageEmbed()
			.setTitle('Member Unbanned')
			.setColor('GREEN')
			.addField('User', user.tag)
			.setFooter(client.user.username, client.user.displayAvatarURL())
			.setTimestamp(Date.now())

		const fetchedLog = (await guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_BAN_REMOVE' })).entries.first()

		if (fetchedLog && fetchedLog.target.id === user.id) Embed.setAuthor(fetchedLog.executor.tag, fetchedLog.executor.displayAvatarURL())

		logsChannel.send(Embed)

	})

	client.on('guildMemberAdd', async member => {

		const { logs, logsChannelId } = await client.schemas.get('guild').findOne({ _id: member.guild.id })

		const logsChannel = member.guild.channels.cache.find(c => c.id === logsChannelId)

		if (!logs || !logs.get('guildMemberAdd') || !logsChannel) return

		const Embed = new Discord.MessageEmbed()
			.setTitle('Member Joined')
			.setColor('#00FF48')
			.setImage(member.user.displayAvatarURL({ dynamic : true, size: 128 }))
			.setDescription(`${member.displayName} joined the server.`)
			.addField('Account Created:', member.user.createdAt.toDateString())
			.addField('ID', `\`\`\`js\nUSER = ${member.id}\`\`\``)
			.setFooter(client.user.username, client.user.displayAvatarURL())
			.setTimestamp(Date.now())

		logsChannel.send(Embed);
	})

	client.on('guildMemberRemove', async member => {

		const { logs, logsChannelId } = await client.schemas.get('guild').findOne({ _id: member.guild.id })

		const logsChannel = member.guild.channels.cache.find(c => c.id === logsChannelId)

		if (!logs || (!logs.get('guildMemberRemove') && !logs.get('guildMemberKick')) || !logsChannel) return

		const Embed = new Discord.MessageEmbed()
			.setColor('#FF2A2A')
			.setImage(member.user.displayAvatarURL({ dynamic : true, size: 128 }))
			.setDescription(`${member.displayName} left the server.`)
			.addField('Joined Server:', member.joinedAt.toDateString())
			.setFooter(client.user.username, client.user.displayAvatarURL())
			.setTimestamp(Date.now())


		const kicked = (await member.guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_KICK' })).entries.first()

		if (kicked.target === member) {

			Embed.setTitle('Member Kicked')
				.setAuthor(kicked.executor.tag, kicked.executor.displayAvatarURL({ dynamic: true }))
		}
		else {
			Embed.setTitle('Member Left')
		}

		Embed.addField('ID', `\`\`\`js\nUSER = ${member.id}\`\`\``)

		logsChannel.send(Embed);

	})

	client.on('guildMemberUpdate', async (oldMember, newMember) => {

		const { logs, logsChannelId } = await client.schemas.get('guild').findOne({ _id: newMember.guild.id })

		const logsChannel = newMember.guild.channels.cache.find(c => c.id === logsChannelId)

		if (!logs || !logs.get('guildMemberUpdate') || !logsChannel) return

		const Embed = new Discord.MessageEmbed()
			.setFooter(client.user.username, client.user.displayAvatarURL())
			.setTimestamp(Date.now())
			.setAuthor(newMember.user.tag, newMember.user.displayAvatarURL({ dynamic : true, size: 128 }))

		if (oldMember.nickname !== newMember.nickname) {
			Embed.setTitle('Nickname changed')
				.addField('Before:', oldMember.nickname, true)
				.addField('Now:', newMember.nickname, true)
		}
		else if (oldMember.user.username !== newMember.user.username) {

			Embed.setTitle('Username changed')
				.addField('Before:', oldMember.user.username, true)
				.addField('Now:', newMember.user.username, true)

		}
		else if (oldMember.user.avatar !== newMember.user.avatar) {
			Embed.setTitle('Avatar changed')
				.setImage(newMember.user.displayAvatarURL({ dynamic: true, size: 128 }))
		}

		Embed.addField('ID', `\`\`\`js\nUSER = ${newMember.id}\`\`\``)

		logsChannel.send(Embed)

	})

	client.on('messageDelete', async message => {

		if (message.channel.type === 'dm') return

		if (message.author.bot || message.partial) return

		const { logs, logsChannelId } = await client.schemas.get('guild').findOne({ _id: message.guild.id })

		const logsChannel = message.guild.channels.cache.find(c => c.id === logsChannelId)

		if (!logs || !logs.get('messageDelete') || !logsChannel) return

		const Embed = new Discord.MessageEmbed()
			.setTitle('Message Deleted')
			.setColor('#5B0000')
			.setAuthor(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))

		if (message.content) Embed.addField('Inhalt:', message.content)

		let writtenH = message.createdAt.getHours()
		if(writtenH / 10 < 1) writtenH = `0${writtenH}`
		let writtenM = message.createdAt.getMinutes()
		if(writtenM / 10 < 1) writtenM = `0${writtenM}`

		Embed.addField('Message written:', `${writtenH}:${writtenM}, ${message.createdAt.toDateString()}`)
			.addField('Channel:', message.channel)
			.setTimestamp(Date.now())

		const fetchedLogs = (await message.guild.fetchAuditLogs({ limit: 1, type: 'MESSAGE_DELETE' })).entries.first()

		if (fetchedLogs && fetchedLogs.target.id === message.author.id) Embed.addField('Moderator:', fetchedLogs.executor)
		if (message.attachments.size != 0) Embed.addField('Attachment:', message.attachments.first().url)

		Embed.addField('ID', `\`\`\`js\nMESSAGE = ${message.id}\nAUTHOR = ${message.author.id}\`\`\``)

		logsChannel.send(Embed)
	})

	client.on('messageDeleteBulk', async messages => {

		const { logs, logsChannelId } = await client.schemas.get('guild').findOne({ _id: messages.first().guild.id })

		const logsChannel = messages.first().guild.channels.cache.find(c => c.id === logsChannelId)

		if (!logs || !logs.get('messageDelete') || !logsChannel) return

		const Embed = new Discord.MessageEmbed()
			.setTitle('Message Bulk Deleted')
			.addField('Channel:', messages.first().channel.name)
			.addField('Amount:', messages.size)

		logsChannel.send(Embed)

	})

	client.on('messageUpdate', async (oldMessage, newMessage) => {

		if (oldMessage.partial || newMessage.partial) return

		if (newMessage.channel.type === 'dm' || newMessage.author.bot) return

		const { logs, logsChannelId } = await client.schemas.get('guild').findOne({ _id: newMessage.member.guild.id })

		const logsChannel = newMessage.guild.channels.cache.find(c => c.id === logsChannelId)

		if (!logs || !logs.get('messageUpdate') || logsChannel) return

		let writtenH = oldMessage.createdAt.getHours()
		if(writtenH / 10 < 1) writtenH = `0${writtenH}`
		let writtenM = oldMessage.createdAt.getMinutes()
		if(writtenM / 10 < 1) writtenM = `0${writtenM}`

		const Embed = new Discord.MessageEmbed()
			.setTitle('Message Edited')
			.setColor('#292b2f')
			.setAuthor(newMessage.member.displayName, newMessage.author.displayAvatarURL({ dynamic: true }))
			.addField('Before:', oldMessage.content)
			.addField('Now:', newMessage.content)
			.addField('Message written:', `${writtenH}:${writtenM}, ${oldMessage.createdAt.toDateString()}`)
			.addField('Channel:', `${newMessage.channel} \n [Go To Message](${newMessage.url})`)
			.setFooter(client.user.username, client.user.displayAvatarURL())
			.setTimestamp(Date.now())

		Embed.addField('ID', `\`\`\`js\nMESSAGE = ${newMessage.id}\nAUTHOR = ${newMessage.author.id}\`\`\``)

		logsChannel.send(Embed);
	})

	client.on('voiceStateUpdate', async (oldState, newState) => {

		if (oldState.channel === newState.channel) return

		const { logs, logsChannelId } = await client.schemas.get('guild').findOne({ _id: newState.member.guild.id })

		const logsChannel = newState.guild.channels.cache.find(c => c.id === logsChannelId)

		if (!logs || !logs.get('voiceStateUpdate') || !logsChannel) return

		if(newState.channel) {
			if(oldState.channel) {

				const Embed = new Discord.MessageEmbed()
					.setTitle('Voice Channel switched')
					.setColor('#292b2f')
					.setAuthor(newState.member.displayName, newState.member.user.displayAvatarURL({ dynamic : true }))
					.addField('Before:', oldState.channel.name, true)
					.addField('Now:', newState.channel.name, true)
					.setFooter(client.user.username, client.user.displayAvatarURL())
					.setTimestamp(Date.now())

				logsChannel.send(Embed);
			}
			else {

				const Embed = new Discord.MessageEmbed()
					.setTitle('Voice Channel joined')
					.setColor('#292b2f')
					.setAuthor(newState.member.displayName, newState.member.user.displayAvatarURL({ dynamic : true }))
					.addField('Channel:', newState.channel.name)
					.setFooter(client.user.username, client.user.displayAvatarURL())
					.setTimestamp(Date.now())

				logsChannel.send(Embed);
			}
		}
		else if (oldState.channel) {

			const Embed = new Discord.MessageEmbed()
				.setTitle('Voice Channel left')
				.setColor('#292b2f')
				.setAuthor(oldState.member.displayName, oldState.member.user.displayAvatarURL({ dynamic : true }))
				.addField('Channel:', oldState.channel.name)
				.setFooter(client.user.username, client.user.displayAvatarURL())
				.setTimestamp(Date.now())

			logsChannel.send(Embed)
		}
	})
}