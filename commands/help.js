const Discord = require("discord.js");

module.exports = {
    name: 'help',
    description: 'Shows a list of all commands.',
    args: false,
    usage: '%prefixhelp (command)',
    commandHelp(message, commandName, prefix, client) {

        if (client.commands.has(commandName)) {

            const command = client.commands.get(commandName)

            let minArgs = command.args

            if (minArgs == false) minArgs = 0

            let usage = command.usage.replace(/%prefix/g, prefix)
            
            let commandHelp = new Discord.MessageEmbed()
                .setTitle('Help ' + command.name)
                .setAuthor(client.user.username, client.user.displayAvatarURL())
                .setColor(Math.floor(Math.random() * 16777215).toString(16))
                .setFooter('Use !help for a list of all available commands.')
            if (command.description) commandHelp.setDescription(command.description)
            if (command.usage) commandHelp.addField('Usage', usage, 1)
            commandHelp.addField('Required Arguments', minArgs, 1)
            if (command.permissions) commandHelp.addField('Required Permissions', command.permissions, 1)
            
            message.channel.send(commandHelp)

        } else {
            message.channel.send('That command does not exist.')
        }

    },
    execute(message, args, client, prefix) {

        if (args[0]) {

            if (args[0].startsWith(prefix)) {
                args[0].slice(0, prefix.length - 1)
            }

            this.commandHelp(message, args[0], prefix, client)

        } else {

            let categories = new Map()

            client.commands.forEach(element => {
                if (!categories.get(element.category)) categories.set(element.category, [])
                categories.get(element.category).push(element.name)

            })

            let HelpEmbed = new Discord.MessageEmbed()
                .setTitle('Help')
                .setAuthor(client.user.username, client.user.displayAvatarURL())
                .setDescription(`The server's prefix is set to \`${prefix}\`.`)
                .setColor(Math.floor(Math.random() * 16777215).toString(16))
                .setFooter('Use !help (command) for detailed information.', client.user.displayAvatarURL())

            categories.forEach((values, key) => {
                let commands = []
                values.forEach(e => {
                    commands.push(client.commands.get(e).name + ' | ' + client.commands.get(e).description)
                })
                HelpEmbed.addField(key, commands)
            })

            message.channel.send(HelpEmbed)
        }
	}
}