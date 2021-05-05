const Discord = require('discord.js');

module.exports = client => {

	client.on('guildMemberAdd', async member => {

		const currentMute = await client.schemas.get('mute').findOne({
			guildId: member.guild.id,
			userId: member.id,
		});

		// Mute role reassigning is handled in mute.js
		if (currentMute) return;

		const result = client.data.guilds.get(member.guild.id);

		if(result.joinRoles) {
			result.joinRoles.forEach(role => {
				member.roles.add(role);
			});
		}

		if (result.welcome_plugin) {

			if (!member.guild.channels.cache.find(c => c.id === result.welcome_channel)) {

				client.data.save(member.guild.id, client, {
					welcome_toggle: false,
					welcome_channel: '',
				});
			}
			else {

				const Embed = new Discord.MessageEmbed()
					.setTitle(result.welcome_title)
					.setDescription(result.welcome_message.replace('%name', member.user.username).replace('%guild', member.guild.name))
					.setAuthor(client.user.username, client.user.displayAvatarURL())
					.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
					.setColor('GREEN')
					.setTimestamp(Date.now());

				try { member.guild.channels.cache.find(c => c.id === result.welcome_channel).send(Embed); }
				catch {

					member.guild.channels.cache.some(c => c.type === 'text' && c.permissionsFor(member.guild.me).has('SEND_MESSAGES')).send(`Could not send welcome message into ${member.guild.channels.cache.find(c => c.id === result.welcome_channel)}`);
				}
			}
		}
	});
};