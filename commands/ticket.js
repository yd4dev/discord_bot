const Discord = require('discord.js')

module.exports = {
	name: 'ticket',
    description: 'A command to handle tickets.',
    args: 2,
    guild: true,
    permissions: 'ADMINISTRATOR',
    usage: '%prefixticket category create [category name] \n %prefixticket category delete [category name] \n %prefixcategory [catgeory name] edit name [new name] \n %prefixcategory [category name] embed title [title] \n %prefixcategory [category name] message [message] \n %prefixcategory [category name] react [channel id] [message id] \n %prefixcategory [category name] staff [mention roles]',
	async execute(message, args, client, prefix) {
        //ticket  args[0]   args[1]         args[2]                        args[3++]
        //ticket category [category Name] [create / edit / embed / react] [args]

		switch(args[0]) {
            case 'category':

                if(args[1] === 'create') {

                    if(!args[2]) return message.reply('Please provide a category name.')

                    if(await client.schemas.get('ticketCategory').findOne({guild_id: message.guild.id, category_name: args[2]})) return message.reply('this category already exists.')
                    await client.schemas.get('ticketCategory').findOneAndUpdate({
                        guild_id: message.guild.id,
                        category_name: args[2]
                    }, {
                        guild_id: message.guild.id,
                        category_name: args[2]
                    }, {
                        upsert: true
                    })
                    message.channel.send(`Succesfully created Ticket category ${args[2]}`)

                } else if(args[1] === 'delete') {

                    if(!args[2]) return message.reply('Please provide a category name.')

                    if(!await client.schemas.get('ticketCategory').findOne({guild_id: message.guild.id, category_name: args[2]})) return message.reply('this category does not exist.')
                    await client.schemas.get('ticketCategory').findOneAndDelete({
                        guild_id: message.guild.id,
                        category_name: args[2]
                    })
                    message.channel.send(`Succesfully deleted Ticket category ${args[2]}`)

                } else {

                    const categoryName = args[1]

                    if(!await client.schemas.get('ticketCategory').findOne({guild_id: message.guild.id, category_name: categoryName})) return message.reply('this category does not exist.')

                    const operation = args[2]

                    switch(operation) {

                        //ticket category [name] edit name [newName]
                        case 'edit':
                            switch(args[3]) {
                                case 'name':
                                    if(!args[4]) return message.reply(`the correct usage is \`${prefix}ticket category [category name] edit [newName].\``)

                                    var curResult = await client.schemas.get('ticketCategory').findOne({
                                        guild_id: message.guild.id,
                                        category_name: categoryName
                                    })

                                    if(!curResult) return message.reply(`Could not find category ${categoryName}`)

                                    const newName = args[4]

                                    var newNameCategory = await client.schemas.get('ticketCategory').findOne({
                                        guild_id: message.guild.id,
                                        category_name: newName
                                    })

                                    if(newNameCategory) return message.reply(`Category ${newName} already exists.`)

                                    await client.schemas.get('ticketCategory').findOneAndUpdate({
                                        guild_id: message.guild.id,
                                        category_name: categoryName
                                    }, {
                                        category_name: newName
                                    })
                                    .catch((err) => {
                                        console.log(err)
                                        return message.reply('there was an error with storing your data.')
                                    })

                                    message.channel.send(`Changed category name \`${categoryName}\` to \`${newName}\``)

                                break;
                            }
                            break;

                        //ticket category [name] embed [title / message] [args]
                        case 'embed':
                            switch(args[3]) {
                                case 'title':

                                    if(!args.length > 3) return message.reply('please provide a title.')

                                    args.shift()
                                    args.shift()
                                    args.shift()
                                    args.shift()

                                    var title = args.join(' ')

                                    await client.schemas.get('ticketCategory').findOneAndUpdate({
                                        guild_id: message.guild.id,
                                        category_name: categoryName
                                    }, {
                                        embed_title: title
                                    })

                                    message.channel.send(`Successfully changed embed title to ${title}`)

                                break;

                                case 'message':

                                    if(!args.length > 3) return message.reply('please provide a message.')

                                    args.shift()
                                    args.shift()
                                    args.shift()
                                    args.shift()
                                    
                                    var embed_message = args.join(' ')

                                    await client.schemas.get('ticketCategory').findOneAndUpdate({
                                        guild_id: message.guild.id,
                                        category_name: categoryName
                                    }, {
                                        embed_message: embed_message
                                    })

                                    message.channel.send(`Successfully changed embed message to ${embed_message}`)

                                break;
                            }
                        break;

                        //ticket category [name] react [channelid] [messageid]
                        case 'react':
                            if(!args[3] || !args[4]) return message.reply('please provide a channel id and a message id.')

                            var category_channel = message.guild.channels.cache.get(args[3])

                            var category_message = await category_channel.messages.fetch(args[4])

                            

                            if(!category_channel || !category_message) return message.reply('channel id or message id invalid.')
                            if(category_channel.type != 'text') return message.reply('the channel is not a text channel.')

                            await client.schemas.get('ticketCategory').findOneAndUpdate({
                                guild_id: message.guild.id,
                                category_name: categoryName
                            }, {
                                category_channel: args[3],
                                category_message: args[4]
                            })

                            message.channel.send(`Set Ticket Create Channel for Category ${categoryName} to message ${category_message.url}`)

                            category_message.react('📨')

                        break;

                        //ticket category [name] staff [mention roles]
                        case 'staff':
                            if(!message.mentions.roles) return message.reply('please provide at least one role (mention).')

                            await client.schemas.get('ticketCategory').findOneAndUpdate({
                                guild_id: message.guild.id,
                                category_name: categoryName
                            }, {
                                staff_roles: message.mentions.roles.array()
                            })
                            .then(message.channel.send(`Set ${message.mentions.roles.array()} as staff roles for ticket category ${categoryName}`))

                        break;
                    }
                    
                }
            break;

        default: 
                let TicketHelp = new Discord.MessageEmbed()
                .setTitle('Ticket Help')
                .addField('Category Settings',
                `${prefix}ticket category create [name]\n
                ${prefix}ticket category delete [name]\n
                ${prefix}ticket category [name] edit name [new name]\n
                ${prefix}ticket category [name] embed title [title]\n
                ${prefix}ticket category [name] embed message [message]\n
                ${prefix}ticket category [name] react [channelid] [messageid]`)

                message.channel.send(TicketHelp)

        }
	},
};