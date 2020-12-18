module.exports = client => {

    client.on('voiceStateUpdate', async (oldState, newState) => {
        
        if (oldState.channel == newState.channel) return

        const result = await client.schemas.get('guild').findOne({ _id: newState.guild.id })

        if (!result.voicelinks) return

        for (k of result.voicelinks) {
            if (oldState.channel && oldState.channel.id == k[0]) {
                if (oldState.guild.roles.cache.find(r => r.id == result.voicelinks.get(k[0]))) {
                    oldState.member.roles.remove(result.voicelinks.get(k[0]))
                }

            }
            if (newState.channel && newState.channel.id == k[0]) {
                if (newState.guild.roles.cache.find(r => r.id == result.voicelinks.get(k[0]))) {
                    newState.member.roles.add(result.voicelinks.get(k[0]))
                }
            }

        }

    })

}