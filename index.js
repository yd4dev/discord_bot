const Discord = require('discord.js');

require('dotenv').config();

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

client.cache = new Object();
client.cache.guilds = new Discord.Collection();
client.commands = new Discord.Collection();
client.schemas = new Discord.Collection();

client.once('ready', async () => {
	require('./load.js')(client);

	await require('./mongo.js')();

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
		client.cache.guilds.set(guild.id, new Object());
	});

	console.log('Ready!');
});

client.on('message', async message => {
	require('./command-handler.js')(message, client);
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