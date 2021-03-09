const Discord = require('discord.js');

module.exports = {
	name: 'settings',
	description: 'An administrator command to show server settings.',
	args: true,
	guild: true,
	permissions: 'ADMINISTRATOR',
	async execute(message, args, client, prefix) {

		const settings = await client.schemas.get('guild').findOne({ _id: message.guild.id });

		const joinRoles = [];
		settings.joinRoles.forEach(role => {
			joinRoles.push(message.guild.roles.cache.get(role));
		});

		const settingsEmbed = new Discord.MessageEmbed()
			.setTitle('Server Settings')
			.setAuthor(client.user.username, client.user.displayAvatarURL({ dynamic: true }))
			.setDescription(`These settings can be changed by using \`${prefix}set\``);
		if (settings.prefix) settingsEmbed.addField('Prefix:', settings.prefix);
		if (settings.logsChannelId) settingsEmbed.addField('Logs Channel:', `<#${settings.logsChannelId}>`);
		if (joinRoles.length != 0) settingsEmbed.addField('Join Roles:', joinRoles);
		if (settings.ignoredChannels) settingsEmbed.addField('Ignored Channels:', `<#${settings.ignoredChannels.join('>', '<#')}>`);

		message.channel.send(settingsEmbed);

	},
};