import { CommandInteraction, Message } from 'discord.js';

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Pong!'),
	async execute(interaction: CommandInteraction) {
		await interaction.deferReply({ fetchReply: true })
			.then(async reply => {

				if (reply instanceof Message) {
					const ping = reply.createdTimestamp - interaction.createdTimestamp;
					await interaction.editReply(`🏓 Latency: ${ping}ms. API Latency is ${Math.round(interaction.client.ws.ping)}ms`);
				}
			});
	},
};