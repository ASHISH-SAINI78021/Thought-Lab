const jwt = require('jsonwebtoken');
const accessTokenSecret = process.env.JWT_ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET;
const refreshModel = require('../Models/refresh-model.js');

class TokenService {
    generateTokens(payload){
        const accessToken = jwt.sign(payload , accessTokenSecret , {
            expiresIn : '1m'
        });

        const refreshToken = jwt.sign(payload , refreshTokenSecret , {
            expiresIn : '1y'
        });

        return {
            accessToken , refreshToken
        }
    }

    async storeRefreshToken(token , userId){
        try {
            refreshModel.create({
                token , userId
            })
        } catch (error) {
            console.log(err.message);
        }
    }

    async verifyAccessToken(token){
        return jwt.verify(token , accessTokenSecret);
    }

    async verifyRefreshToken(token){
        const value = jwt.verify(token , refreshTokenSecret);
        return value;
    }

    async findRefreshToken(userId , refreshToken){
        return await refreshModel.findOne({userId : userId , token : refreshToken});
    }

    async updateRefreshToken(userId , refreshToken){
        return await refreshModel.updateOne({userId : userId} , {token : refreshToken});
    }

    async removeToken(refreshToken){
        return await refreshModel.deleteOne({token : refreshToken});
    }
}


module.exports = new TokenService();