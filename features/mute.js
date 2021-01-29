module.exports = client => {

	const checkMutes = async () => {

		const now = Date.now()

		const conditional = {
			expires: {
				$lt: now,
			},
		}

		const results = await client.schemas.get('mute').find(conditional)

		if (results && results.length) {
			for (const result of results) {

				const guild = client.guilds.cache.get(result.guildId)

				const member = await guild.members.fetch(result.userId)

				const joinRoles = await client.schemas.get('guild').findOne({ _id: guild.id })

				if(joinRoles.joinRoles) {
					joinRoles.joinRoles.forEach(role => {
						member.roles.add(role)
					})
				}

				if(result.userRoles) {

					const previousRoleIDs = result.userRoles

					previousRoleIDs.forEach(element => {
						member.roles.add(guild.roles.cache.find(role => role.id === element))
					});
				}

				const mutedRole = guild.roles.cache.find(role => role.name === 'Muted')

				member.roles.remove(mutedRole)

			}

			await client.schemas.get('mute').deleteMany(conditional)

		}

		setTimeout(checkMutes, 1000 * 60)
	}

	checkMutes()

	client.on('guildMemberAdd', async member => {

		const currentMute = await client.schemas.get('mute').findOne({
			guildId: member.guild.id,
			userId: member.id,
		})

		if (currentMute) {
			const role = member.guild.roles.cache.find(role => {
				return role.name === 'Muted'
			});

			if (role) {
				member.roles.add(role);
			}
		}

	})

	client.on('channelCreate', channel => {
		if (channel.type != 'TextChannel') return

		const mutedRole = channel.guild.roles.cache.find(role => role.name === 'Muted')

		if(mutedRole) {
			channel.updateOverwrite(mutedRole, { SEND_MESSAGES: false })
		}

	})

}