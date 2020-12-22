const fs = module.require('fs');
const Discord = require('discord.js');
const mongo = require('./mongo.js');
const path = require('path');

require('dotenv').config()

const loadFeatures = require('./features/load-features')

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.commands = new Discord.Collection();

function loadCommands(dir) {
    fs.readdir(dir, function (err, files) {
        if (err) throw err
        files.forEach(file => {
            const filepath = path.join(dir, file)
            fs.stat(filepath, function (err, stats) {
                if (stats.isDirectory()) {
                    loadCommands(filepath)
                } else if (file.endsWith('.js')) {
                    console.log(`Enabling command "${file}"`)
                    const command = require('./'.concat(filepath));
                    const category = filepath.split(/\/|\\/)
                    command.category = category[category.length - 2]
                    client.commands.set(command.name, command);
                }
            })

            
        })
    })
}

loadCommands('./commands')

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
        if(!await client.schemas.get('guild').findOne({ _id: guild.id})) 
        {
            await client.schemas.get('guild').create({_id: guild.id})
        }
    })

    console.log('Ready!');
});

client.on('message', async message => {

    if (message.author.bot || message.channel.type == 'dm') return; //No bots, no dms.

    const settings = await client.schemas.get('guild').findOne({ _id: message.guild.id})

    let prefix = '!'
    if(settings.prefix) {
        prefix = settings.prefix
    }

    let slice = undefined
    if (message.content.startsWith(prefix)) slice = prefix.length
    else if (message.content.startsWith(`<@${client.user.id}>`)) {
        slice = `<@${client.user.id}>`.length
    }
    else if (message.content.startsWith(`<@!${client.user.id}>`)) {
        slice = `<@!${client.user.id}>`.length
    } 
    
    if (slice) {

        const args = message.content.slice(slice).trim().split(/ +/);

        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName);



        if (!client.commands.has(commandName)) {
            return
        }

        if (command.permissions && !message.member.hasPermission(command.permissions)) {
            return message.channel.send('You do not have the required permissions to execute that command, <@' + message.author + '>')
        }

        if (args.length < command.args) {
            return client.commands.get('help').commandHelp(message, commandName, prefix, client)
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

    await client.schemas.get('guild').findOneAndUpdate({
        _id: guild.id
    }, {
        _id: guild.id,
    }, {
        upsert: true
    })
})

    client.login(process.env.token);