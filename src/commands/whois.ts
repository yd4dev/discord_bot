import { CommandInteraction, ContextMenuInteraction, MessageEmbed } from 'discord.js';
import { DataClient } from '..';
import { SlashCommandUserOption } from '../../node_modules/@discordjs/builders/dist';

import { SlashCommandBuilder } from '@discordjs/builders';

import getLocale from '../locales/locales';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('whois')
		.setDescription('Get information about a user.')
		.addUserOption((option: SlashCommandUserOption) => option.setName('user').setRequired(true).setDescription('The user to get information about.')),
	async execute(interaction: CommandInteraction, client: DataClient) {
		whois(interaction, client);
	},
};

function whois(interaction: CommandInteraction | ContextMenuInteraction, client: DataClient) {
	const user = interaction.options.getUser('user');
	if (user) {
		user.fetch();
		const member = interaction.guild?.members.cache.get(user.id);

		const Embed = new MessageEmbed();

		if (member) {
			Embed.setTitle(`${member.displayName} (${member.user.tag})`)
				.setColor(member.displayColor)

				.addField(`\`${getLocale('JOINED', interaction)}\``, member.joinedTimestamp ? '<t:' + Math.floor(member.joinedTimestamp / 1000) + ':f>' : getLocale('UNKNOWN', interaction), true)
				.addField(`\`${getLocale('NICKNAME', interaction)}\``, member.nickname || getLocale('NONE', interaction), true)
				.addField(`\`${getLocale('TIMED_OUT', interaction)}\``, member.isCommunicationDisabled() ? getLocale('UNTIL', interaction, ['<t:' + Math.floor(member.communicationDisabledUntilTimestamp / 1000) + ':f>']) : getLocale('NO', interaction), true)
				.addField(`\`${getLocale('BOOSTING_SINCE', interaction)}\``, member.premiumSinceTimestamp ? '<t:' + Math.floor(member.premiumSinceTimestamp / 1000) + ':f>' : getLocale('NEVER', interaction), true);
		}
		else {
			Embed.setTitle(user.tag)
				.setColor(user.accentColor || '#7289DA');
		}
		Embed.setThumbnail(user.displayAvatarURL({ dynamic: true }))
			.addFields([
				{ name: `\`${getLocale('BOT', interaction)}\``, value: user.bot ? getLocale('YES', interaction) : getLocale('NO', interaction), inline: true },
				{ name: `\`${getLocale('ACCOUNT_CREATED', interaction)}\``, value: '<t:' + Math.floor(user.createdTimestamp / 1000) + ':f>', inline: true },
			])
			.setFooter({ text: `ID: ${user.id}` + (client && client.user ? ` | ${getLocale('MSG_INFORMATION_BROUGHT_TO_YOU_BY', interaction, [client.user.username])}` : ''), iconURL: client && client.user ? client.user.displayAvatarURL({ dynamic: true }) : undefined });

		if (user.flags && user.flags.toArray().length > 0) {
			Embed.addField(`\`${getLocale('FLAGS', interaction)}\``, user.flags.toArray().join(',\n'), true);
		}
		interaction.reply({ embeds: [Embed] });
	}
}