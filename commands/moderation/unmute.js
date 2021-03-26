module.exports = {
	name: 'unmute',
	description: 'Lets you unmute users.',
	args: 1,
	guild: true,
	permissions: 'MANAGE_ROLES',
	usage: ['@Target'],
	async execute(message, args, client) {

		const target = message.mentions.members.first();

		const result = await client.schemas.get('mute').findOne({
			guildId: message.guild.id,
			userId: target.id,
		});

		const { joinRoles, mutedRole } = await client.schemas.get('guild').findOne({
			_id: message.guild.id,
		});

		if(target.roles.highest.comparePositionTo(message.guild.members.resolve(client.user).roles.highest) > 0) return message.channel.send('It seems that I am not high enough in the role hierarchy to unmute that member.');
		if (target.roles.highest.comparePositionTo(message.member.roles.highest) >= 0) return message.channel.send('You cannot unmute members that are higher than you.');

		if(!result && !target.roles.cache.has(mutedRole.id)) return message.channel.send('That user is not muted.');

		if(result) {

			const previousRoles = result.userRoles;

			previousRoles.forEach(element => {
				target.roles.add(message.guild.roles.cache.find(role => role.id === element));
			});

			target.roles.remove(mutedRole);

			await client.schemas.get('mute').deleteOne(result);

			return message.channel.send(`Successfully unmuted ${target}.`);
		}
		else if (target.roles.cache.has(mutedRole)) {

			target.roles.remove(mutedRole);

			if(joinRoles) {
				joinRoles.forEach(e => {
					target.roles.add(e);
				});
			}

			return message.channel.send(`Successfully unmuted ${target}.`);
		}
	},
};