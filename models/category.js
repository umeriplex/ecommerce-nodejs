const { type } = require('express/lib/response');
const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name: { type: String, required: true },
    colour: { type: String, default: '#000000' },
    image: { type: String, required: true },
    markedForDeletion: { type: Boolean, default: false },
});

categorySchema.set('toObject', { virtual: true });

categorySchema.set('toJSON', { virtual: true });

exports.Category = mongoose.model('Category', categorySchema);
