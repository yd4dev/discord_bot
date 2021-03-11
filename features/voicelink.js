module.exports = client => {

	client.on('voiceStateUpdate', async (oldState, newState) => {

		if (oldState.channel === newState.channel) return;

		const { voicelinks } = await client.schemas.get('guild').findOne({ _id: newState.guild.id });

		if (!voicelinks) return;

		for (const k of voicelinks) {
			if (oldState?.channel?.id === k[0]) {
				if (oldState.guild.roles.cache.find(r => r.id == k[1])) {
					oldState.member.roles.remove(k[1]);
				}
			}
		}

		for (const k of voicelinks) {
			if (newState?.channel?.id === k[0]) {
				if (newState.guild.roles.cache.find(r => r.id == k[1])) {
					newState.member.roles.add(k[1]);
				}
			}
		}
	});
};