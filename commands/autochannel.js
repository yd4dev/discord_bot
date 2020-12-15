module.exports = {
	name: 'autochannel',
    description: 'A command to change autochannel settings.',
    args: false,
	async execute(message, args, client, prefix) {
		
		if (!message.member.hasPermission('MANAGE_CHANNELS')) return message.channel.send('You do not have enough permissions to run this command. [MANAGE_CHANNELS]');

		switch (args[0]) {
			
			case 'channel':

				let channel = message.guild.channels.cache.find(channel => channel.id == args[1])

				if(!channel) return message.channel.send('Please provide a valid channel id.')
				if(channel.type != 'voice') return message.channel.send('Please provide a voice channel.')

				await client.schemas.get('guild').findOneAndUpdate({
                    _id: message.guild.id
                }, {
                    _id: message.guild.id,
                    autoChannel_channel: channel.id,
                }, {
                    upsert: true
				})
				
				message.channel.send(`Auto Channels can now be created by joining into \`${channel.name}\`.`)

			break;

			case 'name':

				args.shift()
				let name = args.join(' ').trim()

				if( name == '' ) return message.channel.send('Please provide a channel name. Use `%USER` to add the username.')

				await client.schemas.get('guild').findOneAndUpdate({
                    _id: message.guild.id
                }, {
                    _id: message.guild.id,
                    autoChannel_name: name,
                }, {
                    upsert: true
				})

				message.channel.send(`Auto Channels will now be named \`${name}\`.`)

			break;

			default:

				

			break;

		}

	},
};