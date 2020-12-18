const Discord = require('discord.js')

module.exports = {
	name: 'settings',
    description: 'An administrator command to show server settings.',
    args: false,
    permissions: 'ADMINISTRATOR',
    usage: '%prefixsettings',
	async execute(message, args, client, prefix) {

        let settings = await client.schemas.get('guild').findOne({ _id: message.guild.id })  

        let joinRoles = []
        settings.joinRoles.forEach(role => {
            joinRoles.push(message.guild.roles.cache.get(role))
        })

        let settingsEmbed = new Discord.MessageEmbed()
            .setTitle('Server Settings')
            .setAuthor(client.user.username, client.user.displayAvatarURL({dynamic: true}))
            .setDescription(`These settings can be changed by using \`${prefix}set\``)
            if (settings.prefix) settingsEmbed.addField('Prefix:', settings.prefix)      
            if (settings.logsChannelId) settingsEmbed.addField('Logs Channel:', `<#${settings.logsChannelId}>`)
            if (settings.bannedWords.length != 0) settingsEmbed.addField('Banned Words:', settings.bannedWords)
            if (joinRoles.length != 0) settingsEmbed.addField('Join Roles:', joinRoles)

        message.channel.send(settingsEmbed)

    }
}