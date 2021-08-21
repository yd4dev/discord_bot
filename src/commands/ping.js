const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Pong!'),
	async execute(interaction) {
		await interaction.deferReply();
		interaction.fetchReply()
			.then(async reply => {
				const ping = reply.createdTimestamp - interaction.createdTimestamp;
				await interaction.editReply(`🏓 Latency: ${ping}ms. API Latency is ${Math.round(interaction.client.ws.ping)}ms`);
			});
	},
};