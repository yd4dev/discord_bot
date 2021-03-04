const Discord = require('discord.js');

module.exports = {
	name: 'logs',
	description: 'Lets you change the server logs settings.',
	args: false,
	guild: true,
	permissions: 'ADMINISTRATOR',
	usage: ['toggle [event/s]', 'channel <text channel mention / id>'],
	async execute(message, args, client, prefix) {

		// channelCreate, channelDelete, channelUpdate, guildBanAdd, guildBanRemove, guildMemberAdd, guildMemberRemove, guildMemberKick, guildMemberUpdate, messageDelete, messageDeleteBulk, messageUpdate, voiceStateUpdate
		// 'channelCreate', 'channelDelete', 'channelUpdate', 'guildBanAdd', 'guildBanRemove', 'guildMemberAdd', 'guildMemberRemove', 'guildMemberKick', 'guildMemberUpdate', 'messageDelete', 'messageDeleteBulk', 'messageUpdate', 'voiceStateUpdate'

		const result = (await client.schemas.get('guild').findOne({ _id: message.guild.id }));

		const logsMap = new Map(result.logs);

		const events = ['channelCreate', 'channelDelete', 'channelUpdate', 'guildBanAdd', 'guildBanRemove', 'guildMemberAdd', 'guildMemberRemove', 'guildMemberKick', 'guildMemberUpdate', 'messageDelete', 'messageDeleteBulk', 'messageUpdate', 'voiceStateUpdate'];


		let undefChanged = false;
		events.forEach(async e => {

			if (logsMap.get(e) === undefined) {
				logsMap.set(e, true);
				undefChanged = true;
			}
		});
		if (undefChanged === true) {
			await client.schemas.get('guild').findOneAndUpdate({
				_id: message.guild.id,
			}, {
				logs: logsMap,
			}, {
				upsert: true,
			});
		}


		if (args.length === 0) {

			const logsChannel = result.logsChannelId;
			let description = '';
			if (logsChannel) description = ` The logs will be sent into ${client.channels.cache.find(c => c.id === result.logsChannelId)}`;
			else description = ' You have not set a logs channel yet. Nothing will be logged.';

			const LogsEmbed = new Discord.MessageEmbed()
				.setTitle('Server Logs')
				.setAuthor(client.user.username, client.user.displayAvatarURL())
				.setColor('AQUA')
				.setDescription(description)
				.setFooter(`Toggle events using ${prefix}logs toggle, Set a logs channel with ${prefix}logs channel`);

			events.forEach(e => {

				if (logsMap.get(e)) {
					LogsEmbed.addField(e, '✅', true);
				}
				else {
					LogsEmbed.addField(e, '❌', true);
				}

			});

			message.channel.send(LogsEmbed);

		}
		else {
			switch (args[0]) {

			case 'toggle': {

				args.shift();

				let success = '';

				args.forEach(a => {

					if (events.find(e => e === a) && success.search(a) === -1) {

						logsMap.set(a, !logsMap.get(a));

						if (success.length !== 0) {
							success += ', ' + '`' + a + '`';
						}
						else {
							success = '`' + a + '`';
						}

					}

				});

				if (success.length) {

					await client.schemas.get('guild').findOneAndUpdate({
						_id: message.guild.id,
					}, {
						logs: logsMap,
					}, {
						upsert: true,
					});

					message.channel.send(`Successfully changed ${success}.`);

				}
				else {

					message.channel.send('Please provide events to toggle.');

				}
				break;
			}

			case 'channel':

				if (!args[1]) {

					await client.schemas.get('guild').findOneAndUpdate({
						_id: message.guild.id,
					}, {
						logsChannelId: message.channel.id,
					}, {
						upsert: true,
					});

					message.channel.send(`Set events to be logged in ${message.channel}`);

				}
				else if (message.mentions.channels.size > 0 && message.mentions.channels.first().type === 'text' && message.mentions.first().guild === message.guild) {

					await client.schemas.get('guild').findOneAndUpdate({
						_id: message.guild.id,
					}, {
						logsChannelId: message.mentions.channels.first().id,
					}, {
						upsert: true,
					});

					message.channel.send(`Set events to be logged in ${message.mentions.channels.first()}`);

				}
				else {

					const channel = message.guild.channels.cache.find(c => c.id === args[1]);

					if (channel && channel.type === 'text') {

						await client.schemas.get('guild').findOneAndUpdate({
							_id: message.guild.id,
						}, {
							logsChannelId: channel.id,
						}, {
							upsert: true,
						});

						message.channel.send(`Set events to be logged in ${channel}`);

					}
					else if (client.channels.cache.find(c => c.id === args[1]) && client.channels.cache.find(c => c.id === args[1]).guild !== message.guild) {
						message.channel.send('Did you just try to select another server\'s channel?');
					}
					else {
						message.channel.send('Please provide a valid text channel mention / id.');
					}

				}

				break;

			default:

				client.commands.get('help').commandHelp(message, this.name, prefix, client);

				break;
			}
		}

	},
};