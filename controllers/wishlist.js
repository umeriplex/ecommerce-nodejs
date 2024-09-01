const { Product } = require('../models/product');
const mongoose = require('mongoose');
const { User } = require('../models/user');
const { Review } = require('../models/review');
const jwt = require('jsonwebtoken');


const WishListController = {
    getWishList : async function(req, res){
        try{
            const user = await User.findById(req.params.id);

            if(!user){
                return res.status(404).json({ statusCode: 404, success: false, message: 'User not found!'});
            }

            const wishList = [];

            for(const item of user.wishList){
                const product = await Product.findById(item.productId);
                if(!product){
                    wishList.push({
                        ...item,
                        productExists: false,
                        productOutOfStock: false
                    });
                }
                else if (product.countInStock < 1){
                    wishList.push({
                        ...item,
                        productExists: true,
                        productOutOfStock: true
                    });
                }
                else{
                    wishList.push({
                        productId: product._id,
                        productName: product.name,
                        productImage: product.image,
                        productPrice: product.price,
                        productExists: true,
                        productOutOfStock: false
                    });
                }
            }

            return res.status(200).json({ statusCode: 200, success: true, message: 'Success', data: wishList });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },

    addToWishList : async function(req, res){
        try{
            const user = await User.findById(req.params.id);
            if(!user){
                return res.status(404).json({ statusCode: 404, success: false, message: 'User not found!'});
            }

            const product = await Product.findById(req.body.productId);
            if(!product){
                return res.status(404).json({ statusCode: 404, success: false, message: 'Could not add product. Product not found!'});
            }

            const productAlreadyEsixt = await user.wishList.find((item) => item.productId == req.body.productId );
            if(productAlreadyEsixt){
                return res.status(409).json({ statusCode: 409, success: false, message: 'Product already exist in wishlist.'});
            }

            user.wishList.push({
                productId: req.body.productId,
                productName: product.name,
                productImage: product.image,
                productPrice: product.price,
             });

            await user.save();

            return res.status(200).json({ statusCode: 200, success: true, message: 'Product added to wishlist.' });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },

    removeFromWishlist : async function(req, res){
        try{

            const userId = req.params.id;
            const productId = req.params.productId;

            const user = await User.findById(userId);

            if(!user){
                return res.status(404).json({ statusCode: 404, success: false, message: 'User not found!'});
            }

            const index = user.wishList.findIndex((item) => item.productId == productId );

            if(index === -1){
                return res.status(404).json({ statusCode: 404, success: false, message: 'Product not found in wishlist.'});
            }

            user.wishList.splice(index, 1);

            await user.save();

            return res.status(200).json({ statusCode: 200, success: true, message: 'Item removed from wishlist.' });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },

};


module.exports = WishListController;