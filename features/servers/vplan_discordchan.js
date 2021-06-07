// Discord Chan
const DSB = require('dsbapi');
const axios = require('axios');
const { JSDOM } = require('jsdom');

module.exports = client => {

	if (client.user.id != '668275621461360642') return;

	const channel = client.guilds.cache.get('623904281837305869').channels.cache.get('851159334930481224');

	(function checkForUpdate() {
		console.log('Running Function checkForUpdate() in vplan_discordchan');
		const lastUpdate = new Date(parseInt(channel.topic));
		if ((lastUpdate.getDay() < new Date().getDay() || lastUpdate.getMonth() < new Date().getMonth() || lastUpdate.getYear() < new Date().getYear()) && new Date().getUTCHours() > 4) {

			console.log('Checking for new Vertretungsplan Update');

			const dsb = new DSB('152902', 'Goethe');

			dsb.fetch()
				.then(async data => {
					const timetables = DSB.findMethodInData('timetable', data);

					const html = await axios.get(timetables.data[0].url);
					const dom = new JSDOM(html.data);

					const titles = dom.window.document.querySelectorAll('.mon_title');

					if (titles[0].innerHTML.startsWith(new Date().toLocaleDateString('de-DE'))) {
						channel.send(await require('../../commands/vplan').getPlan(timetables, 'E1/2', titles, 0));
						channel.setTopic(Date.now());
					}
				});
		}
		setTimeout(checkForUpdate, 900000);
	})();
};