import { CommandInteraction, Message } from 'discord.js';

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Pong!'),
	async execute(interaction: CommandInteraction) {
		await interaction.deferReply()
			.then(async reply => { console.log(reply);});
		interaction.fetchReply()
			.then(async reply => {
				console.log(typeof reply);
				// const ping = reply.createdTimestamp - interaction.createdTimestamp;
				// await interaction.editReply(`🏓 Latency: ${ping}ms. API Latency is ${Math.round(interaction.client.ws.ping)}ms`);
			});
	},
};