const { type } = require('express/lib/response');
const mongoose = require('mongoose');

var validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};
const userSchema = mongoose.Schema({ 
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        required: true,
        type: String
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    isAdmin: { 
        type: Boolean,
        default: false
    },
    paymentCustomerId: String,
    resetPasswordOtp: Number,
    resetPasswordOtpExpire: Date,
    cart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CartProduct' }],
    wishList: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            productName: { type: String, required: true },
            productImage: { type: String, required: true },
            productPrice: { type: Number, required: true },
        },
    ],
 });

 userSchema.index({email: 1}, {unique: true});

 userSchema.set('toObject', { virtual: true });

 userSchema.set('toJSON', { virtual: true });


 exports.User = mongoose.model('User', userSchema);