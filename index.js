const Discord = require('discord.js');
const guildData = require('./guildData');

require('dotenv').config();

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

client.data = new Object();
client.data.guilds = new Discord.Collection();
client.data.save = guildData.save;
client.commands = new Discord.Collection();
client.schemas = new Discord.Collection();

client.once('ready', async () => {
	await require('./mongo.js')();
	require('./load.js')(client);

	client.guilds.cache.forEach(async guild => {
		console.log(guild.name);
		await guildData.load(guild.id, client);
	});

	console.log('Ready!');
});

client.on('message', async message => {
	require('./command-handler.js')(message, client);
});

client.on('guildCreate', async guild => {
	client.cache.guilds.set(guild.id, await client.schemas.get('guild').findOne({ _id: guild.id }) || new Object());
});

client.login(process.env.token);