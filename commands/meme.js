const Discord = require('discord.js');
const snoowrap = require('snoowrap');
require('dotenv').config();

module.exports = {
	name: 'meme',
	description: 'Get the newest meme from r/memes.',
	args: false,
	async execute(message, args, client, prefix) {

		const keys = JSON.parse(process.env.reddit);

		const r = new snoowrap({
			userAgent: 'Discord Bot by u/Dennis1507.',
			clientId: keys.clientId,
			clientSecret: keys.clientSecret,
			refreshToken: keys.refreshToken,
		});

		const memes = r.getSubreddit('memes');

		const posts = await memes.getNew();

		message.channel.send(posts[0].url);

	},
};