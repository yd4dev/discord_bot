import { CommandInteraction, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { DataClient } from '../..';

import getLocale from '../../locales/locales';

const role_set = new SlashCommandSubcommandBuilder()
	.setName('set')
	.setDescription('Sets the default role.')
	.addRoleOption(option => option.setName('role').setDescription('The role to set as the default role.').setRequired(true));

module.exports = {
	data: new SlashCommandBuilder()
		.setName('welcome')
		.setDescription('Change what happens when a new member joins the server.')
		.addSubcommandGroup(subcommandGroup => subcommandGroup.setName('role').setDescription('Change the default role for someone who joins the server.').addSubcommand(role_set)),

	async execute(interaction: CommandInteraction, client: DataClient) {
		if (!interaction.guild) return interaction.reply(getLocale('MSG_COMMAND_ONLY_IN_GUILD', interaction));
		const group = interaction.options.getSubcommandGroup();
		const command = interaction.options.getSubcommand();
		switch (group) {
		case 'role':
			switch (command) {
			case 'set': {
				const role = interaction.options.getRole('role');
				if (!role || !interaction.guild.roles.cache.get(role.id)) return interaction.reply(getLocale('MSG_MUST_SPECIFY_ROLE', interaction));
				await client.db.saveGuild(interaction.guild.id, { welcome_role: role.id });
				const Embed = new MessageEmbed()
					.setDescription(getLocale('MSG_DEFAULT_ROLE_SET_TO', interaction, [role.toString()]))
					.setColor(role.color);
				return interaction.reply({ embeds: [Embed] });
			}
			}
		}
	},
};