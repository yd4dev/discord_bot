const { Client, Collection, Intents } = require('discord.js');
const guildData = require('./guildData');

require('dotenv').config();

const client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'], intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.data = new Object();
client.data.guilds = new Collection();
client.data.save = guildData.save;
client.commands = new Collection();
client.schemas = new Collection();

client.once('ready', async () => {
	require('./load.js')(client);
	await require('./mongo.js')();

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
	guildData.save(guild.id, client, { name: guild.name });
});

client.login(process.env.token);