const { Product } = require('../models/product');
const mongoose = require('mongoose');
const { User } = require('../models/user');
const { Review } = require('../models/review');
const jwt = require('jsonwebtoken');


const ReviewsController = {
    
    leaveReview : async function(req, res){
        try{

            if(!mongoose.isValidObjectId(req.params.id)){
                return res.status(404).json({ statusCode: 404, success: false, message: 'Invalid product id!'});
            }

            const user = await User.findById(req.body.user);
            if(!user){
                return res.status(404).json({ statusCode: 404, success: false, message: 'User not found!'});
            }

            let review = await Review({ ...req.body, userName: user.name }).save();

            if(!review){
                return res.status(400).json({ statusCode: 400, success: false, message: 'Review could not be added.'});
            }

            let product = await Product.findById(req.params.id);
            if(!product){
                return res.status(404).json({ statusCode: 404, success: false, message: 'Product not found.'});
            }

            product.reviews.push(review.id);

            product = await product.save();

            if(!product){
                return res.status(500).json({ statusCode: 500, success: false, message: 'Internal server error.'});
            }

            return res.status(200).json({ statusCode: 200, success: true, message: 'Success', data: review });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },


    getProductReviews : async function(req, res){
        const session = await mongoose.startSession();
        session.startTransaction();
        try{

            if(!mongoose.isValidObjectId(req.params.id)){
                return res.status(404).json({ statusCode: 404, success: false, message: 'Invalid product id!'});
            }

            const product = await Product.findById(req.params.id);

            if(!product){
                await session.abortTransaction();
                return res.status(404).json({ statusCode: 404, success: false, message: 'Product not found!'});
            }

            const page = req.query.page || 1;
            const pageSize = 10;

            const reviews = await Review
            .find({ _id: { $in: product.reviews } })
            .sort({ date: -1 })
            .skip((page - 1) * pageSize)
            .limit(pageSize);

            console.log(reviews);
            

            const processedReviews = [];

            for (const review of reviews){
                const user = await User.findById(review.user);
                if(!user){
                    processedReviews.push(review);
                    continue;
                }

                let newReview;
                if(review.userName != user.name){
                    review.userName = user.name;
                    newReview = await review.save({ session });
                }
                processedReviews.push(newReview ?? review);
            }

            await session.commitTransaction();

            return res.status(200).json({ statusCode: 200, success: true, message: 'Success', data: processedReviews });

        }catch(ex){
            await session.abortTransaction();
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }finally{
            await session.endSession();
        }
    },

};


module.exports = ReviewsController;