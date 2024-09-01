const { Product } = require('../models/product');
const mongoose = require('mongoose');
const { User } = require('../models/user');
const { Review } = require('../models/review');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_KEY);


const CheckoutController = {
    checkout : async function(req, res){
        try{

            let accessToken = req.header('Autoriztion');
            if(!accessToken){
                return res.status(401).json({ statusCode: 401, success: false, message: 'UnAuthorixed!'});
            }

            accessToken = accessToken.replace('Bearer', '').trim();
            const tokenData = jwt.decode(accessToken);
            const user = await User.findById(tokenData.id);
            if(!user){
                return res.status(404).json({ statusCode: 404, success: false, message: 'User not found!'});
            }


            for (const cartItem of req.body.cartItems){
                const product = await Product.findById(cartItem.producutId);
                if(!product){
                    return res.status(404).json({ statusCode: 404, success: false, message: `${cartItem.name} not found!`});
                }
                else if (!cartItem.reserved && product.countInStock < cartItem.quantity){
                    return res.status(400).json({ statusCode: 400, success: false, message: `${product.name} order for ${cartItem.quantity}, but ${product.countInStock} left in stock.`});
                }
            }

            let customerId;
            if(user.paymentCustomerId){
                customerId = user.paymentCustomerId;
            }else{
                const customer = await stripe.customes.create({
                    metadata: { userId: tokenData.id },
                });
                customerId = customer.id;
            }

            const session = await stripe.checkout.sessions.create({
                line_items: req.body.cartItems.map((item) => {
                    return {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: item.name,
                                image: item.images,
                                metadata: {
                                    productId: item.productId,
                                    cartProductId: item.cartProductId,
                                    seletedSize: item.selectedSize ?? undefined,
                                    seletecColour: item.seletecColour ?? undefined,
                                },
                            },
                            unit_amount: (item.price * 100).toFixed(0)
                        },
                        quantity: item.quantity,
                    };
                }),
                payment_method_options: {
                    card: { setup_future_usage: 'on_session' },
                },
                billing_address_collection: 'auto',
                shipping_address_collection: {
                    allowed_countries: ['UK', 'US', 'PK', 'QA', 'IN', 'AF'],
                }, 
                phone_number_collection: {enabled: true},
                customer: customerId,
                mode: 'payment',
                success_url: 'https://bazar.pk/payment-success',
                cancel_url: 'https://bazar.pk/payment-cancel',
            });
            return res.status(200).json({ statusCode: 200, success: true, message: 'Success', data: session.url });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },
};


module.exports = CheckoutController;