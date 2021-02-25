module.exports = {
	name: 'ping',
	description: 'A simple test command.',
	args: false,
	execute(message) {
		message.reply('pong!')
	},
}