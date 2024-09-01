const mongoose = require('mongoose');

const cartProductSchema = mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, required: true, required: true },
    quantity: { type: Number, default: 1 },
    selectedSize: String,
    selectedColour: String,
    productName: { type: String, required: true },
    productImage: { type: String, required: true },
    productPrice: { type: Number, required: true },
    reservationExpiry: { 
        type: Date,
        default: () => new Date(Date.now() + 30 * 60 * 1000),
    },
    reserved: { type: Boolean, default: true } 
});

cartProductSchema.set('toObject', { virtual: true });

cartProductSchema.set('toJSON', { virtual: true });

exports.CartProduct = mongoose.model('CartProduct', cartProductSchema);
