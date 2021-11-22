import mongoose from 'mongoose';
const reqString = {
	type: String,
	required: true,
};

const mutesSchema = new mongoose.Schema({
	guildId: reqString,
	userId: reqString,
	moderatorId: reqString,
	reason: String,
	userRoles: { type: Array, required: false },
	expires: { type: Date, required: true },
}, {
	timestamps: true,
	versionKey: false,
});

export default mongoose.model('mute', mutesSchema);