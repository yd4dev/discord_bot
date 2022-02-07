import { ColorResolvable, CommandInteraction, Message, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import getLocale from '../locales/locales';
import { request, gql } from 'graphql-request';
import mal from 'mal-scraper';
import AnimeSyncSchema from '../schemas/animesync';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('anime')
		.setDescription('Search for anime!')
		.addSubcommand(subcommand => subcommand.setName('search')
			.setDescription('Search for an anime!')
			.addStringOption(option => option.setName('name')
				.setDescription('The name of the anime to search for!')
				.setRequired(true)))
		.addSubcommand(subcommand => subcommand.setName('sync')
			.setDescription('Sync your anime list!')
			.addStringOption(option => option.setName('site')
				.setDescription('The site to sync from!')
				.addChoices([['mal', 'mal'], ['anilist', 'anilist']])
				.setRequired(true))
			.addStringOption(option => option.setName('name').setDescription('Your username').setRequired(true))),
	async execute(interaction: CommandInteraction) {
		await interaction.deferReply();
		switch (interaction.options.getSubcommand(true)) {
		case 'search': {
			const name = interaction.options.getString('name');
			let userlistsquery = '';

			if (interaction.guild) {
				const dblists = await AnimeSyncSchema.find({ '_id': { $in: interaction.guild.members.cache.map(m => m.id) } });
				for (const user of dblists) {
					if (user.anilist) {
						userlistsquery += `_${user._id}: MediaListCollection(userName: "${user.anilist}", type:ANIME) {
							lists {
								entries {
									score
									media {
										id
									}
								}
							}
						}`;
					}
				}
			}

			const query = gql`
			{
				Page {
					media(search: "${name}", type: ANIME) {
						id
						idMal
						title {
							romaji
							english
							native
						}
						episodes
						description
						genres
						format
						status
						averageScore
						isAdult
						siteUrl
						coverImage {large}
					}
				}
				${userlistsquery}
			}
`;

			request('https://graphql.anilist.co', query).then(async data => {
				let index = 0;

				const row = new MessageActionRow()
					.addComponents([new MessageButton().setCustomId('next').setLabel('Nah').setStyle('DANGER'),
						new MessageButton().setLabel('AniList').setStyle('LINK').setURL(data.Page.media[0].siteUrl),
						new MessageButton().setLabel('MAL').setStyle('LINK').setURL(`https://myanimelist.net/anime/${data.Page.media[0].idMal}`)]);

				interaction.editReply({ embeds: [await getInfo(data, index, interaction)], components: [row] }).then(message => {
					if (!(message instanceof Message)) return;
					message.createMessageComponentCollector({ componentType: 'BUTTON', time: 60000 })
						.on('collect', async collected => {
							if (!(collected.component instanceof MessageButton)) return;
							if (collected.component.customId === 'next') {
								if (collected.member === interaction.member) {
									index++;
									(row.components[1] as MessageButton).setURL(data.Page.media[index].siteUrl);
									(row.components[2] as MessageButton).setURL(`https://myanimelist.net/anime/${data.Page.media[index].idMal}`);
									message.edit({ embeds: [await getInfo(data, index, interaction)], components: [row] });

									await collected.reply({ content: 'Here you go!', fetchReply: true }).then(reply => {
										// eslint-disable-next-line max-nested-callbacks
										if (reply instanceof Message) setTimeout(() => reply.delete(), 1000);
									});
								}
								else {
									return collected.reply({ content: getLocale('MSG_NOT_YOUR_MESSAGE', interaction), ephemeral: true });
								}
							}
						})
						.on('end', async () => {
							row.components[0].setDisabled(true);
							interaction.editReply({ embeds: [await interaction.fetchReply().then(reply => reply.embeds[0])], components: [row] });
						});
				});
			}).catch(err => {
				if (err.response?.errors[0]?.message === 'Not Found.') {
					interaction.editReply(getLocale('ERR_NOT_FOUND', interaction));
				}
				else {
					throw new Error(err);
				}
			});
		}
			break;
		case 'sync': {
			const site = interaction.options.getString('site');
			const name = interaction.options.getString('name');
			if (!site) return interaction.reply(getLocale('ERR_MISSING_ARGUMENT', interaction, ['site']));
			if (!name) return interaction.reply(getLocale('ERR_MISSING_ARGUMENT', interaction, ['name']));

			let data;

			if (site === 'mal') {
				data = { user: interaction.user.id, mal: name };
			}
			else if (site === 'anilist') {
				data = { user: interaction.user.id, anilist: name };
			}
			else {
				return interaction.reply(getLocale('ERR_INVALID_ARGUMENT', interaction, ['site']));
			}

			AnimeSyncSchema.findOneAndUpdate({ _id: interaction.user.id }, data, { upsert: true }).then(() => {
				interaction.editReply('Successfully saved!');
			});
		}
			break;
		default:
			interaction.editReply(getLocale('ERR_UNKNOWN_SUBCOMMAND', interaction));
			break;
		}
	},
};

async function getInfo(data: any, index: number, interaction?: CommandInteraction): Promise<MessageEmbed> {
	const media = data.Page.media[index];
	const title = media.title.romaji ?? media.title.english ?? media.title.native;
	const rating = media.averageScore;
	const stars = '⭐'.repeat(Math.round(rating / 20));

	const colors = {
		'NOT_YET_RELEASED': '#ffc107',
		'RELEASING': '#88fc03',
		'FINISHED': '#03bafc',
		'CANCELLED': '#dc3545',
		'HIATUS': '#fc5203',
	};

	const embed = new MessageEmbed()
		.setTitle(title + ` (${stars})`)
		.setImage(media.coverImage.large)
		.setDescription(media.description.replace(/<br>/g, '\n').replace(/<i>/g, '_').replace(/<\/i>/g, '_').replace(/<[^>]*>/g, '').replace(/\n\n/g, '\n'))
		.setURL(media.siteUrl)
		.setColor(colors[media.status as keyof typeof colors] as ColorResolvable)
		.setFooter({ text: (media.title.english ? media.title.english + (media.title.native ? ' | ' + media.title.native : '') : media.title.native || '') + ' | Source: AniList.co', iconURL: 'https://anilist.co/img/icons/android-chrome-512x512.png' });


	if (interaction?.guild) {
		// AniList User Ratings

		for (const id in data) {
			const user = data[id];
			if (user.lists) {
				for (const list of user.lists) {
					for (const entry of list.entries) {
						if (entry.media.id === media.id) {
							if (entry.score) {
								const member = interaction.guild.members.cache.get(id.slice(1));
								if (member) embed.addField(member.user.tag, '⭐'.repeat(Math.round(entry.score / 2)) ?? '0', true);
							}
						}
					}
				}
			}
		}
		// MyAnimeList User Ratings

		const dblists = await AnimeSyncSchema.find({ '_id': { $in: interaction.guild.members.cache.map(m => m.id) } });

		for (const user of dblists) {
			if (user.mal) {
				const maldata = await mal.getWatchListFromUser(user.mal).catch(() => null);
				if (maldata) {
					for (const anime of maldata) {
						if ((anime.animeId === media.idMal) && anime.score) {
							const member = interaction.guild.members.cache.get(user._id);
							if (member) embed.addField(member.user.tag, '⭐'.repeat(Math.round((anime.score ?? 0) / 2)) ?? '0', true);
						}
					}
				}
			}
		}
	}
	return embed;
}