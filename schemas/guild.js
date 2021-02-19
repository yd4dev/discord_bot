const mongoose = require('mongoose');

const reqString = {
	type: String,
	required: true,
};

const guildSchema = mongoose.Schema({
	_id: reqString,
	prefix: { type: String },
	logs: { type: Map, of: Boolean },
	logsChannelId: { type: String },
	joinRoles: { type: Array },
	autoChannel_channel: { type: String },
	autoChannel_name: { type: String },
	voicelinks: { type: Map, of: String },
	ignoredChannels: [String],
}, { versionKey: false });

module.exports = mongoose.model('guild', guildSchema);