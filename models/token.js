const mongoose = require('mongoose');


const tokenSchema = mongoose.Schema({ 
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        ref: 'User'
    },
    refreshToken: {
        type: String,
        required: true
    },
    accessToken: String,
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 86400
    }
 });

exports.Token = mongoose.model('Token', tokenSchema);