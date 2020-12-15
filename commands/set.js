const Discord = require("discord.js");

module.exports = {
	name: 'set',
    description: 'A command to change the bot settings on a server. Requires Manage Channels Permissions.',
    args: false,
	async execute(message, args, client, prefix) {
        
        if (!message.member.hasPermission('MANAGE_CHANNELS')) return message.reply('you do not have enough permissions to run this command. [MANAGE_CHANNELS]');

        const setHelpEmbed = new Discord.MessageEmbed()
            .setTitle('Set Settings')
            .addField('Command Help',
                `${prefix}set logs [#channel]\n
                ${prefix}set filter [filtered words]\n
                ${prefix}set roles join [mention roles]\n
                ${prefix}settings\n`)

        switch (args[0]) {
            case 'logs':
                let channel;

                if (!message.mentions.channels.size) {

                    channel = message.channel;
        
                } else {
        
                    channel = message.mentions.channels.first();
        
                }


                await client.schemas.get('server-settings').findOneAndUpdate({
                    _id: message.guild.id
                }, {
                    _id: message.guild.id,
                    logsChannelId: channel.id
                }, {
                    upsert: true
                })

                message.channel.send(`The logs will now be sent in ${channel}`);

                break;

            case 'filter':

                let words = message.content.slice(prefix.length + 3).trim().split(',');
                words[0] = words[0].slice(6).trim();
                
                for (var i = 0; i < words.length; i++) {
                    words[i] = words[i].trim()
                }

		        
                    await client.schemas.get('server-settings').findOneAndUpdate({
                        _id: message.guild.id
                    }, {
                        _id: message.guild.id,
                        bannedWords: words
                    }, {
                        upsert: true
                    })

                    message.channel.send(`Banned words \`${words}\``);

            break;

            case 'roles':

                switch(args[1]) {
                    case 'join':

                        const mentionedRoles = message.mentions.roles.array()
                        console.log(mentionedRoles.length)
                        if (mentionedRoles.length == 0) return message.channel.send('Please mention roles you want to assign.')
                        await client.schemas.get('server-settings').findOneAndUpdate({
                            _id: message.guild.id
                        }, {
                            _id: message.guild.id,
                            joinRoles: mentionedRoles
                        }, {
                            upsert: true
                        })

                        message.channel.send(`${mentionedRoles} will now be assigned on join.`)

                    break;
                    default:
                        message.channel.send('Valid arguments are `join`.')
                }

                break;
        
            default:
                message.channel.send(setHelpEmbed);
        }

	},
};