import { DataClient } from '..';

module.exports = (client: DataClient) => {
	client.on('messageCreate', (message) => {
		if (message.author.bot) return;
		if (!process.env.botOwner) return;
		if (message.channel.type === 'DM') {
			const botOwner = client.users.cache.get(process.env.botOwner);
			if (botOwner && message.author !== botOwner) botOwner.send(`${message.author.tag} sent a DM to the bot.\n\n${message.content}`);
		}
	});
};