const Discord = require('discord.js')

module.exports = {
	name: 'settings',
    description: 'An administrator command to show server settings.',
    args: false,
	async execute(message, args, client, prefix) {
    
        if(!message.member.hasPermission('ADMINISTRATOR')) return message.reply('I don\'t think you have enough permissions to run that command')

        let settings = await client.schemas.get('server-settings.js').findOne({ _id: message.guild.id})  

        let settingsEmbed = new Discord.MessageEmbed()
        .setTitle('Server Settings')
        .setAuthor(client.user.username, client.user.displayAvatarURL({dynamic: true}))
        .setDescription(`These settings can be changed by using \`${prefix}set\``)
        .addField('Prefix:', settings.prefix)
        .addField('Logs Channel:', `<#${settings.logsChannelId}>`)
        .addField('Banned Words:', settings.bannedWords)
        .addField('Join Roles:', settings.joinRoles)

        message.channel.send(settingsEmbed)

    }
}