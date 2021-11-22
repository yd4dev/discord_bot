import mongoose from 'mongoose';

const guildSchema = new mongoose.Schema({
	_id: { type: String, required: true },
	waifusChannel: { type: String },
	waifusMessage: { type: String },
}, { versionKey: false });

export default mongoose.model('guild', guildSchema);