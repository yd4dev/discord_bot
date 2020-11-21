const mongoose = require('mongoose');

const reqString = {
    type: String,
    required: true
};

const serverSettingsSchema = mongoose.Schema({
    _id: reqString,
    prefix: {type: String},
    logsChannelId: {type: String},
    joinRoles: {type: Array},
    bannedWords: {type: Array}
});

module.exports = mongoose.model('server-settings', serverSettingsSchema);