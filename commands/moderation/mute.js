const Discord = require('discord.js');

module.exports = {
	name: 'mute',
	description: 'Restrict users from writing into text channels.',
	args: 1,
	guild: true,
	permissions: 'MANAGE_ROLES',
	usage: ['[@User / User ID] [Time]'],
	async execute(message, args, client, prefix) {

		const target = message.mentions.members.first() || message.guild.members.cache.find(m => m.id === args[0]);

		if (args[0].search(target?.id) > -1) args.shift();
		else client.commands.get('help').commandHelp(message, 'mute', prefix, client);

		if (!target) return message.channel.send('Please mention a member.');

		const currentlyMuted = await client.schemas.get('mute').find({
			guildId: message.guild.id,
			userId: target.id,
		});

		if (currentlyMuted.length) {
			const Embed = new Discord.MessageEmbed()
				.setAuthor(client.user.username, client.user.displayAvatarURL({ dynamic: true }))
				.setDescription(`That user is already muted by <@${currentlyMuted[0].moderatorId}>.`)
				.setFooter('Expires: ')
				.setTimestamp(currentlyMuted.expires);
			return message.channel.send(Embed);
		}

		if (target.roles.highest.comparePositionTo(message.guild.member(client.user).roles.highest) >= 0) return message.channel.send('It seems that my highest role is not high enough to mute that member.');
		if (target.roles.highest.comparePositionTo(message.member.roles.highest) >= 0) return message.channel.send('You cannot mute members that are higher than you.');

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
				return timestamp = false;
			}

			const number = element.substring(0, element.length - 1);

			timestamp = timestamp + number * types[elementType] * 1000;
		});

		if (!timestamp) return message.channel.send('Please provide a valid duration. Valid duration types are minutes `m`, hours `h`, days `d`.\n' + `Example: \`${prefix}mute @${target.displayName} 1h30m\``);

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

	},
};