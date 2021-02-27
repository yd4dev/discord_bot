const mongoose = require('mongoose');

const reqString = {
	type: String,
	required: true,
};

const guildSchema = mongoose.Schema({
	_id: reqString,
	name: { type: String },
	prefix: { type: String, default: '!' },
	logs: { type: Map, of: Boolean },
	logsChannelId: { type: String },
	joinRoles: { type: Array },
	welcome_plugin: { type: Boolean, default: false },
	welcome_title: { type: String, default: 'Welcome' },
	welcome_message: { type: String, default: '%name joined %guild.' },
	autoChannel_channel: { type: String },
	autoChannel_name: { type: String, default: '%USER' },
	voicelinks: { type: Map, of: String },
	ignoredChannels: [String],
}, { versionKey: false });

module.exports = mongoose.model('guild', guildSchema);