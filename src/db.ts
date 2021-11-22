import { Collection } from 'discord.js';
import { DataClient } from '.';

import mongoose from 'mongoose';
import guildSchema from './schemas/guild';
require('dotenv').config();

const guilds = new Collection<string, any>();

module.exports = {
	async connect(client: DataClient) {

		// Initialize client database cache and set load and save function

		client.db = {
			loadGuild: guildLoad,
			saveGuild: guildSave,
		};

		await mongoose.connect(process.env.mongoPath!, {
			keepAlive: true,
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
		});
		return mongoose;
	},
};

export async function guildLoad(guildId: string): Promise<Record<string, any>> {
	const data = guilds.get(guildId) || await guildSchema.findOne({ _id: guildId });
	guilds.set(guildId, data);
	return data;
}
export async function guildSave(guildId: string, data: Record<string, any>): Promise<void> {
	await guildSchema.findOneAndUpdate({ _id: guildId }, data, { upsert: true });
	guilds.set(guildId, data);
}