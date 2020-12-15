module.exports = {
	name: 'filter',
    description: 'Set banned words.',
    args: true,
    async execute(message, args, client, prefix) {
        
        if (!message.member.hasPermission('ADMINISTRATOR')) return message.reply('you do not have enough permissions to run this command. [ADMINISTRATOR]');

        let words = message.content.slice(prefix.length + 6).trim().split(',');
        
        let bannedWords = ""
                
        for (var i = 0; i < words.length; i++) {
            words[i] = words[i].trim()
            bannedWords = bannedWords + " `" + words[i] + "`"
        }
        
		
        await client.schemas.get('guild').findOneAndUpdate({
            _id: message.guild.id
        }, {
            _id: message.guild.id,
            bannedWords: words
        }, {
            upsert: true
        })
        
        
            
        message.channel.send(`Banned words ${bannedWords}`);

	},
};