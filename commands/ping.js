module.exports = {
	name: 'ping',
    description: 'A simple test command.',
	args: false,
	usage: '%prefixping',
	execute(message, args, client, prefix) {
		message.reply('pong!')
	},
};