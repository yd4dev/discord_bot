module.exports = client => {

	client.on('guildMemberAdd', async member => {

		const currentMute = await client.schemas.get('mute').findOne({
			guildId: member.guild.id,
			userId: member.id,
		})

		if (currentMute) return

		const result = await client.schemas.get('guild').findOne({ _id: member.guild.id })

		if(result.joinRoles) {
			result.joinRoles.forEach(role => {
				member.roles.add(role)
			})
		}

	})
}