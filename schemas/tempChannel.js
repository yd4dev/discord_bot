const mongoose = require('mongoose');

const reqString = {
    type: String,
    required: true
};

const tempChannelSchema = mongoose.Schema({
    _id: reqString
}, { versionKey: false });

module.exports = mongoose.model('tempChannel', tempChannelSchema);