const Discord = require('discord.js');

module.exports = {
	name: 'settings',
	description: 'An administrator command to show server settings.',
	args: false,
	guild: true,
	permissions: 'ADMINISTRATOR',
	async execute(message, args, client, prefix) {

		const settings = await client.schemas.get('guild').findOne({ _id: message.guild.id });

		const joinRoles = [];
		settings.joinRoles.forEach(role => {
			if (message.guild.roles.cache.get(role)) joinRoles.push(message.guild.roles.cache.get(role));
		});

		const voicelinks = [];
		settings.voicelinks.forEach((value, key) => {
			if (message.guild.channels.cache.find(c => c.id === key) && message.guild.roles.cache.find(r => r.id === value)) {
				voicelinks.push(`${message.guild.channels.cache.find(c => c.id === key)} => ${message.guild.roles.cache.find(r => r.id === value)}`);
			}
		});


		let isTrueVar = 0;
		function isTrue() {
			isTrueVar++;
			if (isTrueVar % 3 !== 0) return true;
			return false;
		}

		const settingsEmbed = new Discord.MessageEmbed()
			.setTitle('Server Settings')
			.setAuthor(client.user.username, client.user.displayAvatarURL({ dynamic: true }))
			.setDescription('These settings can be changed by using the given commands.');
		if (settings.prefix) settingsEmbed.addField(`Prefix: \`${prefix}prefix\``, settings.prefix, isTrue());
		if (settings.logsChannelId) settingsEmbed.addField(`Logs Channel: \`${prefix}logs\``, `<#${settings.logsChannelId}>`, isTrue());
		if (joinRoles.length != 0) settingsEmbed.addField(`Join Roles: \`${prefix}welcome\``, joinRoles, isTrue());
		if (settings.mutedRole) settingsEmbed.addField(`Muted Role: \`${prefix}mute\``, `<@&${settings.mutedRole}>`, isTrue());
		if (settings.ignoredChannels) settingsEmbed.addField(`Ignored Channels: \`${prefix}ignore\``, `<#${settings.ignoredChannels.join('>, <#')}>`, isTrue());
		if (voicelinks.length != 0) settingsEmbed.addField(`Voicelinks: \`${prefix}voicelink\``, voicelinks.join('\n'), isTrue());
		if (settings.welcome_channel) settingsEmbed.addField(`Welcome Channel: \`${prefix}welcome\``, `<#${settings.welcome_channel}>`);

		message.channel.send(settingsEmbed);

	},
};