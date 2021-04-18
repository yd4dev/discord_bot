const Discord = require('discord.js');

module.exports = {
	name: 'help',
	description: 'Shows a list of all commands.',
	args: false,
	usage: ['(command)'],
	commandHelp(message, commandName, prefix, client) {

		if (client.commands.has(commandName)) {

			const command = client.commands.get(commandName);

			let minArgs = command.args;

			if (minArgs == false) minArgs = 0;

			const commandHelp = new Discord.MessageEmbed()
				.setTitle('Help ' + command.name)
				.setAuthor(client.user.username, client.user.displayAvatarURL())
				.setColor('RANDOM')
				.setFooter('Use !help for a list of all available commands.', client.user.displayAvatarURL());
			if (command.description) commandHelp.setDescription(command.description);
			if (command.usage) {

				let usage = minArgs ? '' : `• ${prefix}${commandName}\n`;

				command.usage.forEach(u => {
					usage += `• ${prefix}${commandName} ${u.trim()}\n`;
				});

				commandHelp.addField('\u200B', '```Usage```\n' + usage);
			}
			commandHelp.addField('Required Arguments', minArgs, true);
			if (command.permissions) commandHelp.addField('Required Permissions', command.permissions, true);

			message.channel.send(commandHelp);

		}
		else {
			message.channel.send('That command does not exist.');
		}

	},
	execute(message, args, client, prefix) {

		if (args[0]) {

			if (args[0].startsWith(prefix)) {
				args[0].slice(0, prefix.length - 1);
			}

			this.commandHelp(message, args[0], prefix, client);

		}
		else {

			const categories = new Map();

			client.commands.forEach(element => {
				if (!categories.get(element.category)) categories.set(element.category, []);
				categories.get(element.category).push(element.name);

			});

			const HelpEmbed = new Discord.MessageEmbed()
				.setTitle('Help')
				.setAuthor(client.user.username, client.user.displayAvatarURL())
				.setDescription(`The server's prefix is set to \`${prefix}\`.\n 📠 - Can be used inside DMs\n🎖️ - Need extra permissions to run`)
				.setColor('RANDOM')
				.setFooter('Use !help (command) for detailed information.', client.user.displayAvatarURL());

			categories.forEach((values, key) => {
				const commands = [];
				values.forEach(e => {
					const command = client.commands.get(e);
					if (command.permissions === 'BOT_OWNER' && message.author.id !== process.env.botOwnerId) {
						return;
					}
					else {
						commands.push(command.name + ' | ' + command.description + (command.guild ? '' : ' 📠') + (command.permissions ? ' 🎖️' : ''));
					}
				});
				HelpEmbed.addField(key, commands);
			});

			message.channel.send(HelpEmbed);
		}
	},
};