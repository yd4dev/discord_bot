module.exports = {
	name: 'unlock',
    description: 'Unlocks a channel.',
    args: false,
    permissions: 'MANAGE_MESSAGES',
    usage: '%prefixunlock',
	execute(message, args, client, prefix) {

        if (message.channel.permissionsFor(message.guild.roles.everyone).has('SEND_MESSAGES') && message.channel.permissionsFor(message.guild.roles.everyone).has('ADD_REACTIONS')) {
            
            message.channel.send('🔓 This channel is not locked.')

        }
        else {
         
            message.channel.updateOverwrite(message.guild.roles.everyone, {SEND_MESSAGES: null, ADD_REACTIONS: null})

            message.channel.send('🔓 Unlocked the channel.')
            
        }

    }
}