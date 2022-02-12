import { CommandInteraction, GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { DataClient } from '../..';

import getLocale from '../../locales/locales';

module.exports = {
	command: new SlashCommandBuilder()
		.setName('logs')
		.setDescription('Set the logs channel for a server!')
		.addChannelOption(option => option.setName('channel').setDescription('The channel to set as the logs channel.').setRequired(true)),
	async execute(interaction: CommandInteraction, client: DataClient) {
		if (!interaction.guild || !(interaction.member instanceof GuildMember)) return;
		if (interaction.member.permissions.has('ADMINISTRATOR')) {
			const channel = interaction.options.getChannel('channel');
			if (!channel || !(channel instanceof TextChannel) || channel.guild !== interaction.guild) return interaction.reply(getLocale('MSG_MUST_SPECIFY_CHANNEL', interaction));
			await client.db.saveGuild(interaction.guild.id, { logs_channel: channel.id });
			const Embed = new MessageEmbed()
				.setDescription(getLocale('MSG_LOGS_CHANNEL_SET_TO', interaction, [channel.toString()]))
				.setColor(channel.guild.me?.displayColor || 0x00AE86);
			return interaction.reply({ embeds: [Embed] });
		}
		else {
			return interaction.reply(getLocale('MSG_MUST_BE_ADMIN', interaction));
		}
	},
};