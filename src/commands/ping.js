module.exports = {
	name: 'ping',
	description: 'Pong!',
	async execute(interaction, client) {
		const reply = await interaction.reply('Pinging...');
		console.log(reply);
		const ping = reply.createdTimestamp - interaction.createdTimestamp;
		await interaction.editReply(`🏓 Latency: ${ping}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
	},
};