module.exports = client => {

    client.on('voiceStateUpdate', async (oldState, newState) => {
        
        if (oldState.channel === newState.channel) return

        const { voicelinks } = await client.schemas.get('guild').findOne({ _id: newState.guild.id })

        if (voicelinks) return

        for (k of voicelinks) {
            if (oldState.channel && oldState.channel.id == k[0]) {
                if (oldState.guild.roles.cache.find(r => r.id == voicelinks.get(k[0]))) {
                    oldState.member.roles.remove(voicelinks.get(k[0]))
                }

            }
            if (newState.channel && newState.channel.id == k[0]) {
                if (newState.guild.roles.cache.find(r => r.id == voicelinks.get(k[0]))) {
                    newState.member.roles.add(voicelinks.get(k[0]))
                }
            }

        }

    })

}