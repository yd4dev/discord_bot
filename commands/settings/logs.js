module.exports = {
    name: 'logs',
    description: 'Lets you change the server logs settings.',
    args: true,
    async execute(message, args, client, prefix) {

        if (!message.member.hasPermission('ADMINISTRATOR')) return message.reply('you do not have enough permissions to run this command. [ADMINISTRATOR]');
        
        switch (args[0]) {
            case 'channel':
                
                let channel;

                if (args[1]) {
                    channel = message.guild.channels.cache.find(c => c.id == args[1])
                }

                if (!channel || !args[1]) {

                    if (!message.mentions.channels.size) {

                        channel = message.channel;
            
                    } else {
            
                        channel = message.mentions.channels.first();
            
                    }
                }


                await client.schemas.get('guild').findOneAndUpdate({
                    _id: message.guild.id
                }, {
                    _id: message.guild.id,
                    logsChannelId: channel.id
                }, {
                    upsert: true
                })

                message.channel.send(`The logs will now be sent in ${channel}`);

            break;
        }

    }
}