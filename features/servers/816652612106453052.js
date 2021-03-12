const path = require('path');
const scriptName = path.basename(__filename, '.js');

module.exports = client => {

	client.on('message', (message) => {

		if (message.guild.id != scriptName) return;

		if (message.content.toLowerCase().match(/ä|ö|ü/)) {
			message.channel.send('Did you just use an UMLAUT?!? 🤬');
		}

	});

};