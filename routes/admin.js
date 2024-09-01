const express = require('express');
const router = express.Router();
const UsersController = require('../controllers/admin/users');
const CategoriesController = require('../controllers/admin/categories');
const OrdersController = require('../controllers/admin/orders');
const ProductsController = require('../controllers/admin/products');





// Users
router.get('/users/count', UsersController.getUserCount);
router.delete('/users/:id', UsersController.deleteUser);


// Categories
router.post('/categories', CategoriesController.addCategory);
router.put('/categories/:id', CategoriesController.editCategory);
router.delete('/categories/:id', CategoriesController.deleteCategory);
router.get('/categories', CategoriesController.getCategories);



// Orders
router.get('/orders', OrdersController.getOrders);
router.get('/orders/count', OrdersController.getOrdersCount);
router.put('/orders/:id', OrdersController.changeOrderStatus);
router.delete('/orders/:id', OrdersController.deleteOrder);


// Products
router.get('/products/count', ProductsController.getProductsCount);
router.get('/products', ProductsController.getProducts);
router.post('/products', ProductsController.addProduct);
router.put('/products/:id', ProductsController.editProduct);
router.delete('/products/:id/images', ProductsController.deleteProductImages);
router.delete('/products/:id', ProductsController.deleteProduct);








module.exports = router;
