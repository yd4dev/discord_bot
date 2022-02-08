import { ContextMenuInteraction } from 'discord.js';
import { ContextMenuCommandBuilder } from '@discordjs/builders';
import { ApplicationCommandType } from 'discord-api-types/v9';
import { DataClient } from '..';

module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName('Whois')
		.setType(ApplicationCommandType.User),
	async execute(interaction: ContextMenuInteraction, client: DataClient) {
		require('../commands/whois').execute(interaction, client);
	},
};