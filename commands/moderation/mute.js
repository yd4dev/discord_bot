const Discord = require('discord.js');

module.exports = {
	name: 'mute',
	description: 'Restrict users from writing into text channels.',
	args: 1,
	guild: true,
	permissions: 'MANAGE_ROLES',
	usage: ['[@User / User ID] [Time]', 'setup'],
	async execute(message, args, client, prefix) {

		if (args[0].toLowerCase() === 'setup') {

			message.channel.send('You have no Muted Role set. Please tag a role you want to use or react with ✍️ to create one.')
				.then(m => {
					m.react('✍️');
					const Rfilter = (reaction, user) => reaction.emoji.name === '✍️' && user.id === message.author.id;
					const Rcollector = m.createReactionCollector(Rfilter, { time: 30000 });
					let changedChannels = 0;
					let response = false;
					let failedChannels = 0;
					Rcollector.on('collect', async (r) => {
						response = true;
						Rcollector.stop();
						Mcollector.stop();

						try {
							const mutedRole = await message.guild.roles.create({ data: { name: 'Muted', permissions: 0 } });
						}
						catch (err) {
							message.channel.send('Could not create role. ' + err.name + ': ' + err.message);
						}

						if (!mutedRole) return;

						message.guild.channels.cache.forEach(element => {

							if (element.type !== 'text' && element.type !== 'category') return;

							try {

								element.updateOverwrite(mutedRole, { SEND_MESSAGES: false, ADD_REACTIONS: false });
								changedChannels++;
							}
							catch {
								failedChannels++;
							}
						});

						await client.schemas.get('guild').findOneAndUpdate({
							_id: message.guild.id,
						}, {
							mutedRole: mutedRole.id,
						}, {
							upsert: true,
						});

						const add = failedChannels != 0 ? ` Failed to change ${failedChannels} channels.` : '';

						message.channel.send(`Successfully created the ${mutedRole} role and set it up for ${changedChannels} channels (and categories).` + add);
					});
					Rcollector.on('end', () => {
						Mcollector.stop();
						if (!response) message.channel.send('No response. Exiting setup..');
					});


					const Mfilter = msg => msg.mentions.roles.size === 1 && msg.author.id === message.author.id;
					const Mcollector = m.channel.createMessageCollector(Mfilter, { time: 30000 });
					Mcollector.on('collect', async (msg) => {
						response = true;
						Mcollector.stop();
						Rcollector.stop();

						const mutedRole = message.guild.roles.cache.find(role => role === msg.mentions.roles.first());

						if (!mutedRole) return message.channel.send('Please provide a valid role.');
						if (message.guild.member(client.user.id).roles.highest.comparePositionTo(mutedRole) <= 0) return message.channel.send('Please move my highest role over the role you want to use first.');

						message.guild.channels.cache.forEach(element => {

							if (element.type !== 'text' && element.type !== 'category') return;

							element.updateOverwrite(mutedRole, { SEND_MESSAGES: false, ADD_REACTIONS: false });

							changedChannels++;
						});

						await client.schemas.get('guild').findOneAndUpdate({
							_id: message.guild.id,
						}, {
							mutedRole: mutedRole.id,
						}, {
							upsert: true,
						});

						const add = failedChannels != 0 ? ` Failed to change ${failedChannels} channels.` : '';

						message.channel.send(`Successfully created the ${mutedRole} role and set it up for ${changedChannels} channels (and categories).` + add);
					});
					Mcollector.on('end', () => {
						Rcollector.stop();
					});
				});

			return;
		}

		const target = message.mentions.members.first() || message.guild.members.cache.find(m => m.id === args[0]);

		if (args[0].search(target?.id) > -1) args.shift();
		else client.commands.get('help').commandHelp(message, 'mute', prefix, client);

		if (!target) {
			message.channel.send('Please mention a member or provide a user id.');
			return client.commands.get('help').commandHelp(message, 'mute', prefix, client);
		}

		const currentlyMuted = await client.schemas.get('mute').findOne({
			guildId: message.guild.id,
			userId: target.id,
		});

		const { mutedRole } = await client.schemas.get('guild').findOne({
			_id: message.guild.id,
		});

		if (currentlyMuted) {
			const Embed = new Discord.MessageEmbed()
				.setAuthor(client.user.username, client.user.displayAvatarURL({ dynamic: true }))
				.setDescription(`That user is already muted by <@${currentlyMuted.moderatorId}>.`)
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

		const everyoneRole = message.guild.roles.everyone;

		const userRoles = target.roles.cache.array();

		userRoles.splice(userRoles.indexOf(everyoneRole, 1));

		if(!mutedRole) return message.channel.send(`You have not set a Muted role. Set one up using \`${prefix}mute setup\``);

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
