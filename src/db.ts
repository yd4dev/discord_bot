import { Collection } from 'discord.js';
import { DataClient } from '.';

const mongoose = require('mongoose');
const guildSchema = require('./schemas/guild');
require('dotenv').config();

module.exports = {
	async connect(client: DataClient) {

		// Initialize client database cache and set load and save function

		client.db = {
			guilds: new Collection()
				.set('load', guildLoad)
				.set('save', guildSave),
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

async function guildLoad(client: DataClient, guildId: string) {
	const data = client.db.guilds.get(guildId) || await guildSchema.findOne({ _id: guildId });
	client.db.guilds.set(guildId, data);
	return data;
}
async function guildSave(client: DataClient, guildId: string, data: Record<string, any>) {
	await guildSchema.findOneAndUpdate({ _id: guildId }, data, { upsert: true });
	client.db.guilds.set(guildId, data);
}