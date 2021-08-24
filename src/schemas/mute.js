const mongoose = require('mongoose');

const reqString = {
	type: String,
	required: true,
};

const mutesSchema = mongoose.Schema({
	guildId: reqString,
	userId: reqString,
	moderatorId: reqString,
	userRoles: { type: Array, required: false },
	expires: { type: Date, required: true },
}, {
	timestamps: true,
	versionKey: false,
});

module.exports = mongoose.model('mutes', mutesSchema);