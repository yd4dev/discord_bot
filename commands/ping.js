module.exports = {
	name: 'ping',
    description: 'A simple test command.',
    args: false,
	execute(message, args, client, prefix) {
		message.reply('pong!')
	},
};