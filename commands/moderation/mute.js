module.exports = {
	name: 'mute',
	description: 'Restrict users from writing into text channels.',
	args: 1,
	guild: true,
	permissions: 'MANAGE_ROLES',
	usage: ['[@Target] [Time]'],
	async execute(message, args, client, prefix) {

		const target = message.mentions.members.first();

		if (args[0].search(target.id)) args.shift();
		else client.commands.help.commandHelp(message, 'mute', prefix, client);

		if (!target) return message.reply('please mention a member.');

		const currentlyMuted = await client.schemas.get('mute').find({
			guildId: message.guild.id,
			userId: target.id,
		});

		if (currentlyMuted.length) return message.reply('that user is already muted.');

		if (target.roles.highest.comparePositionTo(message.guild.member(client.user).roles.highest) >= 0) return message.channel.send('It seems that my highest role is not high enough to mute that member.');
		if (target.roles.highest.comparePositionTo(message.member.roles.highest) >= 0) return message.channel.send('You cannot mute members that are higher than you.');

		if (args[0]) {

			const time = args[0].split(/(?<=[A-Za-z])/);

			const types = {
				m: 60,
				h: 3600,
				d: 86400,
			};

			let timestamp = Date.now();

			time.forEach(element => {
				const elementType = element.slice(-1);

				if (!types.hasOwnProperty(elementType)) {
					message.reply('Please provide a valid duration.');
					return timestamp = false;
				}

				const number = element.substring(0, element.length - 1);

				timestamp = timestamp + number * types[elementType] * 1000;
			});

			if (!timestamp) return message.channel.send('Please provide a valid duration.');

			const expirationDate = new Date(timestamp);

			const mutedRole = message.guild.roles.cache.find(role => role.name === 'Muted');

			const everyoneRole = message.guild.roles.cache.find(role => role.name === '@everyone');

			const userRoles = target.roles.cache.array();

			userRoles.splice(userRoles.indexOf(everyoneRole, 1));

			if(!mutedRole) return message.channel.send(`I could not find a \`Muted\` role. Let me set up one by using \`${prefix}setup mute\``);

			await client.schemas.get('mute').findOneAndUpdate({

				guildId: message.guild.id,
				userId: target.id,
			}, {

				guildId: message.guild.id,
				userId: target.id,
				moderatorId: message.author.id,
				userRoles: userRoles,
				expires: expirationDate,
			}, {
				upsert: true,
			});

			userRoles.forEach(element => {
				target.roles.remove(element);
			});

			target.roles.add(mutedRole);

			message.channel.send(`I have muted ${target} until ${expirationDate.toDateString()}, ${expirationDate.toTimeString()}`);

		}
		else {
			return message.channel.send('Please provide a duration.');
		}
	},
};