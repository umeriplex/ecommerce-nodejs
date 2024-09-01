const { Token } = require("../models/token");
const { User } = require("../models/user");

async function errorHendler (error, req, res, next) {
    if(error.name === 'UnauthorizedError'){
        if(!error.message.includes('jwt expired')){
            return res.status(error.status).json({ statusCode: error.status, success: false, message: error.message });
        }
        try{
            const tokenHeader = req.header('Authorization');

            console.log(`Token: ${tokenHeader}`);

            const accessToken = tokenHeader?.slip(' ')[1];

            let token = await Token.findOne({ accessToken, refreshToken: { $exists: true } });

            if(!token){
                return res.status(401).json({ statusCode: 401, success: false, message: 'Token not exist.' });
            }

            const userData = jwt.verify(token.refreshToken, process.env.REFRESH_TOKEN_SECRET);

            const user = await User.findById(userData.id);

            if(!user) return res.status(404).json({ statusCode: 404, success: false, message: 'Invalid user.' });

            const newAccessToken = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, process.env.ACCESS_TOKEN_SECRET, {expiresId: '24h'});

            req.headers['authorization'] =  `Bearer ${newAccessToken}`;

            await Token.updateOne({ _id: token.id }, {accessToken: newAccessToken} ).exec();

            res.set('Authorization', `Bearer ${newAccessToken}`);

            return next();

        }catch(refreshError){
            return res.status(401).json({ statusCode: 401, success: false, message: 'Unauthorized' });
        }
    }

    return res.status(400).json({ statusCode: 400, success: false, message: error.message });
}

module.exports = errorHendler;