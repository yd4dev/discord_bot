import { CommandInteraction, TextChannel } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

module.exports = {
	data: new SlashCommandBuilder()
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

		if (!message) return interaction.reply({ content:'You must provide a message!', ephemeral:true });

		if (!channel && !user) {
			return interaction.reply({ content: 'You must specify a ' + interaction.options.getSubcommand() + '.', ephemeral: true });
		}

		if (channel && channel instanceof TextChannel) {
			await channel.send(message);
			return interaction.reply({ content: 'Message sent to <#' + channel.id + '>!', ephemeral: true });
		}
		else if (user) {
			if (interaction.user.id === process.env.botOwner) {
				await user.send(message);
				return interaction.reply({ content: 'Message sent to <@' + user.id + '>!', ephemeral: true });
			}
			else {
				await interaction.reply('You are not allowed to use that command.');
			}
		}
	},
};