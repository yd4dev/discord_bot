module.exports = {
	name: 'autochannel',
	description: 'Lets you change autochannel settings.',
	args: 2,
	guild: true,
	permissions: 'MANAGE_CHANNELS',
	usage: ['channel [voice channel id]', 'name [name] \n Use `%USER` to add the user\'s name to a channel name.'],
	async execute(message, args, client) {

		switch (args[0]) {

		case 'channel': {

			const channel = message.guild.channels.cache.find(c => c.id == args[1])

			if (!channel) return message.channel.send('Please provide a valid channel id.')
			if (channel.type != 'voice') return message.channel.send('Please provide a voice channel.')

			await client.schemas.get('guild').findOneAndUpdate({
				_id: message.guild.id,
			}, {
				_id: message.guild.id,
				autoChannel_channel: channel.id,
			}, {
				upsert: true,
			})

			message.channel.send(`Auto Channels can now be created by joining into \`${channel.name}\`.`)

			break;
		}

		case 'name': {

			args.shift()
			const name = args.join(' ').trim()

			if (name == '') return message.channel.send('Please provide a channel name. Use `%USER` to add the username.')

			await client.schemas.get('guild').findOneAndUpdate({
				_id: message.guild.id,
			}, {
				_id: message.guild.id,
				autoChannel_name: name,
			}, {
				upsert: true,
			})

			message.channel.send(`Auto Channels will now be named \`${name}\`.`)

			break;
		}
		}

	},
};