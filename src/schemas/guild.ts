import mongoose from 'mongoose';

const guildSchema = new mongoose.Schema({
	_id: { type: String, required: true },
	welcome_role : { type: String },
}, { versionKey: false });

export default mongoose.model('guild', guildSchema);