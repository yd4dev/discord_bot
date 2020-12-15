  module.exports = client => {

    client.on('message', async message => {

        if(message.member.hasPermission('MANAGE_MESSAGES')) return;
    
        let result = await client.schemas.get('guild').findOne({ _id: message.member.guild.id})  
            
        if (!result.bannedWords) return;        
    
        if (result.bannedWords.some(word => message.content.toLowerCase().replace(/\s+/g, '').includes(word.replace(/\s+/g, '')))) {
            message.delete();

        }
    })
}