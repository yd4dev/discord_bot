const Discord = require('discord.js');
const snoowrap = require('snoowrap');
const fs = require('fs');
require('dotenv').config();

const cache = [];

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

		const posts = await memes.getHot();

		for (let i = 0; ; i++) {

			const post = posts[i];

			if (!cache.includes(post.id) && post.url && !post.stickied) {
				cache.push(post.id);
				if (post.media?.reddit_video?.fallback_url) {
					return message.channel.send(post.url + '\n' + post.media?.reddit_video?.fallback_url);
				}
				else {
					const Embed = new Discord.MessageEmbed()
						.setTitle(post.title)
						.setURL(`https://reddit.com${post.permalink}`)
						.setAuthor(post.author.name)
						.setFooter('Uploaded')
						.setTimestamp(post.created_utc * 1000)
						.setImage(post.url);

					return message.channel.send(Embed);
				}
			}
		}
	},
};