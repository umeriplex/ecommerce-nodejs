const { validationResult } = require('express-validator');
const { User } = require('../models/user');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const { Token } = require('../models/token');
const MailSender = require('../helpers/email_sender');



const AuthController = { 

    registerUser: async function(req, res){
        try{
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                const errorMessage = errors.errors[0].msg;
                return res.status(400).json({ statusCode: 400, success: false, message: errorMessage });
            }else{
                const {phone, email, password} = req.body;
    
                const existingUser = await User.findOne({ email });
                if(existingUser){
                    return res.status(400).json({ statusCode: 400, success: false, message: 'User already exist with same email address!'});
                }

                const existingPhone = await User.findOne({ phone });
                if(existingPhone){
                    return res.status(400).json({ statusCode: 400, success: false, message: 'User already exist with same phone number!'});
                }

                const hashPassword = await bcrypt.hash(password,8);
                let user = new User({ ...req.body, password: hashPassword });

                user = await user.save();

                if(!user){
                    return res.status(500).json({ statusCode: 500, success: false, message: 'Could not create new user.' });
                }

                res.status(200).json({ statusCode: 200, success: true, message: 'User Created!', data: user });
            }
        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },


    loginUser: async function(req, res){
        try{
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if(!user){
                return res.status(400).json({ statusCode: 400, success: false, message: 'User not found, please write email again & try again!' });
            }
            if(!bcrypt.compareSync(password, user.password)){
                return res.status(400).json({ statusCode: 400, success: false, message: 'Incorrect password!' });
            }

            const accessToken = jwt.sign(
                { id: user.id, isAdmin: user.isAdmin },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '24h' },
            );


            const refreshToken = jwt.sign(
                { id: user.id, isAdmin: user.isAdmin },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '60d' },
            );

            const token = await Token.findOne({userId: user.id});

            if(token) await token.deleteOne();

            await new Token({ userId: user.id, accessToken, refreshToken }).save();

            user.password = undefined;

            res.status(200).json({ statusCode: 200, success: true, message: 'Success', data: {...user._doc, accessToken} });
            
        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },


    verifyToken: async function(req, res){
        try{
            let accessToken = req.headers.authorization;
            if(!accessToken) return res.status(401).json({ statusCode: 401, success: false, message: 'Not Authorized!' });
            accessToken = accessToken.replace('Bearer','').trim();
            const token = await Token.findOne({accessToken});
            if(!token) return res.status(401).json({ statusCode: 401, success: false, message: 'Not Authorized!' });

            const tokenData = jwt.decode(token.refreshToken);
            const user = await User.findById(tokenData.id);

            if(!user) return res.status(401).json({ statusCode: 401, success: false, message: 'Not Authorized!' });

            const isValid = jwt.verify(token.refreshToken, process.env.ACCESS_TOKEN_SECRET);
            if(!isValid) return res.status(401).json({ statusCode: 401, success: false, message: 'Not Authorized!' });

            return res.status(200).json({ statusCode: 200, success: true, message: 'Success' });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },


    forgotPassword: async function(req, res){
        try{
            const { email } = req.body;
            let user = await User.findOne({email});
            if(!user) return res.status(400).json({ statusCode: 400, success: false, message: 'User not found!' });

            const otp = Math.floor(1000 + Math.random() * 9000);
            user.resetPasswordOtp = otp;
            user.resetPasswordOtpExpire = Date.now() + 600000;

            await user.save();

            const response = await MailSender.sendMail(
                email,
                'Reset Password OTP',
                `The OTP is ${otp}`
            );
            res.status(200).json({ statusCode: 200, success: true, message: response });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },


    verifyPasswordOtp: async function(req, res){
        try{
            const { otp, email } = req.body;
            let user = await User.findOne({email});
            if(!user) return res.status(400).json({ statusCode: 400, success: false, message: 'User not found!' });

            if(user.resetPasswordOtp !== +otp) {
                return res.status(401).json({ statusCode: 401, success: false, message: 'Invalid Otp!' });
            }

            if(Date.now() > user.resetPasswordOtpExpire) {
                return res.status(401).json({ statusCode: 401, success: false, message: 'OTP expired!' });
            }


            user.resetPasswordOtp = 1;
            user.resetPasswordOtpExpire = undefined;

            await user.save();

            return res.status(200).json({ statusCode: 200, success: true, message: 'Success' });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },


    resetPassword: async function(req, res){
        try{
            const { newPassword, email } = req.body;
            let user = await User.findOne({email});
            if(!user) return res.status(400).json({ statusCode: 400, success: false, message: 'User not found!' });

            if(user.resetPasswordOtp !== +1) return res.status(401).json({ statusCode: 401, success: false, message: 'You are a hacker, Fuck You!' });

            if(bcrypt.compareSync(newPassword, user.password)){
                return res.status(400).json({ statusCode: 400, success: false, message: 'Password already used, please try different one!' });
            }

            user.password = bcrypt.hashSync(newPassword, 8);
            user.resetPasswordOtp = undefined;
            await user.save();

            return res.status(200).json({ statusCode: 200, success: true, message: 'Password reset successfully!' });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },


 };

 module.exports = AuthController;