import { CommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

import getLocale from '../locales/locales';

module.exports = {
	command: new SlashCommandBuilder()
		.setName('message')
		.setDescription('Write a message!')
		.addSubcommand((command) =>
			command.setName('channel')
				.setDescription('Write a message to a channel!')
				.addChannelOption(option => option.setName('channel').setDescription('The channel to write the message to.').setRequired(true))
				.addStringOption(option => option.setName('message').setDescription('The message to write.').setRequired(true)),
		)
		.addSubcommand((command) =>
			command.setName('user')
				.setDescription('Write a message to a user!')
				.addUserOption(option => option.setName('user').setDescription('The user to write the message to.').setRequired(true))
				.addStringOption(option => option.setName('message').setDescription('The message to write.').setRequired(true)),
		),
	async execute(interaction: CommandInteraction) {
		const channel = interaction.options.getChannel('channel');
		const message = interaction.options.getString('message');
		const user = interaction.options.getUser('user');

		if (!message) return interaction.reply({ content:getLocale('MSG_MUST_PROVIDE_MESSAGE', interaction), ephemeral:true });

		if (!channel && !user) {
			return interaction.reply({ content: getLocale('MSG_MUST_SPECIFY', interaction, [interaction.options.getSubcommand()]), ephemeral: true });
		}

		if (channel && channel instanceof TextChannel) {
			if (interaction.member instanceof GuildMember && interaction.member.permissions.has('MANAGE_MESSAGES')) {
				await channel.send(message);
				return interaction.reply({ content: getLocale('MSG_MSG_SENT_TO', interaction, ['<#' + channel.id + '>']), ephemeral: true });
			}
			else {
				return interaction.reply({ content: getLocale('MSG_NO_PERMISSION_SEND_MESSAGES_IN_GUILD', interaction), ephemeral: true });
			}
		}
		else if (user) {
			if (interaction.user.id === process.env.botOwner) {
				await user.send(message);
				return interaction.reply({ content: getLocale('MSG_MSG_SENT_TO', interaction, ['<#' + user.id + '>']), ephemeral: true });
			}
			else {
				await interaction.reply(getLocale('MSG_NOT_ALLOWED_USE_COMMAND', interaction));
			}
		}
	},
};