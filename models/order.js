const { type } = require("express/lib/response");
const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  orderItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem', required: true }],
  shippingAddress: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: String,
  country: { type: String, required: true },
  phone: { type: String, required: true },
  paymentId: String,
  status: {
    type: String,
    required: true,
    default: 'pending',
    enum: [
      "pending",
      "processed",
      "shiped",
      "out-for-delivery",
      "delivered",
      "canceled",
      "on-hold",
      "expired",
    ],
  },
  statusHistory: {
    type: [String],
    required: true,
    default: ['pending'],
    enum: [
        "pending",
        "processed",
        "shiped",
        "out-for-delivery",
        "delivered",
        "canceled",
        "on-hold",
        "expired",
    ],
  },
  totalPrice: Number,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dateOrdered: { type: Date, default: Date.now },
});


orderSchema.set('toObject', { virtual: true });

orderSchema.set('toJSON', { virtual: true });

exports.Order = mongoose.model("Order", orderSchema);
