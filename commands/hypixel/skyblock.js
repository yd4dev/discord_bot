const Discord = require('discord.js');
const https = require('https');
const hystatus = require('./hystatus');
const nbt = require('nbt');
const fs = require('fs');

const emojis = {
	'Apple': '🍏',
	'Banana': '🍌',
	'Blueberry': '🫐',
	'Coconut': '🥥',
	'Cucumber': '🥒',
	'Grapes': '🍇',
	'Kiwi': '🥝',
	'Lemon': '🍋',
	'Lime': '🍈',
	'Mango': '🥭',
	'Orange': '🍊',
	'Papaya': '🥑',
	'Peach': '🍑',
	'Pear': '🍐',
	'Pineapple': '🍍',
	'Pomegranate': '🍎',
	'Raspberry': '🍇',
	'Strawberry': '🍓',
	'Tomato': '🍅',
	'Watermelon': '🍉',
	'Zucchini': '🥒',
};

module.exports = {
	name: 'skyblock',
	description: 'View Hypixel Skyblock Stats of a Player',
	args: 1,
	usage: ['<Username>', '<Username> <Profile Name>'],
	async execute(message, args, client, prefix) {

		let success = true;

		const { id: UUID, name } = await hystatus.getUUID(args[0])
			.catch(err => {
				message.channel.send(err);
				return success = false;
			});

		if (!success) return;

		const { online } = await hystatus.getStatus(UUID);

		const profiles = (await this.getProfiles(name)).profiles;

		if (!profiles) return message.channel.send('🛑 That player has no SkyBlock profiles.');

		if (!args[1] || !Object.values(profiles).some(p => p.cute_name.toLowerCase() === args[1].toLowerCase())) {

			const cute_names = [];

			console.log(profiles);

			for (const profile in profiles) {
				cute_names.push(emojis[profiles[profile].cute_name] + ' ' + profiles[profile].cute_name + (profiles[profile].current ? ' <ACTIVE>' : ''));
			}

			const Embed = new Discord.MessageEmbed()
				.setTitle(name)
				.setAuthor((online ? '🟢' : '🔴') + ' ' + (online ? 'Online' : 'Offline'))
				.addField('Profiles', cute_names.join('\n'))
				.setFooter(`Use ${prefix}${this.name} ${this.usage[1]} for more information.`);

			message.channel.send(Embed);
		}
		else {

			const profile = Object.values(profiles).find(p => p.cute_name.toLowerCase() === args[1].toLowerCase());

			const balance = profile.data.bank ? profile.data.bank.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : 'Hidden';

			let armor = '';

			profile.items.armor.forEach(a => {
				armor += a.display_name + '\n';
			});

			const Embed = new Discord.MessageEmbed()
				.setTitle(name + ' - ' + emojis[profile.cute_name] + ' ' + profile.cute_name)
				.setAuthor((online ? '🟢' : '🔴') + ' ' + (online ? 'Online' : 'Offline'))
				.addField('Account Balance', balance)
				.addField('Armor', armor);

			message.channel.send(Embed);

		}


	},
	getProfiles(UUID) {

		return new Promise((resolve, reject) => {

			https.get(`https://sky.shiiyu.moe/api/v2/profile/${UUID}`, (res) => {

				let data = '';
				res.on('data', (chunk) => {
					data += chunk;
				});

				res.on('end', () => {

					resolve(JSON.parse(data));
				});

				res.on('error', (error) => {

					reject(error);

				});
			});
		});
	},
};