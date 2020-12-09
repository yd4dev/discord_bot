const Discord = require('discord.js')

module.exports = client => {

    client.on('guildMemberAdd', async member => {
    
        const result = await client.schemas.get('server-settings.js').findOne({ _id: member.guild.id})  
    
        if(!result.logsChannelId) return;
        if(!client.channels.cache.find(c => c.id == result.logsChannelId)) return;
    
        let JoinedEmbed = new Discord.MessageEmbed()
            .setTitle('Neues Mitglied')
            .setColor('#00FF48')
            .setImage(member.user.displayAvatarURL({dynamic : true, size: 128}))
            .setDescription(`${member.displayName} ist dem Server beigetreten.`)
            .setTimestamp(Date.now())
    
        client.channels.cache.get(result.logsChannelId).send(JoinedEmbed);
    
    })
    
    client.on('guildMemberRemove', async member => {
    
        const result = await client.schemas.get('server-settings.js').findOne({ _id: member.guild.id})  
    
        if(!result.logsChannelId) return;
        if(!client.channels.cache.find(c => c.id == result.logsChannelId)) return;
    
        let LeaveEmbed = new Discord.MessageEmbed()
            .setTitle('Mitglied verlassen')
            .setColor('#FF2A2A')
            .setImage(member.user.displayAvatarURL({dynamic : true, size: 128}))
            .setDescription(`${member.displayName} hat den Server verlassen.`)
            .setTimestamp(Date.now())
    
        client.channels.cache.get(result.logsChannelId).send(LeaveEmbed);
    
    })
    
    client.on('messageDelete', async message => {

        if (message.partial) return
        
        const result = await client.schemas.get('server-settings.js').findOne({ _id: message.guild.id})
        
        if(!result.logsChannelId) return;
        if(!client.channels.cache.find(c => c.id == result.logsChannelId)) return;
    
        const fetchedLogs = await message.guild.fetchAuditLogs({limit: 1, type: 'MESSAGE_DELETE'});
        const log = fetchedLogs.entries.first();
    
        let content;
    
        if(!message.content && message.embeds) 
        {
            content = 'Embed';
        } else {
            content = message.content;
        }
    
        let MessageDeletedEmbed = new Discord.MessageEmbed()
            .setTitle('Nachricht gelöscht')
            .setColor('#5B0000')
            .setAuthor(message.member.displayName, message.author.displayAvatarURL({dynamic : true}))
            .addField('Inhalt:', content)
            .addField('Nachricht geschrieben:',`${message.createdAt.getHours()}:${message.createdAt.getMinutes()}, ${message.createdAt.toDateString()}`)
            .addField('Channel:', message.channel)
            .setTimestamp(Date.now())
            if(log && log.target.id == message.author.id) MessageDeletedEmbed.addField('Moderator:', log.executor);
    
    
        client.channels.cache.get(result.logsChannelId).send(MessageDeletedEmbed);
    })

    client.on('messageUpdate', async (oldMessage, newMessage) => {

        if(oldMessage.partial || newMessage.partial) return;

        if (oldMessage.embeds || newMessage.embeds) return;
        if (!newMessage.editedAt) return;

        const result = await client.schemas.get('server-settings.js').findOne({ _id: newMessage.member.guild.id})

        if(!result.logsChannelId) return;
        if(!client.channels.cache.find(c => c.id == result.logsChannelId)) return;

        var writtenH = oldMessage.createdAt.getHours()
        if(writtenH / 10 < 1) writtenH = `0${writtenH}`
        var writtenM = oldMessage.createdAt.getMinutes()
        if(writtenM / 10 < 1) writtenM = `0${writtenM}`

        let MessageUpdateEmbed = new Discord.MessageEmbed()
            .setTitle('Nachricht bearbeitet')
            .setColor('#292b2f')
            .setAuthor(newMessage.member.displayName, newMessage.author.displayAvatarURL({dynamic : true}))
            .addField('Zuvor:', oldMessage.content)
            .addField('Update:', newMessage.content)
            .addField('Nachricht geschrieben:',`${writtenH}:${writtenM}, ${oldMessage.createdAt.toDateString()}`)
            .addField('Channel:', `${newMessage.channel} \n [Go To Message](${newMessage.url})`)
            .setTimestamp(Date.now())


            client.channels.cache.get(result.logsChannelId).send(MessageUpdateEmbed);
    })

    client.on('voiceStateUpdate', async (oldState, newState) => {

    if(newState.channel) {
        if(oldState.channel && oldState.channel != newState.channel) {

            const result = await client.schemas.get('server-settings.js').findOne({ _id: newState.member.guild.id})

            if(!result.logsChannelId) return;
            if(!client.channels.cache.find(c => c.id == result.logsChannelId)) return;

            let ChannelMovedEmbed = new Discord.MessageEmbed()
            .setTitle('Voice Channel gewechselt')
            .setColor('#292b2f')
            .setAuthor(newState.member.displayName, newState.member.user.displayAvatarURL({dynamic : true}))
            .addField('Zuvor:', oldState.channel.name)
            .addField('Channel:', newState.channel.name)
            .setTimestamp(Date.now())

            return client.channels.cache.get(result.logsChannelId).send(ChannelMovedEmbed);
        } else if (oldState.channel != newState.channel) {

            const result = await client.schemas.get('server-settings.js').findOne({ _id: newState.member.guild.id})

            if(!result.logsChannelId) return;
            if(!client.channels.cache.find(c => c.id == result.logsChannelId)) return;

            let ChannelJoinedEmbed = new Discord.MessageEmbed()
            .setTitle('Voice Channel beigetreten')
            .setColor('#292b2f')
            .setAuthor(newState.member.displayName, newState.member.user.displayAvatarURL({dynamic : true}))
            .addField('Channel:', newState.channel.name)
            .setTimestamp(Date.now())

            return client.channels.cache.get(result.logsChannelId).send(ChannelJoinedEmbed);
        }
    } else if (oldState.channel) {

        const result = await client.schemas.get('server-settings.js').findOne({ _id: newState.member.guild.id})

        if(!result.logsChannelId) return;
        if(!client.channels.cache.find(c => c.id == result.logsChannelId)) return;

        let ChannelLeftEmbed = new Discord.MessageEmbed()
            .setTitle('Voice Channel verlassen')
            .setColor('#292b2f')
            .setAuthor(oldState.member.displayName, newState.member.user.displayAvatarURL({dynamic : true}))
            .addField('Channel:', oldState.channel.name)
            .setTimestamp(Date.now())

            return client.channels.cache.get(result.logsChannelId).send(ChannelLeftEmbed);
    }
    })
}