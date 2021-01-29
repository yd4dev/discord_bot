module.exports = {
	name: 'join',
    description: 'A simple test command.',
    args: false,
    guild: true,
    permissions: 'BOT_OWNER',
    usage: '%prefixjoin',
	execute(message, args, client, prefix) {

        if(!args[0]) return message.channel.send('Please provide a voice channel id.')
        if(message.guild.channels.cache.find(channel => channel.id == args[0]).type != 'voice') return message.channel.send('This is not a voice channel.')
        
        message.guild.channels.cache.find(channel => channel.id == args[0]).join()

	},
};