module.exports = {
	name: 'filter',
    description: 'Set banned words.',
    args: 1,
    permissions: 'MANAGE_MESSAGES',
    usage: '%prefixfilter [words to filter (separated by a comma)]',
    async execute(message, args, client, prefix) {

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

	}
};