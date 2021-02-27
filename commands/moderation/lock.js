module.exports = {
	name: 'lock',
	description: 'Locks a channel.',
	args: false,
	guild: true,
	permissions: 'MANAGE_MESSAGES',
	execute(message) {

		if (message.channel.permissionsFor(message.guild.roles.everyone).has('SEND_MESSAGES') && message.channel.permissionsFor(message.guild.roles.everyone).has('ADD_REACTIONS')) {

			message.channel.updateOverwrite(message.guild.roles.everyone, { SEND_MESSAGES: false, ADD_REACTIONS: false });

			message.channel.send('🔒 Locked the channel.');
		}
		else {
			message.channel.send('🔒 This channel is already locked.');
		}

	},
};