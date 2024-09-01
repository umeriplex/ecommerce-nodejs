const { OrderItem } = require('../../models/order_items');
const { CartProduct } = require('../../models/cart_product');
const { Category } = require('../../models/category');
const { Order } = require('../../models/order');
const { Product } = require('../../models/product');
const { Review } = require('../../models/review');
const { User } = require('../../models/user');
const { Token } = require('../../models/token');



const UsersController = {
    getUserCount: async function(req, res){
        try{

            const count = await User.countDocuments();
            if(!count){
                return res.status(500).json({ statusCode: 500, success: false, message: 'Could not count users.' });
            }

            return res.status(200).json({ statusCode: 200, success: true, message: 'Success', data: { count } });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },


    deleteUser: async function(req, res){
        try{

            const userId = await req.params.id;
            const user = await User.findById(userId);
            if(!user){
                return res.status(404).json({ statusCode: 404, success: false, message: 'User not found.' });
            }

            const orders = await Order.find({user: userId});
            const orderItemIds = await orders.flatMap((eachOrder) => eachOrder.orderItems);

            await Order.deleteMany({ user: userId });
            await OrderItem.deleteMany({ _id: {$in : orderItemIds} });

            await CartProduct.deleteMany({ _id: {$id: user.cart} });

            await User.findByIdAndUpdate(userId, { $pull: { cart: {$exists: true} } });

            await Token.deleteOne({ userId: userId });

            await User.deleteOne({ _id: userId });

            return res.status(200).json({ statusCode: 200, success: true, message: 'User deleted.' });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },

};

module.exports = UsersController;