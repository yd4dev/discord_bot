module.exports = {
	name: 'filter',
	description: 'Create a message filter.',
	args: 1,
	guild: true,
	permissions: 'ADMINISTRATOR',
	usage: ['[words to filter (separated by comma)]'],
	async execute(message, args, client, prefix) {

		const words = message.content.slice(prefix.length + this.name.length).trim().split(',');

		let bannedWords = '';

		for (let i = 0; i < words.length; i++) {
			words[i] = words[i].trim();
			bannedWords = bannedWords + ' `' + words[i] + '`';
		}

		await client.data.save(message.guild.id, client, { bannedWords: words });

		message.channel.send(`Banned words ${bannedWords}`);
	},
};