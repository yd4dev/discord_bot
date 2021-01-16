module.exports = {
    name: 'unmute',
    description: 'Lets you unmute users.',
    args: 1,
    guild: true,
    permissions: 'MANAGE_MESSAGES',
    usage: '%prefixunmute [@Target]',
    async execute (message, args, client, prefix) {

        const target = message.mentions.members.first();
        const mutedRole = message.guild.roles.cache.find(role => role.name === 'Muted')

        const result = await client.schemas.get('mute').findOne({
            guildId: message.guild.id,
            userId: target.id
        })

        const joinRoles = await client.schemas.get('guild').findOne({
            _id: message.guild.id
        })


        if(target.roles.highest.comparePositionTo(message.guild.member(client.user).roles.highest) > 0) return message.channel.send('It seems that I am not high enough in the role hierarchy to unmute that member.')

        if(!result && !target.roles.cache.has(mutedRole.id)) return message.reply('that user is not muted.')

        if(result) {

            const previousRoles = result.userRoles

            previousRoles.forEach(element => {
                target.roles.add(message.guild.roles.cache.find(role => role.id === element))
            });

            target.roles.remove(mutedRole)

            await client.schemas.get('mute').deleteOne(result)

            message.channel.send(`Successfully unmuted ${target}.`)

            return

        } else if(target.roles.cache.has(mutedRole.id)) {

            target.roles.remove(mutedRole)

            if(joinRoles.joinRoles) {
                joinRoles.joinRoles.forEach(e => {
                    target.roles.add(e)
                })
            }

            return message.channel.send(`Successfully unmuted ${target}.`)
        }


    }
}