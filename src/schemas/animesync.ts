import mongoose from 'mongoose';

const animeListsSchema = new mongoose.Schema({
	_id: { type: String, required: true },
	name: { type: String, required: true },
	site: { type: String, required: true },
}, { versionKey: false });

export default mongoose.model('animelist', animeListsSchema);