const mongoose = require('mongoose');

const reqString = {
    type: String,
    required: true
};

const ticketCategorySchema = mongoose.Schema({
    guild_id: reqString,
    category_name: reqString,
    category_channel: {type: String},
    category_message: {type: String},
    embed_title: {type: String},
    embed_message: {type: String},
    staff_roles: {type: Array}
});

module.exports = mongoose.model('ticketCategory', ticketCategorySchema);