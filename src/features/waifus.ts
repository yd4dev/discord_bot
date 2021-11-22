import { DataClient } from '..';
import https from 'https';
import { TextChannel } from 'discord.js';

module.exports = (client: DataClient) => {
	client.on('ready', async () => {
		console.log(client.db);
		for (const guild of client.guilds.cache.values()) {
			const settings = await client.db.loadGuild(guild.id);
			if (settings && settings.waifusChannel && settings.waifusMessage) {
				const channel = guild.channels.cache.get(settings.waifusChannel);
				if (channel && channel instanceof TextChannel) {
					const message = await channel.messages.fetch(settings.waifusMessage);
					if (message) {
						message.react('💙');
						// TODO: Add waifu fetch and send code
					}
				}
			}
		}
	});

	console.log('Waifus module ready');
};