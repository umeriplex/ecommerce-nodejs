const { Product } = require('../models/product');
const mongoose = require('mongoose');
const { User } = require('../models/user');
const { Review } = require('../models/review');
const jwt = require('jsonwebtoken');
const { CartProduct } = require('../models/cart_product');


const CartController = {
    getUserCart : async function(req, res){
        try{
            const user = await User.findById(req.params.id);
            if(!user){
                return res.status(404).json({ statusCode: 404, success: false, message: 'User not found!'});
            }

            const cartProducts = await CartProduct.find({ _id: { $in: user.cart} });
            if(!cartProducts){
                return res.status(404).json({ statusCode: 404, success: false, message: 'Cart not found!'});
            }

            var cart = [];
            for(const cartProduct of cartProducts){
                const product = await Product.findById(cartProduct.product);
                if(!product){
                    cart.push({ ...cartProduct._doc, productExists: false, productOutOfStock: false});
                }
                else{
                    cartProduct.productName = product.name;
                    cartProduct.productImage = product.image;
                    cartProduct.productPrice = product.price;

                    if(product.countInStock < cartProduct.quantity){
                        cart.push({ ...cartProduct._doc, productExists: true, productOutOfStock: true });
                    }
                    else{
                        cart.push({ ...cartProduct._doc, productExists: true, productOutOfStock: false });
                    }
                }
            }


            return res.status(200).json({ statusCode: 200, success: true, message: 'Success.', data: cart });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },

    getUserCartCount : async function(req, res){
        try{
            const user = await User.findById(req.params.id);
            if(!user){
                return res.status(404).json({ statusCode: 404, success: false, message: 'User not found!'});
            }
            return res.status(200).json({ statusCode: 200, success: true, message: 'Success.', data: user.cart });
        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },

    getCartProductById : async function(req, res){
        try{
            
            const cartProduct = await CartProduct.findById(req.params.cartProductId);
            if(!cartProduct){
                return res.status(404).json({ statusCode: 404, success: false, message: 'Cart Product not found!'});
            }

            var cart = [];
            const product = await Product.findById(cartProduct.product);
            if(!product){
                cart.push({ ...cartProduct._doc, productExists: false, productOutOfStock: false});
            }
            else{
                cartProduct.productName = product.name;
                cartProduct.productImage = product.image;
                cartProduct.productPrice = product.price;

                if(product.countInStock < cartProduct.quantity){
                    cart.push({ ...cartProduct._doc, productExists: true, productOutOfStock: true });
                }
                else{
                    cart.push({ ...cartProduct._doc, productExists: true, productOutOfStock: false });
                }
            }

            return res.status(200).json({ statusCode: 200, success: true, message: 'Success.', data: cart });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },

    addToCart : async function(req, res){
        const sessions = await mongoose.startSession();
        sessions.startTransaction();
        try{
            
            const { productId } = req.body;
            const user = await User.findById(req.params.id);
            if(!user){
                await sessions.abortTransaction();
                return res.status(404).json({ statusCode: 404, success: false, message: 'User not found!'});
            }

            const userCartProducts = await CartProduct.find({ _id: {$in: user.cart} });
            const existingCartItem = userCartProducts.find(
                (item) => item.productId == productId &&
                item.selectedSize === req.body.selectedSize &&
                item.selectedColour === req.body.selectedColour
            );

            const product = await Product.findById(productId).session(sessions);
            if(!product){
                await sessions.abortTransaction();
                return res.status(404).json({ statusCode: 404, success: false, message: 'Product not found!'});
            }

            if(existingCartItem){
                let condition = product.countInStock >= existingCartItem.quantity + 1;
                if(existingCartItem.reserved){
                    condition = product.countInStock >= 1;
                }

                if(condition){
                    existingCartItem.quantity += 1;

                    await existingCartItem.save({ sessions });

                    await Product.findOneAndUpdate(
                        { _id: productId },
                        { $inc: { countInStock: -1 } },
                    ).session(sessions);

                    await sessions.commitTransaction();
                    return res.status(200).json({ statusCode: 200, success: true, message: 'Product added.' });

                }
                await sessions.abortTransaction();
                return res.status(404).json({ statusCode: 404, success: false, message: 'Product out of stock.'});
            }
            
            const { quantity, selectedSize, selectedColour } =  req.body;

            const cartProduct = await new CartProduct({ 
                quantity,
                selectedSize,
                selectedColour,
                product: productId,
                productName: product.name,
                productImage: product.image,
                productPrice: product.price
             }).save({ sessions });

             if(!cartProduct){
                await sessions.abortTransaction();
                return res.status(404).json({ statusCode: 404, success: false, message: 'Product could not be added.'});
            }

            user.cart.push(cartProduct.id);

            await user.save({ sessions });

            const updatedProduct = await Product.findOneAndUpdate(
                { _id: productId, countInStock: { $gte: cartProduct.quantity }, },
                { $inc: { countInStock: -cartProduct.quantity } },
                { new: true, sessions },
            );

            if(!updatedProduct){
                await sessions.abortTransaction();
                return res.status(400).json({ statusCode: 400, success: false, message: 'Insufficient stick or consurrency issue.'});
            }

            await sessions.commitTransaction();
            return res.status(200).json({ statusCode: 200, success: true, message: 'Product added.', data: cartProduct });
        }catch(ex){
            await sessions.abortTransaction();
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        } finally {
            await sessions.endSession();
        }
    },

    modifyProductQuantity : async function(req, res){
        try{
            const user = await User.findById(req.params.id);
            if(!user){
                return res.status(404).json({ statusCode: 404, success: false, message: 'User not found!'});
            }

            const { quantity } = req.body;
            let cartProduct = await CartProduct.findById(req.params.cartProductId);
            if(!cartProduct){
                return res.status(404).json({ statusCode: 404, success: false, message: 'Product not found!'});
            }

            const actualProduct = await Product.findById(cartProduct.product);
            if(!actualProduct){
                return res.status(404).json({ statusCode: 404, success: false, message: 'Product does not exist!'});
            }

            if(quantity > actualProduct.countInStock){
                return res.status(400).json({ statusCode: 400, success: false, message: 'Insufficient stick for the requested quantity.'});
            }

            cartProduct = await CartProduct.findByIdAndUpdate(req.params.cartProductId, quantity, { new:true });
            if(!cartProduct){
                return res.status(404).json({ statusCode: 404, success: false, message: 'Product not found!'});
            }
        
            return res.status(200).json({ statusCode: 200, success: true, message: 'Quantity Updated.', data: cartProduct });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },

    removeFromCart : async function(req, res){
        const sessions = await mongoose.startSession();
        sessions.startTransaction();
        try{

            const user = await User.findById(req.params.id);
            if(!user){
                await sessions.abortTransaction();
                return res.status(404).json({ statusCode: 404, success: false, message: 'User not found!'});
            }

            if(!user.cart.includes(req.params.cartProductId)){
                await sessions.abortTransaction();
                return res.status(404).json({ statusCode: 404, success: false, message: 'Product not in the user\'s cart!'});
            }

            const cartItemToRemoved = await CartProduct.findById(req.params.cartProductId)
            if(!cartItemToRemoved){
                await sessions.abortTransaction();
                return res.status(404).json({ statusCode: 404, success: false, message: 'Cart item not found!'});
            }

            if(cartItemToRemoved.reserved){
                const updatedProduct = await Product.findOneAndUpdate(
                    { _id: cartItemToRemoved.product },
                    { $inc: { countInStock: cartItemToRemoved.quantity } },
                    { new: true, sessions },
                );

                if(!updatedProduct){
                    await sessions.abortTransaction();
                    return res.status(500).json({ statusCode: 500, success: false, message: 'Internal server error.'});
                }
            }

            user.cart.pull(cartItemToRemoved.id);
            await user.save({ sessions });

            const deletedCartItem = await CartProduct.findByIdAndDelete(cartItemToRemoved.id).session(sessions);
            if(!deletedCartItem){
                await sessions.abortTransaction();
                return res.status(500).json({ statusCode: 500, success: false, message: 'Failed.'});
            }

            await sessions.commitTransaction();
            return res.status(200).json({ statusCode: 200, success: true, message: 'Removed.'});
        }catch(ex){
            await sessions.abortTransaction();
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        } finally {
            await sessions.endSession();
        }
    },

};


module.exports = CartController;