module.exports = {
    name: 'logs',
    description: 'Lets you change the server logs settings.',
    args: 2,
    guild: true,
    permissions: 'ADMINISTRATOR',
    usage: '%prefixlogs channel [text channel]',
    async execute(message, args, client, prefix) {
        
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