module.exports = client => {

    client.on('guildMemberAdd', async member => {

        const currentMute = await client.schemas.get('mute.js').findOne({
            guildId: member.guild.id,
            userId: member.id
        })

        if (currentMute) return

        let result = await client.schemas.get('server-settings.js').findOne({ _id: member.guild.id})  

        if(result.joinRoles) {
            result.joinRoles.forEach(role => {
                member.roles.add(role)
            })
        }
    
    })
}