const mongoose = require('mongoose');

const reqString = {
    type: String,
    required: true
};

const tempChannelSchema = mongoose.Schema({
    _id: reqString
});

module.exports = mongoose.model('tempChannel', tempChannelSchema);