import { CommandInteraction, GuildMember, TextChannel, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { DataClient } from '../../..';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('waifus')
		.setDescription('Set a channel for waifus to appear.')
		.addChannelOption(option => option.setName('channel').setDescription('The channel to send your waifus to.')),
	async execute(interaction: CommandInteraction, client: DataClient) {

		if (interaction.member instanceof GuildMember) {
			if (interaction.member.permissions.has('MANAGE_CHANNELS')) {
				const channel = interaction.options.getChannel('channel');
				if (channel instanceof TextChannel && channel.guild === interaction.guild) {
					const message = await channel.send({ embeds: [
						new MessageEmbed()
							.setImage(interaction.guild?.iconURL({ format: 'png', dynamic: true }) || ''),
					] });

					const oldSettings = await client.db.loadGuild(interaction.guild.id);
					if (oldSettings) {
						const oldChannel = interaction.guild.channels.cache.get(oldSettings.waifusChannel || '');
						if (oldChannel instanceof TextChannel) {
							oldChannel.messages.fetch(oldSettings.waifusMessage || '').then(m => {
								if (m) {
									m.delete();
								}
							});
						}
					}

					if (message) {

						await client.db.saveGuild(interaction.guild.id, {
							waifusChannel: channel.id,
							waifusMessage: message.id,
						});
						interaction.reply('Waifus will now appear in ' + channel.toString() + '.');
					}
					else {
						interaction.reply({ content: 'Could not send a message to that channel.', ephemeral: true });
					}
				}
			}
			else {
				return interaction.reply({ content: 'You are missing permissions for this command.', ephemeral: true });
			}
		}
		else {throw new Error();}
	},
};