const DSB = require('dsbapi');
const scraper = require('table-scraper');
const Discord = require('discord.js');
const axios = require('axios');
const { JSDOM } = require('jsdom');

module.exports = {
	name: 'vplan',
	description: 'Redacted',
	args: false,
	execute(message, args, client, prefix) {

		async function getPlan(timetables, klasse, titles, day) {
			const Embed = new Discord.MessageEmbed()
				.setTitle(titles[day].innerHTML + ' | ' + klasse);

			const tableData = await scraper.get(timetables.data[0].url);

			tableData[day].forEach(entry => {
				if (entry['Klasse(n)'] == klasse) {
					Embed.addField('__' + entry['(Fach)'] + (entry['(Fach)'] !== entry['Fach'] && entry['Fach'] != '' ? (' => ' + entry['Fach']) : '') + '__',
						`St. ${entry['St.']} | Raum: ${entry['(Raum)']} ${(entry['(Raum)'] === entry['Raum'] ? '' : (' => ' + entry['Raum']))} \n ${entry['Art']} \n` + (entry['Hinweis'] !== '' ? 'Hinweis: ' + entry['Hinweis'] : ''));
				}
			});
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

				message.channel.send(await getPlan(timetables, 'Q1/2', titles, 0));
				message.channel.send(await getPlan(timetables, 'Q1/2', titles, 1));

			})
			.catch(e => {
				// An error occurred :(
				console.log(e);
			});
	},
};