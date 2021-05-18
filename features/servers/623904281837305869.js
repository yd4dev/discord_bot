// Der allerbeste Server EU West

const path = require('path');
const scriptName = path.basename(__filename, '.js');

module.exports = client => {

	client.on('message', (message) => {

		if (message.content.indexOf('<@104537226192371712>') > -1 || message.content.indexOf('<@!104537226192371712>') > -1) {
			setTimeout(() => {
				message.channel.send('<@' + message.member.id + '>');
			}, 600);
		}
	});
};