import { CommandInteraction, GuildMember, Message, MessageActionRow, MessageButton } from 'discord.js';
import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { SlashCommandBuilder } from '@discordjs/builders';
import { DataClient } from '../../index';

import muteSchema from '../../schemas/mute';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mute')
		.setDescription('Restrict a user from writing messages.')
		.addSubcommand((subcommand: SlashCommandSubcommandBuilder) => subcommand
			.setName('user')
			.setDescription('Mute a user.')
			.addUserOption(option => option.setName('user').setDescription('The user you want to mute.').setRequired(true))
			.addStringOption(option => option.setName('length').setDescription('The length of the mute.').setRequired(true))
			.addStringOption(option => option.setName('reason').setDescription('Why do you want to mute the user?')))
		.addSubcommand((subcommand: SlashCommandSubcommandBuilder) => subcommand
			.setName('setup')
			.setDescription('Set up a muted role for this server.')),
	async execute(interaction: CommandInteraction, client: DataClient) {
		if (!interaction.guild) return interaction.reply('This command can only be used in a server.');
		if (!(interaction.member instanceof GuildMember)) return new Error('Invalid interaction member.');
		switch (interaction.options.getSubcommand()) {
		case 'user': {
			const member = interaction.guild.members.cache.get(interaction.options.getUser('user', true).id);

			// Check if user is on server
			if (!member) return interaction.reply('The user you specified is not on this server.');

			// Check if length option is valid
			const length = interaction.options.getString('length');
			if (!length) return;
			if (!length.match(/^\d+[smhd]$/)) return interaction.reply({ content: 'The length you specified is not valid. Please use a number followed by a time unit (s, m, h, d).', ephemeral: true });

			// Convert length to milliseconds
			let lengthMs = parseInt(length.replace(/[^\d]/g, ''));
			const lengthUnit = length.replace(/[^smhd]/g, '').toLowerCase();
			switch (lengthUnit) {
			case 's':
				lengthMs *= 1000;
				break;
			case 'm':
				lengthMs *= 60000;
				break;
			case 'h':
				lengthMs *= 3600000;
				break;
			case 'd':
				lengthMs *= 86400000;
				break;
			}

			// Check if user is already muted
			const muted = await muteSchema.findOne({ guildId: interaction.guild.id, userId: interaction.options.getUser('user', true).id });
			if (muted) {

				const row = new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setCustomId('accept')
							.setLabel('Yes')
							.setStyle('PRIMARY'),
						new MessageButton()
							.setCustomId('decline')
							.setLabel('No')
							.setStyle('SECONDARY'),
					);

				const reply = await interaction.reply({ content: `The user you specified is already muted until <t:${Math.floor(Date.parse(muted.expires) / 1000)}:F>. Do you wish to extend the duration of the mute?`, components: [row], fetchReply: true });
				if (!(reply instanceof Message)) return;
				const collector = reply.createMessageComponentCollector({ componentType: 'BUTTON', time: 60000 });

				collector.on('collect', async i => {
					if (!i.component || !i.guild || !(i.component instanceof MessageButton) || !(i.member instanceof GuildMember) || !(interaction.member instanceof GuildMember)) return;
					if (i.member.id !== interaction.member.id) return;
					if (i.component.customId === 'accept') {
						// Extend mute length by the length specified
						muted.expires = new Date(Date.parse(muted.expires) + lengthMs);
						await muted.save();
						collector.stop();
						row.components.forEach(c => c.setDisabled(true));
						i.reply({ content: 'The mute has been extended.', ephemeral: true });
						interaction.editReply({ components: [row] });
					}
					else if (i.component.customId === 'decline') {
						// Close Collector and disable buttons
						collector.stop();
						row.components.forEach(c => c.setDisabled(true));
						i.reply({ content: 'The mute has been cancelled.', ephemeral: true });
						interaction.editReply({ components: [row] });
					}
				});
			}
			else {
				const mutedRole: string = (await client.db.loadGuild(interaction.guild.id)).mutedRole;
				if (!mutedRole) return interaction.reply({ content: 'There is no muted role set up for this server. Use `/mute setup` to set one up.', ephemeral: true });

				// Take user's current roles, save their ids into an array

				const roles = member.roles.cache.entries();
				const roleIds = [];
				for (const role of roles) {
					if (role[1].name !== '@everyone') {
						roleIds.push(role[1].id);
						member.roles.remove(role[1]);
					}
				}
				member.roles.add(mutedRole);

				// Create mute

				const mute = new muteSchema({
					guildId: interaction.guild.id,
					userId: interaction.options.getUser('user', true).id,
					userRoles: roleIds,
					moderatorId: interaction.member.id,
					expires: new Date(Date.now() + lengthMs),
					reason: interaction.options.getString('reason') || 'No reason specified.',
				});
				await mute.save();
				interaction.reply({ content: 'The user has been muted.', ephemeral: true });
			}
			break;
		}
		}
	},
};