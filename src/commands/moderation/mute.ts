import { CommandInteraction } from 'discord.js';
import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { SlashCommandBuilder } from '@discordjs/builders';

const { guild: guildSchema } = require('../../schemas/guild');
const { mute: muteSchema } = require('../../schemas/mute');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mute')
		.setDescription('Restrict a user from writing messages.')
		.addSubcommand((subcommand: SlashCommandSubcommandBuilder) => subcommand
			.setName('user')
			.setDescription('Mute a user.')
			.addUserOption(option => option.setName('user').setDescription('The user you want to mute.').setRequired(true))
			.addStringOption(option => option.setName('reason').setDescription('Why do you want to mute the user?')))
		.addSubcommand((subcommand: SlashCommandSubcommandBuilder) => subcommand
			.setName('setup')
			.setDescription('Set up a muted role for this server.')),
	async execute(interaction: CommandInteraction) {
		switch (interaction.options.getSubcommand()) {
		case 'user':
			console.log(interaction.options.getUser('user', true));

			// Check if user is on server pls


			break;
		}
	},
};