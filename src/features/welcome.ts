import { DataClient } from '..';

module.exports = (client: DataClient) => {
	client.on('guildMemberAdd', async (member) => {
		const { guild } = member;
		if (!guild) return;
		const { welcome_role } = await client.db.loadGuild(guild.id);
		const role = guild.roles.cache.get(welcome_role || '');
		if (role) await member.roles.add(role);
	});
};