require('dotenv/config');
var jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');



async function authorizedPostResquest(req, req, next) {
    if(req.method !== 'POST') return next();
    const API = process.env.VERSION;
    if(req.originalUrl.startsWith(`${API}/admin`)) return next();

    const endPoints = [
        `${API}/auth/login`,
        `${API}/auth/register`,
        `${API}/auth/forgotPassword`,
        `${API}/auth/verifyPasswordOtp`,
        `${API}/auth/resetPassword`,
      ];

    const matchingEndPoints = endPoints.some((endPoint) => req.originalUrl.includes(endPoint));  
    if(matchingEndPoints) return next();

    const authHeader = req.header('Authorization');
    if(!authHeader) return next();

    const accessToken = authHeader.replace('Bearer','').trim();
    const tokenData = jwt.decode(accessToken);

    if(req.body.user && tokenData.id !== req.body.user){
        return res.status(401).json({ statusCode: 401, success: false, message: 'UnAuthorized! Hacker Fuck You _|_' });
    }else if (/\/users\/([^/]+)\//.test(req.originalUrl)){

        const part = req.originalUrl.split('/');
        const usersIndex = part.indexOf('users');

        const id = part[usersIndex + 1];

        if(!mongoose.isValidObjectId(id)) return next();

        if(tokenData.id !== id){
            return res.status(401).json({ statusCode: 401, success: false, message: 'UnAuthorized! Hacker Fuck You _|_' });
        }
    }
    return next();
}

module.exports = authorizedPostResquest;