module.exports = {
	name: 'roles',
	description: 'Set different roles for the server.',
	args: 2,
	guild: true,
	permissions: 'ADMINISTRATOR',
	usage: ['join [mention roles]'],
	async execute(message, args, client) {

		switch (args[0]) {
		case 'join': {

			const mentionedRoles = message.mentions.roles.array();
			if (mentionedRoles.length == 0) return message.channel.send('Please mention roles you want to assign.');
			await client.schemas.get('guild').findOneAndUpdate({
				_id: message.guild.id,
			}, {
				_id: message.guild.id,
				joinRoles: mentionedRoles,
			}, {
				upsert: true,
			});

			message.channel.send(`${mentionedRoles} will now be assigned on join.`);

			break;
		}
		}
	},
};