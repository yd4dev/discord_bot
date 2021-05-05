const Discord = require('discord.js');

module.exports = {
	name: 'ignore',
	description: 'Set text channels that will be ignored by the bot.',
	args: false,
	guild: true,
	usage: ['<mention channels>'],
	async execute(message, args, client, prefix) {

		const ignoredChannels = client.data.guilds.get(message.guild.id).ignoredChannels || new Array();

		if (message.mentions.channels.size > 0) {

			message.mentions.channels.forEach(channel => {

				if (channel.guild === message.guild) {

					const index = ignoredChannels.indexOf(channel.id);

					if (index > -1) {
						ignoredChannels.splice(index, 1);
					}
					else {
						ignoredChannels.push(channel.id);
					}
				}
			});

			await client.data.save(message.guild.id, client, { ignoredChannels: ignoredChannels });
		}

		let deletedChange = false;

		ignoredChannels.forEach(channel => {

			if (!client.channels.cache.find(s => s.id === channel)) {

				const index = ignoredChannels.indexOf(channel);

				if (index > -1) {
					ignoredChannels.splice(index, 1);
					deletedChange = true;
				}
			}
		});

		if (deletedChange === true) {

			await client.data.save(message.guild.id, client, { ignoredChannels: ignoredChannels });
		}

		const Embed = new Discord.MessageEmbed()
			.setTitle('Ignored Channels')
			.setDescription(ignoredChannels.length ? '• <#' + ignoredChannels.join('>\n• <#') + '>' : 'No channels ignored.')
			.setFooter(`Add and remove ignored channels using ${prefix}ignore <mention channels>`)
			.setAuthor(client.user.username, client.user.displayAvatarURL({ dynamic: true }));

		message.channel.send(Embed);
	},
};