module.exports = {
	name: 'prefix',
	description: 'Change the server\'s prefix.',
	args: 1,
	guild: true,
	permissions: 'ADMINISTRATOR',
	usage: ['[new prefix]'],
	async execute(message, args, client) {

		await client.schemas.get('guild').findOneAndUpdate({
			_id: message.guild.id,
		}, {
			_id: message.guild.id,
			prefix: args[0],
		}, {
			upsert: true,
		});

		message.channel.send(`Changed the server's prefix to \`${args[0]}\``);
	},
};