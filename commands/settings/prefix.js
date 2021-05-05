module.exports = {
	name: 'prefix',
	description: 'Change the server\'s prefix.',
	args: 1,
	guild: true,
	permissions: 'ADMINISTRATOR',
	usage: ['[new prefix]'],
	async execute(message, args, client) {

		if (args[0].length < 1000) {

			client.data.save(message.guild.id, client, { prefix: args[0] });

			message.channel.send(`Changed the server's prefix to \`${args[0]}\``);
		}
		else {
			message.channel.send('Let\'s keep the prefix under 1000 characters.');
		}
	},
};