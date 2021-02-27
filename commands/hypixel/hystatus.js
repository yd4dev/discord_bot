const Discord = require('discord.js');
const https = require('https');
const gameTypes = require('./gameTypes.json');

module.exports = {
	name: 'hystatus',
	description: 'Check if a player is online on hypixel.',
	args: true,
	usage: ['<Username>'],
	async execute(message, args) {

		let success = true;

		const { name, id: UUID } = await this.getUUID(args[0])
			.catch(err => {
				message.channel.send(err);
				return success = false;
			});

		if (!success) return;

		const { online, gameType, mode } = await this.getStatus(UUID)
			.catch(err => {
				message.channel.send(err);
				return success = false;
			});

		if (!success) return;

		const Embed = new Discord.MessageEmbed()
			.setTitle('Hypixel - ' + name)
			.addField('Status', online ? `🟢 Online in ${gameTypes[gameType]}\n${mode}` : '🔴 Offline');


		message.channel.send(Embed);

	},
	getUUID(search) {

		return new Promise((resolve, reject) => {

			https.get(`https://api.mojang.com/users/profiles/minecraft/${search}`, (res) => {

				let data = '';
				res.on('data', (chunk) => {
					data += chunk;
				});

				res.on('end', () => {

					if (data) {
						resolve(JSON.parse(data));
					}
					else {
						reject('No player found.');
					}
				});
				res.on('error', (error) => {

					reject(error);
				});
			});
		});
	},
	getStatus(UUID) {

		return new Promise((resolve, reject) => {

			https.get(`https://api.hypixel.net/status?key=${process.env.hyAPI}&uuid=${UUID}`, (res) => {

				let data = '';
				res.on('data', (chunk) => {
					data += chunk;
				});

				res.on('end', () => {

					resolve(JSON.parse(data).session);
				});

				res.on('error', (error) => {

					reject(error);

				});
			});
		});
	},
};