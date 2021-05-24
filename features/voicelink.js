module.exports = client => {

	client.on('voiceStateUpdate', (oldState, newState) => {

		if (oldState.channel === newState.channel) return;

		const { voicelinks } = client.data.guilds.get(newState.guild.id);

		if (!voicelinks) return;

		for (const k of voicelinks) {
			if (oldState?.channel?.id === k[0]) {
				if (oldState.guild.roles.cache.find(r => r.id == k[1])) {
					try {
						oldState.member.roles.remove(k[1]);
					}
					catch {
						//
					}
				}
			}
		}

		for (const k of voicelinks) {
			if (newState?.channel?.id === k[0]) {
				if (newState.guild.roles.cache.find(r => r.id == k[1])) {
					try {
						newState.member.roles.add(k[1]);
					}
					catch {
						//
					}
				}
			}
		}
	});
};