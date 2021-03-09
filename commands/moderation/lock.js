module.exports = {
	name: 'lock',
	description: 'Locks a channel.',
	args: false,
	guild: true,
	permissions: 'MANAGE_CHANNELS',
	execute(message, args, client) {

		if (message.channel.permissionsFor(message.guild.roles.everyone).has('SEND_MESSAGES') || message.channel.permissionsFor(message.guild.roles.everyone).has('ADD_REACTIONS')) {

			if (message.guild.member(client.user).permissionsIn(message.channel).has('MANAGE_CHANNELS')) {

				message.channel.updateOverwrite(message.guild.roles.everyone, { SEND_MESSAGES: false, ADD_REACTIONS: false });

				message.channel.send('🔒 Locked the channel.');
			}
			else {
				message.channel.send('☠️ Could not lock the channel (Missing Permissions).');
			}
		}
		else {
			message.channel.send('🔒 The channel is already locked.');
		}
	},
};