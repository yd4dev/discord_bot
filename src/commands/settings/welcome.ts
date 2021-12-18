import { CommandInteraction, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { DataClient } from '../..';

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
		if (!interaction.guild) return interaction.reply('This command can only be used in a server.');
		const group = interaction.options.getSubcommandGroup();
		const command = interaction.options.getSubcommand();
		switch (group) {
		case 'role':
			switch (command) {
			case 'set': {
				const role = interaction.options.getRole('role');
				if (!role || !interaction.guild.roles.cache.get(role.id)) return interaction.reply('You must specify a valid role.');
				await client.db.saveGuild(interaction.guild.id, { welcome_role: role.id });
				const Embed = new MessageEmbed()
					.setDescription('The default role has been set to ' + role.toString() + '.')
					.setColor(role.color);
				return interaction.reply({ embeds: [Embed] });
			}
			}
		}
	},
};