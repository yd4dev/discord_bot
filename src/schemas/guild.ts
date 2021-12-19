import mongoose from 'mongoose';

const guildSchema = new mongoose.Schema({
	_id: { type: String, required: true },
	welcome_role: { type: String },
	logs_channel: { type: String },
}, { versionKey: false });

export default mongoose.model('guild', guildSchema);