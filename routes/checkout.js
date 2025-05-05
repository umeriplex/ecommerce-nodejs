const express = require('express');
const router = express.Router();
const CheckoutController = require('../controllers/checkout');


router.post('/', CheckoutController.checkout);
//router.post('/webhook', express.raw({ type: 'application/json' }), CheckoutController.webhook);



module.exports = router;