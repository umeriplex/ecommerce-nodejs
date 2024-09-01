const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/auth');
const { body } =  require('express-validator');

const validateUser = [ 
    body('name').not().isEmpty().withMessage('Name is required!'),
    body('email').isEmail().withMessage('Please enter a valid email!'),
    body('password')
    .isLength({ min: 6 }).withMessage('Password must be atleast 6 characters!')
    .isStrongPassword().withMessage('Password must contain at least 1 symbols, upper-case, lower-case and number!'),
    body('phone').isMobilePhone().withMessage('Please enter a valid phone number!'),
 ];

router.post('/login', AuthController.loginUser);

router.post('/register', validateUser, AuthController.registerUser);

router.get('/verifyToken', validateUser, AuthController.verifyToken);

router.post('/forgotPassword', validateUser, AuthController.forgotPassword);

router.post('/verifyPasswordOtp', validateUser, AuthController.verifyPasswordOtp);

router.post('/resetPassword', validateUser, AuthController.resetPassword);







module.exports = router;