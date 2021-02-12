module.exports = client => {

	client.on('voiceStateUpdate', async (oldState, newState) => {

		setTimeout(async function() {
			if (oldState.channel && oldState.channel != newState.channel && oldState.channel.members.size === 0) {

				const tempChannel = await client.schemas.get('tempChannel').findOne({ _id: oldState.channel.id })

				if (tempChannel) {

					oldState.channel.delete()
					await client.schemas.get('tempChannel').deleteOne({ _id: oldState.channel.id })

				}
			}
		})

		if(!newState.channel) return;

		const result = await client.schemas.get('guild').findOne({ _id: newState.guild.id })

		if(!result.autoChannel_channel) return;
		if(newState.channel.id != result.autoChannel_channel) return;

		let name = result.autoChannel_name

		if (!name) name = '%USER'

		name = name.replace('%USER[0]', newState.member.displayName.split(' ')[0])

		name = name.replace('%USER', newState.member.displayName)

		newState.guild.channels.create(name, {
			type: 'voice',
			parent: newState.channel.parent,
			permissionOverwrites: [
				{
					id: newState.member.id,
					allow: ['MANAGE_CHANNELS', 'MOVE_MEMBERS'],
				},
			],
		}) .then(channel => {
			newState.setChannel(channel)
			client.schemas.get('tempChannel').create({ _id: channel.id })
		})
	})


	client.on('channelDelete', async (channel) => {

		if (channel.type !== 'voice') return

		const ifTempChannel = await client.schemas.get('tempChannel').findOne({ _id: channel.id })

		if (ifTempChannel) {

			await client.schemas.get('tempChannel').deleteOne({ _id: channel.id })

		}


	})

}