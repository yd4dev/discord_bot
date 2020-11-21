const Discord = require('discord.js')

module.exports = client => {

    client.on('messageReactionAdd', async (reaction, user) => {

        if(user.bot) return

        const ticketCategory = await client.schemas.get('ticketCategory.js').findOne({
            guild_id: reaction.message.guild.id,
            category_message: reaction.message.id
        })

        if(!ticketCategory) return
        var title = ""

        if(ticketCategory.title) {
            title = ticketCategory.title
        } else {
            title = ticketCategory.category_name
        }

        reaction.message.guild.channels.create(ticketCategory.category_name,{ type: 'text'})
        .then((channel) => {

            if(channel.guild.member(client.user).hasPermission('ADMINISTRATOR')) {

            const everyone = reaction.message.guild.roles.cache.find(r => r.name == '@everyone');

            channel.updateOverwrite(everyone, {VIEW_CHANNEL: false})

            ticketCategory.staff_roles.forEach(element => {
                channel.updateOverwrite(element, {VIEW_CHANNEL: true})

            });

            } else channel.send('I am missing \`ADMINISTRATOR\` permission to overwrite channel permissions.')

            let TicketCreatedEmbed = new Discord.MessageEmbed()
            .setTitle(title)
            .setColor('#9cdcfe')
            .setAuthor(user.username, user.displayAvatarURL({dynamic : true}))
            .setTimestamp(Date.now())

            if(ticketCategory.embed_message) {
                TicketCreatedEmbed.setDescription(ticketCategory.embed_message)
            }   

            channel.send(TicketCreatedEmbed)
            channel.send(`<@${user.id}>`)

        })

    })

}