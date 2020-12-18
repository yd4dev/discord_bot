const Discord = require('discord.js')

module.exports = {
	name: 'voicelink',
    description: 'Links roles to specific voice channels.',
	args: false,
    usage: '%prefixvoicelink [voice channel id] [role mention / id] \n %prefixvoicelink remove [voice channel id]',
    permissions: 'MANAGE_CHANNELS',
	async execute(message, args, client, prefix) {
        
        if (args.length == 0) {
            let ListEmbed = new Discord.MessageEmbed()
                .setTitle('Voice Link')
                .setAuthor(client.user.username, client.user.displayAvatarURL())
                .setDescription(`Setup Voice Link by using \`${prefix}voicelink [voice channel id] [role mention / id]\` \n Remove Linked Channels by using \`${prefix}voicelink remove [voice channel id]\``)
                .addField('Linked Channels',)
            
            message.channel.send(ListEmbed)
            
        } else {

            const vc = message.guild.channels.cache.find(c => c.id == args[0])
            if (!vc || vc.type != 'voice') return message.channel.send('Please provide a voice channel.')

            args.shift()

            let role = ''
            
            if (message.mentions.roles.size) {
                role = message.mentions.roles.first()
            } else {
                role = message.guild.roles.cache.find(r => r.id == args[0])
            }

            if (!message.guild.roles.cache.find(r => r == role)) return message.channel.send('Please provide a valid role.')

            const result = await client.schemas.get('guild').findOne({ _id: message.guild.id })

            let VLMap = new Map()
            
            if (result.voicelinks) {
                VLMap = result.voicelinks

            }
            
            VLMap.set(vc.id, role.id)

            await client.schemas.get('guild').findOneAndUpdate({
                _id: message.guild.id
            }, {
                voicelinks: VLMap
            }, {
                upsert: true
            })
            
            message.channel.send(`Linked 🔈 ${vc.name} to ${role}`)

        }

	},
};