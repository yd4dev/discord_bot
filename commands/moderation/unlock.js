module.exports = {
	name: 'unlock',
    description: 'Unlocks a channel.',
    args: false,
    permissions: 'MANAGE_MESSAGES',
    usage: '%prefixunlock',
	execute(message, args, client, prefix) {

        if(message.channel.permissionsFor(message.guild.roles.everyone).has('SEND_MESSAGES') && message.channel.permissionsFor(message.guild.roles.everyone).has('ADD_REACTIONS') ) {

            message.channel.updateOverwrite(message.guild.roles.everyone, {SEND_MESSAGES: true, ADD_REACTIONS: true})

            message.channel.send('🔓 Unlocked the channel.')
        }
        else {
            message.channel.send('🔓 This channel is not locked.')
        }

    }
}