import mongoose from 'mongoose';

const animeListsSchema = new mongoose.Schema({
	_id: { type: String, required: true },
	mal: { type: String, required: false },
	anilist: { type: String, required: false },
}, { versionKey: false });

export default mongoose.model('animelist', animeListsSchema);