const { CartProduct } = require('../../models/cart_product');
const { Category } = require('../../models/category');
const { Order } = require('../../models/order');
const { Product } = require('../../models/product');
const { Review } = require('../../models/review');
const { User } = require('../../models/user');
const { Token } = require('../../models/token');
const mediaHelper = require('../../helpers/media_helper')
const util = require('util');
const { error } = require('console');
const path = require('path');
const { OrderItem } = require('../../models/order_items');

const OrdersController = {
    getOrders: async function(req, res){
        try{

            const orders = await Order
            .find()
            .populate('user', '-password -cart')
            .select('-statusHistory')
            .sort({ dateOrdered: -1 })
            .populate({ 
                path: 'orderItems',
                populate: {
                    path: 'product',
                    select: 'name',
                    populate: {
                        path: 'category'
                    },
                },
             });
            
            if(!orders){
                return res.status(404).json({ statusCode: 404, success: false, message: 'Orders not found.' });
            }



            return res.status(200).json({ statusCode: 200, success: true, message: 'Success.', data: orders });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },


    getOrdersCount: async function(req, res){
        try{

            const count = await Order.countDocuments();

            if(!count){
                return res.status(500).json({ statusCode: 500, success: false, message: 'Could not count orders.' });
            }

            return res.status(200).json({ statusCode: 200, success: true, message: 'Success', data: { count } });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },

    changeOrderStatus: async function(req, res){
        try{

            const orderId = req.params.id;
            const newStatus = req.body.status;

            const order = await Order.findById(orderId);

            if(!order){
                return res.status(400).json({ statusCode: 400, success: false, message: 'Order not found.' });
            }

            if(!order.statusHistory.includes(order.status)){
                order.statusHistory.push(order.status);
            }

            order.status = newStatus;

            order = await order.save();


            return res.status(200).json({ statusCode: 200, success: true, message: 'Order status updated.', data: order });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },

    deleteOrder: async function(req, res){
        try{

            const orderId = req.params.id;
            const order = await Order.findByIdAndDelete(orderId);

            if(!order){
                return res.status(404).json({ statusCode: 404, success: false, message: 'Order not found.' });
            }

            for(const orderItemId of order.orderItems){
                await OrderItem.findByIdAndDelete(orderItemId);
            }

            return res.status(200).json({ statusCode: 200, success: true, message: 'Order deleted.'});

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },
};

module.exports = OrdersController;