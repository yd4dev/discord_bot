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
	execute(message, args, client, prefix) {

		if (message.guild.id != 623904281837305869 && message.guild.id != 658323643629174784) return;

		async function getPlan(timetables, klasse, titles, day) {
			const Embed = new Discord.MessageEmbed()
				.setTitle(titles[day].innerHTML + ' | ' + klasse)
				.setURL(timetables.data[0].url)
				.setFooter('Zuletzt aktualisiert: ' + timetables.data[0].date);

			const tableData = await scraper.get(timetables.data[0].url);

			tableData[day].forEach(entry => {
				if (entry['Klasse(n)'] == klasse) {
					Embed.addField('__' + entry['(Fach)'] + (entry['(Fach)'] !== entry['Fach'] && entry['Fach'] != '' ? (' => ' + entry['Fach']) : '') + '__',
						`St. ${entry['St.']} | Raum: ${entry['(Raum)']} ${(entry['(Raum)'] === entry['Raum'] ? '' : (' => ' + entry['Raum']))} \n ${entry['Art']} \n` + (entry['Hinweis'] !== '' ? 'Hinweis: ' + entry['Hinweis'] : ''));
				}
			});
			if (Embed.fields.length < 1) {
				Embed.setDescription('Keine Einträge für ' + klasse + ' gefunden.');
			}
			return Embed;
		}

		const dsb = new DSB('152902', 'Goethe');

		dsb.fetch()
			.then(async data => {
				const timetables = DSB.findMethodInData('timetable', data);

				const html = await axios.get(timetables.data[0].url);
				const dom = new JSDOM(html.data);

				const titles = dom.window.document.querySelectorAll('.mon_title');
				// titles[0].innerHTML

				if (args[0] === '0') {
					message.channel.send(await getPlan(timetables, 'E1/2', titles, 0));
				}
				else if (args[0] === '1') {
					message.channel.send(await getPlan(timetables, 'E1/2', titles, 1));
				}
				else if (new Date().getUTCHours() < 13 && titles[0].innerHTML.startsWith(new Date().toLocaleDateString())) {
					message.channel.send(await getPlan(timetables, 'E1/2', titles, 0));
				}
				else {
					message.channel.send(await getPlan(timetables, 'E1/2', titles, 1));
				}
			})
			.catch(e => {
				// An error occurred :(
				console.log(e);
			});
	},
};