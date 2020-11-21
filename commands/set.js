module.exports = {
	name: 'set',
    description: 'A command to change the bot settings on a server. Requires Manage Channels Permissions.',
    args: false,
	async execute(message, args, client, prefix) {
        
        if (!message.member.hasPermission('MANAGE_CHANNELS')) return message.reply('you do not have enough permissions to run this command. [MANAGE_CHANNELS]');

        switch (args[0]) {
            case 'logs':
                let channel;

                if (!message.mentions.channels.size) {

                    channel = message.channel;
        
                } else {
        
                    channel = message.mentions.channels.first();
        
                }


                await client.schemas.get('server-settings.js').findOneAndUpdate({
                    _id: message.guild.id
                }, {
                    _id: message.guild.id,
                    logsChannelId: channel.id
                }, {
                    upsert: true
                })

                message.reply(`the logs will now be sent in ${channel}`);

                break;

            case 'filter':

                let words = message.content.slice(prefix.length + 3).trim().split(',');
                words[0] = words[0].slice(6).trim();
                
                for (var i = 0; i < words.length; i++) {
                    words[i] = words[i].trim()
                }

		        
                    await client.schemas.get('server-settings.js').findOneAndUpdate({
                        _id: message.guild.id
                    }, {
                        _id: message.guild.id,
                        bannedWords: words
                    }, {
                        upsert: true
                    })

                    message.reply(`banned words \`${words}\``);

            break;

            case 'roles':

                switch(args[1]) {
                    case 'join':

                        const mentionedRoles = message.mentions.roles.array()
                        await client.schemas.get('server-settings.js').findOneAndUpdate({
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
                        message.reply('valid arguments are `join`.')
                }

                break;
        
            default:
                message.reply('valid settings are \`logs\`, \`filter\`, \`roles\`.');
        }

	},
};