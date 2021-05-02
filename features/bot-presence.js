module.exports = client => {
	const activities = [
		{ name: `${client.guilds.cache.size} servers`, type: 'COMPETING' },
		{ name: 'with Dennis#4064', type: 'PLAYING' },
		{ name: 'you ¯\\_(ツ)_/¯', type: 'WATCHING' },
		{ name: 'your conversations', type: 'LISTENING' },
		{ name: 'with your data', type: 'STREAMING' },
	];

	(function setPresence() {

		let activity;

		do {
			activity = activities[Math.floor(Math.random() * activities.length)];
		} while (client.user.presence.activities[0]?.name === activity.name);
		client.user.setActivity(activity);
		setTimeout(setPresence, 120000);
	})();
};