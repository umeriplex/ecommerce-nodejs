const { type } = require('express/lib/response');
const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
    date: { type: Date, default: Date.now },
});

reviewSchema.set('toObject', { virtual: true });

reviewSchema.set('toJSON', { virtual: true });

exports.Review = mongoose.model('Review', reviewSchema);
