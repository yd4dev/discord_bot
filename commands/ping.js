const Discord = require('discord.js');

module.exports = {
	name: 'ping',
	description: 'A command that shows the bot\'s ping.',
	args: false,
	execute(message, args, client, prefix) {

		// It sends the user "Pinging"
		message.channel.send('Pinging...').then(m =>{

			const ping = m.createdTimestamp - message.createdTimestamp;

			const Embed = new Discord.MessageEmbed()
				.setAuthor(`🏓 Latency: ${ping}ms. API Latency is ${Math.round(client.ws.ping)}ms`)
				.setColor('BLUE');

			// Then It Edits the message with the ping variable embed that you created
			m.edit(Embed);
		});
	},
};