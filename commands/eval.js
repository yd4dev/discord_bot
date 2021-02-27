module.exports = {
	name: 'eval',
	description: 'A command to run eval.',
	args: true,
	permissions: 'BOT_OWNER',
	usage: ['[code]'],
	execute(message, args) {

		function clean(text) {
			if (typeof (text) === 'string') {return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));}
			else {return text;}
		}

		const code = args.join(' ');

		let evaled = '';

		try {
			evaled = eval(code);
		}
		catch (err) {
			message.channel.send(err.name + ': ' + err.message);
			console.log(err);
		}


		if (typeof evaled !== 'string') {evaled = require('util').inspect(evaled);}

		if (clean(evaled).length > 2000) return message.channel.send('Return value is greater than 2000 chars.');

		message.channel.send(clean(evaled), { code:'xl' });

	},
};