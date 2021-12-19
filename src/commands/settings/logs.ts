import { CommandInteraction, GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { DataClient } from '../..';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('logs')
		.setDescription('Set the logs channel for a server!')
		.addChannelOption(option => option.setName('channel').setDescription('The channel to set as the logs channel.').setRequired(true)),
	async execute(interaction: CommandInteraction, client: DataClient) {
		if (!interaction.guild || !(interaction.member instanceof GuildMember)) return;
		if (interaction.member.permissions.has('ADMINISTRATOR')) {
			const channel = interaction.options.getChannel('channel');
			if (!channel || !(channel instanceof TextChannel) || channel.guild !== interaction.guild) return interaction.reply('You must specify a valid channel.');
			await client.db.saveGuild(interaction.guild.id, { logs_channel: channel.id });
			const Embed = new MessageEmbed()
				.setDescription('The logs channel has been set to ' + channel.toString() + '.')
				.setColor(channel.guild.me?.displayColor || 0x00AE86);
			return interaction.reply({ embeds: [Embed] });
		}
		else {
			return interaction.reply('You must be an administrator to use this command.');
		}
	},
};