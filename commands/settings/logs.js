const Discord = require('discord.js')

module.exports = {
    name: 'logs',
    description: 'Lets you change the server logs settings.',
    args: false,
    guild: true,
    permissions: 'ADMINISTRATOR',
    usage: '%prefixlogs \n %prefixlogs toggle [event/s] \n %prefixlogs channel <text channel mention / id>',
    async execute(message, args, client, prefix) {

        /*

        All events and their meanings:

        channelCreate
        When a channel is created
        channelUpdate
        When a channel is updated (overwrites, name, bitrate...)
        guildBanAdd
        When a member gets banned
        guildBanRemove
        When a member gets unbanned
        guildRoleCreate
        When a role is created
        guildRoleDelete
        When a role is deleted
        guildRoleUpdate
        When a role is changed
        guildUpdate
        When a property of the server is updated (name, afk channel, welcome channel, etc)
        messageDelete
        When a message is deleted
        messageDeleteBulk
        When a large amount of messages is deleted by a bot
        messageUpdate
        When a message is edited
        guildMemberAdd
        When a member joins the server
        guildMemberKick
        When a member is kicked from the server
        guildMemberRemove
        When a member voluntarily leaves the server
        guildMemberUpdate
        When a member is given or revoked a role
        voiceChannelLeave
        When a member leaves a voice channel
        voiceChannelJoin
        When a member joins a voice channel
        voiceStateUpdate
        When a member mutes or deafens themself (or server-wide mute/deafen)
        voiceChannelSwitch
        When a member moves from one voice channel to another
        guildEmojisUpdate
        When an emoji is added or removed from the server
        Patreon
        Special Patreon bot
        See who deletes messages!
        Image logging
        Longer message caching times
        Less limits
        Faster bot
        Priority support for bot uptime
        Special website for viewing archives and bulk delete logs (https://logs.discord.website/9xMtM)
        Archive up to 10,000 messages at once
        See role permissions being updated
        Ability to ignore actions done by a user (create role, apply role, kick, ban, etc)
        See who moves or disconnects users in voice channels

        */
        
        // channelCreate, channelDelete, channelUpdate, guildBanAdd, guildBanRemove, guildMemberAdd, guildMemberRemove, guildMemberKick, guildMemberUpdate, messageDelete, messageDeleteBulk, messageUpdate, voiceStateUpdate
        // 'channelCreate', 'channelDelete', 'channelUpdate', 'guildBanAdd', 'guildBanRemove', 'guildMemberAdd', 'guildMemberRemove', 'guildMemberKick', 'guildMemberUpdate', 'messageDelete', 'messageDeleteBulk', 'messageUpdate', 'voiceStateUpdate'

        

        const result = (await client.schemas.get('guild').findOne({ _id: message.guild.id }))

        const logsMap = new Map(result.logs)

        const events = ['channelCreate', 'channelDelete', 'channelUpdate', 'guildBanAdd', 'guildBanRemove', 'guildMemberAdd', 'guildMemberRemove', 'guildMemberKick', 'guildMemberUpdate', 'messageDelete', 'messageDeleteBulk', 'messageUpdate', 'voiceStateUpdate']


        let undefChanged = false
        events.forEach(async e => {
            
            if (logsMap.get(e) === undefined) {
                logsMap.set(e, true)
                undefChanged = true
            }
        })
        if (undefChanged === true) {
            await client.schemas.get('guild').findOneAndUpdate({
                _id: message.guild.id
            }, {
                logs: logsMap
            }, {
                upsert: true
            })
        }
        
        
        if (args.length === 0) {

            const logsChannel = result.logsChannelId
            let description = ''
            if (logsChannel) description = ` The logs will be sent into ${client.channels.cache.find(c => c.id === result.logsChannelId)}`
            else description = ' You have not set a logs channel yet. Nothing will be logged.'

            let LogsEmbed = new Discord.MessageEmbed()
                .setTitle('Server Logs')
                .setAuthor(client.user.username, client.user.displayAvatarURL())
                .setColor('AQUA')
                .setDescription(description)
        
            events.forEach(e => {

                if (logsMap.get(e)) {
                    LogsEmbed.addField(e, '✅', true)
                } else {
                    LogsEmbed.addField(e, '❌', true)
                }

            })

            message.channel.send(LogsEmbed)

        } else switch (args[0]) {

            case 'toggle':

                args.shift()

                success = ''

                args.forEach(a => {

                    if (events.find(e => e === a) && success.search(a) === -1) {

                        logsMap.set(a, !logsMap.get(a))

                        if (success.length !== 0) {
                            success += ', ' + '`' + a + '`'
                        } else {
                            success = '`' + a + '`'
                        }

                    }

                })

                if (success.length) {

                    await client.schemas.get('guild').findOneAndUpdate({
                        _id: message.guild.id
                    }, {
                        logs: logsMap
                    }, {
                        upsert: true
                    })

                    message.channel.send(`Successfully changed ${success}.`)

                } else {

                    message.channel.send('Please provide events to toggle.')

                }
                break

            case 'channel':

                if (!args[1]) {

                    await client.schemas.get('guild').findOneAndUpdate({
                        _id: message.guild.id
                    }, {
                        logsChannelId: message.channel.id
                    }, {
                        upsert: true
                    })

                    message.channel.send(`Set events to be logged in ${message.channel}`)

                } else {

                    if (message.mentions.channels.size > 0 && message.mentions.channels.first().type === 'text' && message.mentions.first().guild === message.guild) {

                        await client.schemas.get('guild').findOneAndUpdate({
                            _id: message.guild.id
                        }, {
                            logsChannelId: message.mentions.channels.first().id
                        }, {
                            upsert: true
                        })

                        message.channel.send(`Set events to be logged in ${message.mentions.channels.first()}`)

                    } else {

                        const channel = message.guild.channels.cache.find(c => c.id === args[1])

                        if (channel && channel.type === 'text') {

                            await client.schemas.get('guild').findOneAndUpdate({
                                _id: message.guild.id
                            }, {
                                logsChannelId: channel.id
                            }, {
                                upsert: true
                            })
    
                            message.channel.send(`Set events to be logged in ${channel}`)

                        } else if (client.channels.cache.find(c => c.id === args[1]) && client.channels.cache.find(c => c.id === args[1]).guild !== message.guild) {
                            message.channel.send('Did you just try to select another server\'s channel?')
                        } else {
                            message.channel.send('Please provide a valid text channel mention / id.')
                        }

                    }

                }
                
                break
            
            default:

                client.commands.get('help').commandHelp(message, this.name, prefix, client)

                break
        }

    }
}