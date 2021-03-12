const fs = module.require('fs');
const Discord = require('discord.js');
const mongo = require('./mongo.js');
const path = require('path');

require('dotenv').config();

const loadFeatures = require('./features/load-features');

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.commands = new Discord.Collection();

function loadCommands(dir) {
	fs.readdir(dir, function(err, files) {
		if (err) throw err;
		files.forEach(file => {
			const filepath = path.join(dir, file);
			fs.stat(filepath, function(err, stats) {
				if (stats.isDirectory()) {
					loadCommands(filepath);
				}
				else if (file.endsWith('.js')) {
					console.log(`Enabling command "${file}"`);
					const command = require('./'.concat(filepath));
					const category = filepath.split(/\/|\\/);
					command.category = category[category.length - 2];
					client.commands.set(command.name, command);
				}
			});
		});
	});
}

loadCommands('./commands');

client.schemas = new Discord.Collection();

const schemas = fs.readdirSync('./schemas').filter(file=> file.endsWith('.js'));

for (const file of schemas) {
	const schemaName = file.substring(0, file.length - 3);
	console.log(`Enabling schema "${schemaName}"`);
	const schema = require(`./schemas/${file}`);
	client.schemas.set(schemaName, schema);
}

client.once('ready', async () => {
	client.user.setPresence({ activity: { name: `${client.guilds.cache.size} servers`, type: 'COMPETING' }, status: 'online' });
	loadFeatures(client);
	await mongo();

	client.guilds.cache.forEach(async guild => {
		console.log(guild.name);
		await client.schemas.get('guild').findOneAndUpdate(
			{
				_id: guild.id,
			},
			{
				_id: guild.id,
				name: guild.name,
			},
			{
				upsert: true,
			});
	});

	console.log('Ready!');
	client.users.cache.find(u => u.id === process.env.botOwnerId).send('Bot restart complete-');
});

client.on('message', async message => {

	if (message.author.bot) return;

	const guildresult = await client.schemas.get('guild').findOne({ _id: message.guild?.id });

	const dbPrefix = guildresult?.prefix;

	const prefix = dbPrefix ? dbPrefix : '!';

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

		if (!message.channel.permissionsFor(message.guild.members.cache.find(m => m.id === client.user.id)).has('SEND_MESSAGES')) {
			return message.author.send(`I do not have enough permissions to write into ${message.channel}.`)
				.catch(() => {
					return;
				});
		}

		if (guildresult?.ignoredChannels?.indexOf(message.channel.id) > -1) {

			return await message.channel.send(`${message.channel} is ignored.`)
				.then(msg => msg.delete({ timeout: 3000 }));
		}

		if (command.guild && message.channel.type != 'text') {
			return message.channel.send('You can only use this command in a guild.');
		}

		if (command.permissions) {

			if (command.permissions != 'BOT_OWNER' && !message.member.hasPermission(command.permissions) && message.member.id != process.env.botOwnerId) return message.channel.send('You do not have the required permissions to execute that command, <@' + message.author + '>');
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

});

client.on('guildCreate', async guild => {

	await client.schemas.get('guild').findOneAndUpdate({
		_id: guild.id,
	}, {
		_id: guild.id,
		name: guild.name,
	}, {
		upsert: true,
	});
});

client.login(process.env.token);