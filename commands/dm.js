module.exports = {
	name: 'dm',
	description: 'A simple test command.',
	args: true,
	permissions: 'BOT_OWNER',
	usage: ['[user] [message]'],
	execute(message, args, client) {

		let user;

		if (client.users.cache.get(args[0])) {
			user = client.users.cache.get(args[0]);
		}

		else if (args[0].startsWith('<@') && args[0].endsWith('>')) {

			let string = args[0].slice(2, -1);
			if (string.startsWith('!')) string = string.slice(1);

			if (client.users.cache.get(string)) user = client.users.cache.get(string);
		}

		args.shift();

		if (user) {
			if (message.attachments.size) {
				if (message.attachments.first().size < 8000000) {
					try {
						user.send(args.join(' '), {
							files: [message.attachments.first()],
						});
						message.channel.send(`Message delivered to ${user.username}.`);
					}
					catch {
						message.channel.send('Could not deliver message.');
					}
				}
				else {
					try {
						user.send(args.join(' ') + '\n Attached: ' + message.attachments.first().url);
						message.channel.send(`Message delivered to ${user.username}. The attachment was too large for me to send so I sent a link to it.`);
					}
					catch {
						message.channel.send('Could not deliver message.');
					}
				}
			}
			else {
				try {
					user.send(args.join(' '));
					message.channel.send(`Message delivered to ${user.username}.`);
				}
				catch {
					message.channel.send('Could not deliver message.');
				}
			}
		}
		else {
			message.channel.send('I couldn\'t find that user.');
		}
	},
};