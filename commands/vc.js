module.exports = {
	name: 'vc',
	description: 'Voice Chat Functions.',
	args: true,
	guild: true,
	usage: '%prefixvc move [voice channel id]',
	permissions: 'MOVE_MEMBERS',
	execute(message, args) {

		if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to use this command.')

		switch (args[0]) {
		case 'move': {

			const newVC = message.guild.channels.cache.find(c => c.id == args[1])

			if (newVC?.type != 'voice') return message.channel.send('Please provide a voice channel id.')

			if (!newVC.permissionsFor(message.member).has('CONNECT')) return message.channel.send('You do not have permissions to enter that channel.')

			message.member.voice.channel.members.forEach(member => {
				member.voice.setChannel(newVC);
			})
		}
		}

	},
};