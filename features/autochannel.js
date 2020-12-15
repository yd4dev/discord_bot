module.exports = client => {

    client.on('voiceStateUpdate', async (oldState, newState) => {

        if(oldState.channel != newState.channel) {

          if(oldState.channel) {

              if(oldState.channel.members.size == 0) {
                let tempChannel = await client.schemas.get('tempChannel').findOne({ _id: oldState.channel.id})
                if(tempChannel) {
                  oldState.channel.delete()
                  await client.schemas.get('tempChannel').deleteOne({ _id: oldState.channel.id})
                }
              }
          }

          if(!newState.channel) return;

            const result = await client.schemas.get('server-settings').findOne({ _id: newState.guild.id})  

            if(!result.autoChannel_channel) return;
            if(newState.channel.id != result.autoChannel_channel) return;

            let name = result.autoChannel_name.replace('%USER[0]', newState.member.displayName.split(' ')[0])
            name = name.replace('%USER', newState.member.displayName)

            newState.guild.channels.create(name, {
                type: 'voice',
                parent: newState.channel.parent,
                permissionOverwrites: [
                   {
                     id: newState.member.id,
                     allow: ['MANAGE_CHANNELS'],
                  },
                ],
              }) .then(channel => {
                    newState.setChannel(channel)

                    client.schemas.get('tempChannel').create({_id: channel.id})

              })

        }

    })

}