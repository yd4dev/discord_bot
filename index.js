const fs = module.require('fs');
const Discord = require('discord.js');
const mongo = require('./mongo.js');
const path = require('path');

require('dotenv').config()

const loadFeatures = require('./features/load-features')

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    console.log(`Enabling command "${file}"`)
	const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.schemas = new Discord.Collection();

const schemas = fs.readdirSync('./schemas').filter(file=> file.endsWith('.js'));

for (const file of schemas) {
    const schemaName = file.substring(0, file.length - 3);
    console.log(`Enabling schema "${schemaName}"`)
    const schema = require(`./schemas/${file}`);
    client.schemas.set(schemaName, schema);
}

client.once('ready', async () => {
    client.user.setPresence({ activity: { name: `${client.guilds.cache.size} servers` , type: 'COMPETING'}, status: 'online' })
    loadFeatures(client);
    await mongo();

    client.guilds.cache.forEach(async guild => {
        if(!await client.schemas.get('server-settings').findOne({ _id: guild.id})) 
        {
            await client.schemas.get('server-settings').create({_id: guild.id})
        }
    })

    console.log('Ready!');
});

client.on('message', async message => {

    if (message.author.bot || message.channel.type == 'dm') return; //No bots, no dms.

    const settings = await client.schemas.get('server-settings').findOne({ _id: message.guild.id})

    let prefix = '!'
    if(settings.prefix) {
        prefix = settings.prefix}

    if (message.content.startsWith(prefix)) {

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName);

        if (!client.commands.has(commandName)) {
            return;
        }

        if (command.args && !args.length) {
            message.reply('you did not provide any arguments.');
            return;
        }

        try {
            command.execute(message, args, client, prefix);
        } catch (err) {
            console.error(err);
            message.reply('there was an error trying to execute that command.');
        }
    
    }

})

client.on('GuildCreate', async guild => {

    await client.schemas.get('server-settings').findOneAndUpdate({
        _id: guild.id
    }, {
        _id: guild.id,
    }, {
        upsert: true
    })
})

    client.login(process.env.token);