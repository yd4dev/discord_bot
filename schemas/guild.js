const mongoose = require('mongoose');

const reqString = {
    type: String,
    required: true
};

const guildSchema = mongoose.Schema({
    _id: reqString,
    prefix: { type: String },
    logsChannelId: { type: String },
    joinRoles: { type: Array },
    autoChannel_channel: { type: String },
    autoChannel_name: { type: String },
    voicelinks: { type: Map, of: String }
}, { versionKey: false });

module.exports = mongoose.model('guild', guildSchema);