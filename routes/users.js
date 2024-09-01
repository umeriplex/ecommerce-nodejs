const express = require('express');
const router = express.Router();
const UserController = require('../controllers/users');
const WishListController = require('../controllers/wishlist');
const CartController = require('../controllers/cart');



router.get('/', UserController.getUsers);
router.get('/:id', UserController.getUserById);
router.put('/:id', UserController.updateUser);


router.get('/:id/wishlist', WishListController.getWishList);
router.post('/:id/wishlist', WishListController.addToWishList);
router.delete('/:id/wishlist/:productId', WishListController.removeFromWishlist);



router.get('/:id/cart', CartController.getUserCart);
router.get('/:id/cart/count', CartController.getUserCartCount);
router.get('/cart/:cartProductId', CartController.getCartProductById);
router.post('/:id/cart', CartController.addToCart);
router.put('/:id/cart/:cartProductId', CartController.modifyProductQuantity);
router.delete('/:id/cart/:cartProductId', CartController.removeFromCart);






module.exports = router;