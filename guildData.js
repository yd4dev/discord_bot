/*
 * This file is used to save & load guild settings
 * into the client's data cache (client.data.guilds)
 */

module.exports = {
	async load(guildId, client) {
		console.log('Database Load');
		client.data.guilds.set(guildId, await client.schemas.get('guild').findOne(
			{ _id: guildId },
		) || new Object());
	},
	async save(guildId, client, data) {
		console.log('Database Save');
		await client.schemas.get('guild').findOneAndUpdate({
			_id: guildId,
		}, data, {
			upsert: true,
		});
		Object.keys(data).forEach(k => {
			client.data.guilds.get(guildId)[k] = data[k];
		});
	},
};