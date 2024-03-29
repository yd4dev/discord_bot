import { Guild, Message, MessageEmbed, TextChannel } from 'discord.js';
import { DataClient } from '..';

async function checkLogsChannel(guild: Guild, client: DataClient) {
	const { logs_channel } = await client.db.loadGuild(guild.id) || {};
	const channel = guild.channels.cache.get(logs_channel || '');
	if (channel && channel instanceof TextChannel) return channel;
	return null;
}

function sendLogs(embed: MessageEmbed, channel: TextChannel) {
	channel.send({ embeds: [embed] }).catch(() => null);
}

module.exports = (client: DataClient) => {
	client.on('guildMemberAdd', async (member) => {
		const logs = await checkLogsChannel(member.guild, client);
		if (logs) {
			const Embed = new MessageEmbed()
				.setTitle('New Member')
				.setDescription(`${member.user.tag} (${member.id}) has joined the server.`)
				.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
				.setColor(0x00AE86);
			sendLogs(Embed, logs);
		}
	});
	client.on('guildMemberRemove', async (member) => {
		const logs = await checkLogsChannel(member.guild, client);
		if (logs) {
			const Embed = new MessageEmbed()
				.setTitle('Member Left')
				.setDescription(`${member.user.tag} (${member.id}) has left the server.`)
				.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
				.setColor(0xFF0000);
			sendLogs(Embed, logs);
		}
	});
	client.on('guildMemberUpdate', async (oldMember, newMember) => {
		const logs = await checkLogsChannel(oldMember.guild, client);
		if (logs) {
			if (oldMember.nickname !== newMember.nickname) {
				const Embed = new MessageEmbed()
					.setTitle('Nickname Changed')
					.setDescription(`${oldMember.user.tag} (${oldMember.id}) has changed their nickname to ${newMember.nickname}`)
					.setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
					.setColor(0x00AE86);
				sendLogs(Embed, logs);
			}
			else if (oldMember.communicationDisabledUntil !== newMember.communicationDisabledUntil) {
				if (newMember.isCommunicationDisabled()) {
					const Embed = new MessageEmbed()
						.setTitle('Member timed-out')
						.setDescription(`${oldMember.user.tag} (${oldMember.id}) has been timed-out until <t:${Math.floor((newMember.communicationDisabledUntilTimestamp || 0) / 1000)}:f>`)
						.setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
						.setColor(0xFFFF99);
					sendLogs(Embed, logs);
				}
				else {
					const Embed = new MessageEmbed()
						.setTitle('Member un-timed-out')
						.setDescription(`${oldMember.user.tag} (${oldMember.id}) has been un-timed-out`)
						.setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
						.setColor(0x00AE86);
					sendLogs(Embed, logs);
				}
			}
		}
	});
	client.on('messageDelete', async (message) => {
		if (message instanceof Message) {
			if (!message.guild) return;
			const logs = await checkLogsChannel(message.guild, client);
			if (logs) {
				const Embed = new MessageEmbed()
					.setTitle('Message Deleted')
					.addField('Content', message.content)
					.addField('Channel', message.channel.toString())
					.setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
					.setColor(0xFF0000);
				sendLogs(Embed, logs);
			}
		}
	});
	client.on('messageUpdate', async (oldMessage, newMessage) => {
		if (oldMessage instanceof Message && newMessage instanceof Message) {
			if (!oldMessage.guild) return;
			const logs = await checkLogsChannel(oldMessage.guild, client);
			if (logs) {
				if (!newMessage.content) return;
				const Embed = new MessageEmbed()
					.setTitle('Message Edited');

				if (oldMessage.content) Embed.addField('Old Content', oldMessage.content);

				Embed.addField('New Content', newMessage.content)
					.addField('Channel', newMessage.channel.toString(), true)
					.setAuthor({ name: newMessage.author.tag, iconURL: newMessage.author.displayAvatarURL({ dynamic: true }) })
					.setURL(newMessage.url)
					.setColor(0x00AE86);
				sendLogs(Embed, logs);
			}
		}
	});
	client.on('userUpdate', async (oldUser, newUser) => {
		for (const guild of client.guilds.cache.values()) {
			if (guild.members.cache.has(newUser.id)) {
				const logs = await checkLogsChannel(guild, client);
				if (logs) {
					const Embed = new MessageEmbed()
						.setTitle('User Profile Updated')
						.setColor(0x00AE86)
						.setAuthor({ name: newUser.tag, iconURL: newUser.displayAvatarURL({ dynamic: true }) });

					if (oldUser.tag !== newUser.tag) {
						Embed.addField('Tag', `${oldUser.tag} => ${newUser.tag}`);
					}
					if (oldUser.avatar !== newUser.avatar) {
						Embed.setDescription('Avatar Changed');
						Embed.setThumbnail(newUser.displayAvatarURL({ dynamic: true }));
					}
					if (Embed.fields.length > 0 || Embed.description) sendLogs(Embed, logs);
				}
			}
		}
	});
};