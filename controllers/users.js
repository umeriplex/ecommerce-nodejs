const { User } = require('../models/user');



const UserController = {
    
    getUsers : async function(req, res){
        try{
            const users = await User.find().select('name email id isAdmin');

            if(!users){
                return res.status(404).json({ statusCode: 404, success: false, message: 'Users not found!'});
            }

            return res.status(200).json({ statusCode: 200, success: true, message: 'Success', data: users });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },


    getUserById : async function(req, res){
        try{
            const user = await User.findById(req.params.id).select(
                '-password -resetPasswordOtp -resetPasswordOtpExpire -cart'
            );

            if(!user){
                return res.status(404).json({ statusCode: 404, success: false, message: 'User not found!'});
            }

            return res.status(200).json({ statusCode: 200, success: true, message: 'Success', data: user });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },


    updateUser : async function(req, res){
        try{
            const { name, email, phone } = req.body;
            const user = await User.findByIdAndUpdate(
                req.params.id,
                { name, email, phone },
                { new: true }
            ).select(
                '-password -resetPasswordOtp -resetPasswordOtpExpire -cart'
            );

            if(!user){
                return res.status(404).json({ statusCode: 404, success: false, message: 'User not found!'});
            }

            return res.status(200).json({ statusCode: 200, success: true, message: 'User updated!', data: user });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },

    getWishList : async function(req, res){
        try{
            const { name, email, phone } = req.body;
            const user = await User.findByIdAndUpdate(
                req.params.userId,
                { name, email, phone },
                { new: true }
            ).select(
                '-password -resetPasswordOtp -resetPasswordOtpExpire -cart'
            );

            if(!user){
                return res.status(404).json({ statusCode: 404, success: false, message: 'User not found!'});
            }

            return res.status(200).json({ statusCode: 200, success: true, message: 'User updated!', data: user });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },

    addToWishList : async function(req, res){
        try{
            const { name, email, phone } = req.body;
            const user = await User.findByIdAndUpdate(
                req.params.userId,
                { name, email, phone },
                { new: true }
            ).select(
                '-password -resetPasswordOtp -resetPasswordOtpExpire -cart'
            );

            if(!user){
                return res.status(404).json({ statusCode: 404, success: false, message: 'User not found!'});
            }

            return res.status(200).json({ statusCode: 200, success: true, message: 'User updated!', data: user });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },

    deleteWishList : async function(req, res){
        try{
            const { name, email, phone } = req.body;
            const user = await User.findByIdAndUpdate(
                req.params.userId,
                { name, email, phone },
                { new: true }
            ).select(
                '-password -resetPasswordOtp -resetPasswordOtpExpire -cart'
            );

            if(!user){
                return res.status(404).json({ statusCode: 404, success: false, message: 'User not found!'});
            }

            return res.status(200).json({ statusCode: 200, success: true, message: 'User updated!', data: user });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },

};


module.exports = UserController;