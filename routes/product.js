const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/products');
const ReviewsController = require('../controllers/reviews');



router.get('/', ProductController.getProducts);

router.get('/search', ProductController.searchProduct);

router.get('/:id', ProductController.getProductById);



router.post('/:id/review', ReviewsController.leaveReview);

router.get('/:id/reviews', ReviewsController.getProductReviews);



module.exports = router;