module.exports = async (message, client) => {
	if (message.author.bot) return;

	const prefix = client.data.guilds.get(message.guild.id)?.prefix || '!';

	let slice = undefined;
	if (message.content.startsWith(prefix)) {
		slice = prefix.length;
	}
	else if (message.content.startsWith(`<@${client.user.id}>`)) {
		slice = `<@${client.user.id}>`.length;
	}
	else if (message.content.startsWith(`<@!${client.user.id}>`)) {
		slice = `<@!${client.user.id}>`.length;
	}

	if (slice) {

		const args = message.content.slice(slice).trim().split(/ +/);

		const commandName = args.shift().toLowerCase();

		const command = client.commands.get(commandName);

		if (!client.commands.has(commandName)) {
			return;
		}

		if (!message.channel.permissionsFor(message.guild.me).has('SEND_MESSAGES')) {
			return message.author.send(`I do not have enough permissions to write into ${message.channel}.`)
				.catch(() => {
					return;
				});
		}

		const ignoredChannels = client.data.guilds.get(message.guild.id).ignoredChannels;

		if (ignoredChannels?.indexOf(message.channel.id) > -1) {

			return await message.channel.send(`${message.channel} is ignored.`)
				.then(msg => setTimeout(() => msg.delete(), 3000));
		}

		if (command.guild && message.channel.type != 'text') {
			return message.channel.send('You can only use this command in a guild.');
		}

		if (command.permissions) {

			if (command.permissions != 'BOT_OWNER' && !message.member.permissions.has(command.permissions) && message.member.id != process.env.botOwnerId) return message.channel.send('You do not have the required permissions to execute that command, <@' + message.author + '>');
			else if (command.permissions == 'BOT_OWNER' && message.author.id != process.env.botOwnerId) return message.channel.send('This command can only be used by the bot\'s owner.');
		}

		if (args.length < command.args) {
			return client.commands.get('help').commandHelp(message, commandName, prefix, client);
		}

		try {
			command.execute(message, args, client, prefix);
		}
		catch (err) {
			console.error(err);
			message.channel.send(`<@${message.author.id}>there was an error while executing that command.`);
		}
	}
};