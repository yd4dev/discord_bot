const DSB = require('dsbapi');
const scraper = require('table-scraper');
const Discord = require('discord.js');
const axios = require('axios');
const { JSDOM } = require('jsdom');

module.exports = {
	name: 'vplan',
	description: 'Redacted',
	args: false,
	usage: ['0', '1'],
	async getPlan(timetables, klasse, titles, day, vplanUsers) {
		const Embed = new Discord.MessageEmbed()
			.setTitle(titles[day].innerHTML + ' | ' + klasse)
			.setURL(timetables.data[0].url)
			.setFooter('Zuletzt aktualisiert: ' + timetables.data[0].date);

		const tableData = await scraper.get(timetables.data[0].url);

		tableData[day].forEach(entry => {
			if (entry['Klasse(n)'] == klasse) {
				const users = [];

				vplanUsers.forEach(user => {
					console.log(user);
					if (user.some(fach => fach == klasse.replace(/\s+/g, '').toLowerCase())) console.log(user);
				});

				Embed.addField('__' + entry['(Fach)'] + (entry['(Fach)'] !== entry['Fach'] && entry['Fach'] != '' ? (' => ' + entry['Fach']) : '') + '__',
					`St. ${entry['St.']} | Raum: ${entry['(Raum)']} ${(entry['(Raum)'] === entry['Raum'] ? '' : (' => ' + entry['Raum']))} \n ${entry['Art']} \n` + (entry['Hinweis'] !== '' ? 'Hinweis: ' + entry['Hinweis'] : ''));
			}
		});
		if (Embed.fields.length < 1) {
			Embed.setDescription('Keine Einträge für ' + klasse + ' gefunden.');
		}
		return Embed;
	},
	execute(message, args, client, prefix) {

		if (message.guild.id != 623904281837305869 && message.guild.id != 658323643629174784) return;

		if (args[0] === 'link') {
			args.shift();
			if (!args[0]) return message.channel.send('Please provide arguments.');
			(async () => {
				args = args.join(' ');
				args = args.split(',');

				for (let i = 0; i < args.length; i++) {
					args[i] = args[i].replace(/\s+/g, '').toLowerCase();
				}
				const UsersMap = client.data.guilds.get(message.guild.id).vplanUsers || new Map();

				UsersMap.set(message.author.id, args);

				await client.data.save(message.guild.id, client, { vplanUsers: UsersMap });
			})();
			return;
		}

		const dsb = new DSB('152902', 'Goethe');

		dsb.fetch()
			.then(async data => {
				const timetables = DSB.findMethodInData('timetable', data);

				const html = await axios.get(timetables.data[0].url);
				const dom = new JSDOM(html.data);

				const titles = dom.window.document.querySelectorAll('.mon_title');
				// titles[0].innerHTML

				const vplanUsers = client.data.guilds.get(message.guild.id).vplanUsers;

				if (titles[0]) {
					if (args[0] === '0') {
						message.channel.send(await this.getPlan(timetables, 'E1/2', titles, 0, vplanUsers));
					}
					else if (args[0] === '1') {
						message.channel.send(await this.getPlan(timetables, 'E1/2', titles, 1, vplanUsers));
					}
					else if (new Date().getUTCHours() < 13 && titles[0].innerHTML.startsWith(new Date().toLocaleDateString('de-DE'))) {
						message.channel.send(await this.getPlan(timetables, 'E1/2', titles, 0, vplanUsers));
					}
					else {
						message.channel.send(await this.getPlan(timetables, 'E1/2', titles, 1, vplanUsers));
					}
				}
				else {
					message.channel.send('Could not fetch data from\n' + timetables.data[0].url);
				}

			})
			.catch(e => {
				// An error occurred :(
				console.log(e);
			});
	},
};