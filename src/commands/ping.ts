import { CommandInteraction, Message } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import getLocale from '../locales/locales';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Pong!'),
	async execute(interaction: CommandInteraction) {
		await interaction.deferReply({ fetchReply: true })
			.then(async reply => {

				if (reply instanceof Message) {
					const ping = reply.createdTimestamp - interaction.createdTimestamp;
					await interaction.editReply(getLocale('MSG_PING', interaction, [ping.toString(), interaction.client.ws.ping]));
				}
			});
	},
};