const Discord = require("discord.js");

module.exports = {
	name: 'help',
    description: 'Shows a list of all commands.',
	args: false,
	usage: '%prefixhelp (command)',
    execute(message, args, client, prefix) {
        
        let categories = new Map()
        
        client.commands.forEach(element => {
            if (!categories.get(element.category)) categories.set(element.category, [])
            categories.get(element.category).push(element.name)
            
        });

        let HelpEmbed = new Discord.MessageEmbed()
            .setTitle('Help')
            .setAuthor(client.user.username, client.user.displayAvatarURL())
            .setColor(Math.floor(Math.random()*16777215).toString(16))
            .setFooter('Use !help (command) for detailed information.', client.user.displayAvatarURL())
        
        categories.forEach((values, key) => {
            let commands = []
            values.forEach(e => {
                commands.push(client.commands.get(e).name + ' | ' + client.commands.get(e).description)
            })
            HelpEmbed.addField(key, commands)
        })

        message.channel.send(HelpEmbed)

	},
};