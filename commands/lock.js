module.exports = {
	name: 'lock',
    description: 'A moderator lock a channel.',
    args: false,
	execute(message, args, client, prefix) {
    
        if(!message.member.hasPermission('MANAGE_MESSAGES')) return message.reply('you do not have enough permissions to run this command. [MANAGE_MESSAGES]');

        if(message.channel.permissionsFor(message.guild.roles.everyone).has('SEND_MESSAGES') && message.channel.permissionsFor(message.guild.roles.everyone).has('ADD_REACTIONS')) {

            message.channel.updateOverwrite(message.guild.roles.everyone, {SEND_MESSAGES: false, ADD_REACTIONS: false})

            message.channel.send('🔒 Locked the channel.')
        }
        else {
            message.channel.send('🔒 This channel is already locked.')
        }

    }
}