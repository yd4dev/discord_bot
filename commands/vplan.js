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

		if (message.guild.id != 623904281837305869 && message.guild.id != 658323643629174784) return;

		async function getPlan(timetables, klasse, titles, day) {
			const Embed = new Discord.MessageEmbed()
				.setTitle(titles[day].innerHTML + ' | ' + klasse)
				.setURL(timetables.data[0].url)
				.setFooter(timetables.data[0].date)
				.setImage('https://dsbmobile.de/data/' + timetables.data[0].preview);

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

				if (new Date().getUTCHours() > 13) {
					message.channel.send(await getPlan(timetables, 'E1/2', titles, 1));
				}
				else {
					message.channel.send(await getPlan(timetables, 'E1/2', titles, 0));
				}

			})
			.catch(e => {
				// An error occurred :(
				console.log(e);
			});
	},
};