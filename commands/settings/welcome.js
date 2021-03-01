const Discord = require('discord.js');

module.exports = {
	name: 'welcome',
	description: 'Welcome users that join your guild.',
	args: false,
	guild: true,
	permissions: 'ADMINISTRATOR',
	usage: ['toggle', 'roles [mention roles]', 'title [title]', 'message [message]', 'channel [text channel]'],
	async execute(message, args, client, prefix) {

		const settings = await client.schemas.get('guild').findOne({
			_id: message.guild.id,
		});

		if (!args.length) {

			const Embed = new Discord.MessageEmbed()
				.setTitle('Welcome')
				.setAuthor(client.user.username, client.user.displayAvatarURL({ dynamic: true }))
				.setColor(settings.welcome_plugin ? 'GREEN' : 'DARK_RED')
				.setDescription(`**Join Roles**: <@&${settings.joinRoles.join('>, <@&') + '>' || '_none_'}
								**Welcome Title**: ${settings.welcome_title}
								**Welcome Message**: ${settings.welcome_message.replace('%name', '`%name`').replace('%guild', '`%guild`')}
								\`Use %name and %guild to replace user and guild names.\`
								**Welcome Channel**: ${message.guild.channels.cache.find(c => c.id === settings.welcome_channel) || 'None Set'}
								Welcome Messages are turned ${settings.welcome_plugin ? 'on' : 'off'}`);

			message.channel.send(Embed);

		}
		else {

			switch (args[0].toLowerCase()) {

			case 'roles': {
				const roles = [];

				if (!message.mentions.roles.size > 0) return message.channel.send('Please provide (a) role(s) by mentioning.');

				message.mentions.roles.forEach(role => {
					if (message.member.roles.highest.comparePositionTo(role) > 0 && role.guild === message.guild) {
						roles.push(role.id);
					}
				});

				await client.schemas.get('guild').findOneAndUpdate({ _id: message.guild.id }, {
					joinRoles: roles,
				}, {
					upsert: true,
				});

				message.channel.send(`<@&${roles.join('>, <@&')}> will now be assigned on join.`);

				break;
			}

			case 'toggle': {

				if (!settings.welcome_channel) return message.channel.send('Please provide a welcome channel first.');

				await client.schemas.get('guild').findOneAndUpdate({
					_id: message.guild.id,
				}, {
					welcome_plugin: !settings.welcome_plugin,
				}, {
					upsert: true,
				});

				message.channel.send(`Turned the Welcome Message ${!settings.welcome_plugin ? 'on' : 'off'}`);

				break;
			}

			case 'title': {

				if (!args[1]) return message.channel.send('Please provide a title.');

				args.shift();

				await client.schemas.get('guild').findOneAndUpdate({
					_id: message.guild.id,
				}, {
					welcome_title: args.join(' '),
				}, {
					upsert: true,
				});

				message.channel.send(`Set the Welcome Title to ${args.join(' ')}`);

				break;


			}

			case 'message': {

				if (!args[1]) return message.channel.send('Please provide a message.');

				args.shift();

				await client.schemas.get('guild').findOneAndUpdate({
					_id: message.guild.id,
				}, {
					welcome_message: args.join(' '),
				}, {
					upsert: true,
				});

				message.channel.send(`Set the Welcome Message to ${args.join(' ').replace('%name', '`%name`').replace('%guild', '`%guild`')}`);

				break;

			}

			case 'channel': {

				if (!args[1] && message.mentions.channel.size === 0) return message.channel.send('Please provide a text channel.');

				let channel;

				if (message.mentions.channels.size === 0) {

					channel = message.guild.channels.cache.find(c => c.id === args[1]);
				}
				else {

					channel = message.mentions.channels.first();
				}

				if (!channel || channel.type !== 'text') {
					return message.channel.send('Please provide a valid text channel.');
				}

				else {
					await client.schemas.get('guild').findOneAndUpdate({
						_id: message.guild.id,
					}, {
						welcome_channel: channel.id,
					}, {
						upsert: true,
					});
				}

				try {
					message.channel.send(`Welcome Message will now be sent into ${channel}`);
				}
				catch {
					message.author.send(`Welcome Message will now be sent into ${channel}`);
				}
				break;
			}

			default: {
				client.commands.get('help').commandHelp(message, 'welcome', prefix, client);
			}
			}
		}
	},
};

// !welcome roles [mention roles]
// !welcome toggle
// !welcome title [title]
// !welcome message [message]
