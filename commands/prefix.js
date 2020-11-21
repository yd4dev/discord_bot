module.exports = {
	name: 'prefix',
    description: 'An administrator command to chane the server\'s prefix.',
    args: true,
	async execute(message, args, client, prefix) {
        
        if (!message.member.hasPermission('ADMINISTRATOR')) return message.reply('I don\'t think you have enough permissions to run that command')

        await client.schemas.get('server-settings.js').findOneAndUpdate({
            _id: message.guild.id
        }, {
            _id: message.guild.id,
            prefix: args[0]
        }, {
            upsert: true
        })

        message.channel.send(`I have changed the server's prefix to \`${args[0]}\``)

	},
};