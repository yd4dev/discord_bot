import { CommandInteraction, MessageEmbed } from 'discord.js';
import { DataClient } from '..';
import { SlashCommandUserOption } from '../../node_modules/@discordjs/builders/dist';

import { SlashCommandBuilder } from '@discordjs/builders';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('whois')
		.setDescription('Get information about a user.')
		.addUserOption((option: SlashCommandUserOption) => option.setName('user').setRequired(true).setDescription('The user to get information about.')),
	async execute(interaction: CommandInteraction, client: DataClient) {
		const user = interaction.options.getUser('user');
		if (user) {
			user.fetch();
			const member = interaction.guild?.members.cache.get(user.id);

			const Embed = new MessageEmbed();

			if (member) {
				Embed.setTitle(`${member.displayName} (${member.user.tag})`)
					.setColor(member.displayColor)

					.addField('`Joined`', member.joinedTimestamp ? '<t:' + Math.floor(member.joinedTimestamp / 1000) + ':f>' : 'Unknown', true)
					.addField('`Nickname`', member.nickname || 'None', true)
					.addField('`Muted`', member.roles.cache.some(role => role.name === 'Muted') ? 'Yes' : 'No', true)
					.addField('`Boosting since`', member.premiumSinceTimestamp ? '<t:' + Math.floor(member.premiumSinceTimestamp / 1000) + ':f>' : 'None', true);
			}
			else {
				Embed.setTitle(user.tag)
					.setColor(user.accentColor || '#7289DA');
			}
			Embed.setThumbnail(user.displayAvatarURL({ dynamic: true }))
				.addFields([
					{ name: '`Bot`', value: user.bot ? 'Yes' : 'No', inline: true },
					{ name: '`Account Created`', value: '<t:' + Math.floor(user.createdTimestamp / 1000) + ':f>', inline: true },
				])
				.setFooter(`ID: ${user.id}` + (client && client.user ? ` | Information brought to you by ${client.user.username}` : ''));

			if (user.flags) {
				Embed.addField('`Flags`', user.flags.toArray().join(',\n'), true);
			}
			interaction.reply({ embeds: [Embed] });
		}
	},
};