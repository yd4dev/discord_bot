const Discord = require('discord.js')

require('dotenv').config()

module.exports = client => {

    client.on('message', async message => {

        console.log('a')

        if (message.channel.type != 'dm') return
        if(message.author.bot) return

        console.log('a')

        let MessageDMEmbed = new Discord.MessageEmbed()
            .setTitle('Direct Message')
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
            .setTimestamp(message.createdTimestamp)
        
        if (message.content) MessageDMEmbed.setDescription(message.content)
        if (message.attachments.size != 0) MessageDMEmbed.addField('Attachment:', message.attachments.first().url)

        console.log('a')

        client.users.cache.get(process.env.botOwnerId).send(MessageDMEmbed)

        console.log('a')
    
    })
}