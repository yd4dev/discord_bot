module.exports = client => {

    client.on('guildMemberAdd', async member => {

        const currentMute = await client.schemas.get('mute').findOne({
            guildId: member.guild.id,
            userId: member.id
        })

        if (currentMute) return

        let result = await client.schemas.get('server-settings').findOne({ _id: member.guild.id})  

        if(result.joinRoles) {
            result.joinRoles.forEach(role => {
                member.roles.add(role)
            })
        }
    
    })
}