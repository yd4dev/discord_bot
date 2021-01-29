module.exports = {
	name: 'ping',
	description: 'A simple test command.',
	args: false,
	usage: '%prefixping',
	execute(message) {
		message.reply('pong!')
	},
};