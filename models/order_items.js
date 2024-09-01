const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({ 
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', requied: true },
    productName: { type: String, required: true },
    productImage: { type: String, required: true },
    productPrice: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    selectedSize: String,
    selectedColour: String,
 });

 orderItemSchema.set('toObject', { virtual: true });

 orderItemSchema.set('toJSON', { virtual: true });


exports.OrderItem = mongoose.model('OrderItem', orderItemSchema);