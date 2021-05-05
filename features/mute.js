module.exports = client => {

	const checkMutes = async () => {

		const now = Date.now();

		const conditional = {
			expires: {
				$lt: now,
			},
		};

		const results = await client.schemas.get('mute').find(conditional);

		if (results?.length) {
			for (const result of results) {

				const guild = client.guilds.cache.get(result.guildId);

				if (!guild) return;

				const member = await guild.members.fetch(result.userId);

				const { joinRoles, mutedRole } = client.data.guilds.get(guild.id);

				if(joinRoles) {
					joinRoles.forEach(role => {
						member.roles.add(role);
					});
				}

				if(result.userRoles.length > 0) {

					const previousRoleIDs = result.userRoles;

					previousRoleIDs.forEach(element => {
						member.roles.add(guild.roles.cache.find(role => role.id === element));
					});
				}

				member.roles.remove(mutedRole);

			}

			await client.schemas.get('mute').deleteMany(conditional);

		}

		setTimeout(checkMutes, 1000 * 60);
	};

	checkMutes();

	client.on('guildMemberAdd', async member => {

		const currentMute = await client.schemas.get('mute').findOne({
			guildId: member.guild.id,
			userId: member.id,
		});

		if (currentMute) {
			const { mutedRole } = client.data.guilds.get(member.guild.id);

			if (mutedRole) {
				member.roles.add(mutedRole);
			}
		}
	});

	client.on('channelCreate', async channel => {
		if (channel.type !== 'text') return;

		const { mutedRole } = client.data.guilds.get(channel.guild.id);

		if(mutedRole) {
			channel.updateOverwrite(mutedRole, { SEND_MESSAGES: false, ADD_REACTIONS: false });
		}
	});
};