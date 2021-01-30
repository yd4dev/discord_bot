const Discord = require('discord.js')

module.exports = {
	name: 'voicelink',
	description: 'Links roles to specific voice channels.',
	args: false,
	guild: true,
	usage: '%prefixvoicelink [voice channel id] [role mention / id] \n %prefixvoicelink remove [voice channel id]',
	permissions: 'MANAGE_CHANNELS',
	async execute(message, args, client, prefix) {

		async function saveMap(map) {

			await client.schemas.get('guild').findOneAndUpdate({
				_id: message.guild.id,
			}, {
				voicelinks: map,
			}, {
				upsert: true,
			})

		}

		// Clear Database entries if channel or role does not exist anymore.

		const { voicelinks } = await client.schemas.get('guild').findOne({ _id: message.guild.id })

		const VLMap = new Map(voicelinks)

		VLMap.forEach((v, k) => {

			if (!client.channels.cache.find(c => c.id === k) || !message.guild.roles.cache.find(r => r.id === v)) {

				VLMap.delete(k)

			}
		})

		if (VLMap !== voicelinks) {

			saveMap(VLMap)

		}


		// Voicelink List

		if (args.length === 0) {

			let voicelinks_str = ''

			VLMap.forEach((v, k) => {

				voicelinks_str += `🔊 ${client.channels.cache.find(c => c.id === k).name} [${client.channels.cache.find(c => c.id === k).id}] => ${message.guild.roles.cache.find(r => r.id === v)}\n`

			})

			const ListEmbed = new Discord.MessageEmbed()
				.setTitle('Voice Link')
				.setAuthor(client.user.username, client.user.displayAvatarURL())
				.setDescription(`Setup Voice Link by using \`${prefix}voicelink [voice channel id] [role mention / id]\` \n Remove Linked Channels by using \`${prefix}voicelink remove [voice channel id]\``)

			if (voicelinks_str) {
				ListEmbed.addField('Linked Channels', voicelinks_str)
			}


			message.channel.send(ListEmbed)

		}
		else if (args[0] === 'remove') {

			if (VLMap.has(args[1])) {

				VLMap.delete(args[1])

				saveMap(VLMap)

				message.channel.send('Successfully removed voice link.')

			}
			else {
				message.channel.send('Please provide a linked voice channel id.')
			}

		}
		else {

			const vc = message.guild.channels.cache.find(c => c.id == args[0])
			if (!vc || vc.type != 'voice') return message.channel.send('Please provide a valid voice channel id.')

			let role

			if (message.mentions.roles.size) {
				role = message.mentions.roles.first()
			}
			else {
				role = message.guild.roles.cache.find(r => r.id == args[1])
			}

			if (!message.guild.roles.cache.find(r => r == role)) return message.channel.send('Please provide a valid role.')

			VLMap.set(vc.id, role.id)

			saveMap(VLMap)

			message.channel.send(`Linked 🔊 \`${vc.name}\` to ${role}`)

		}

	},
};