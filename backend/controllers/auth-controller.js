const otpService = require('../services/otp-service.js');
const hashService = require('../services/hash-service.js');
const userService = require('../services/user-service.js');
const tokenService = require('../services/token-service.js');
const UserDto = require("../dtos/user-dtos.js");

class AuthController {
    async sendOtp(req , res) {
        const {name , rollNumber , year , branch , programme , email , phone} = req.body;

        if (!name || !rollNumber || !year || !branch || !programme || !email || !phone){
            return res.status(400).json({message : "All fields are required"});
        }

        const otp = await otpService.generateOtp();

        // time to leave
        const ttl = 1000 * 60 * 2; // 2mins
        const expires = Date.now() + ttl;
        const data = `${phone}.${otp}.${expires}`;

        // hash the data
        const hash = hashService.hashOtp(data);

        // send the otp
        try {
            // await otpService.sendBySms(phone , otp);
            return res.json({
                hash : `${hash}.${expires}` ,
                phone : phone ,
                otp
            });
        } catch(err) {
            console.log(err);
            res.status(500).json({message : 'Message sending failed'});
        }
    }

    async verifyOtp(req , res){
        // logic 
        const {otp , hash , phone} = req.body;

        if (!otp || !hash || !phone){
            return res.status(400).json({message : "All fields are required"});
        }

        const [hashedOtp , expires] = hash.split('.');
        if (Date.now() > +expires){
            return res.status(400).json({
                message : 'OTP expired'
            });
        }

        const data = `${phone}.${otp}.${expires}`;
        const isValid = otpService.verifyOtp(hashedOtp , data);

        if (!isValid){
            return res.status(400).json({message : 'Invalid OTP'});
        }

        let user;

        try {
            user = await userService.findUser({phone : phone});
        } catch(err) {
            console.log(err);
            res.status(500).json({message : 'DB error'});
        }

        // jwt token
        const {accessToken , refreshToken} = tokenService.generateTokens({
            _id : user._id ,
            activated : false
        });

        await tokenService.storeRefreshToken(refreshToken , user._id);

        // note -> Cookies attach to every request
        res.cookie('refreshtoken' , refreshToken , {
            maxAge : 1000 * 60 * 60 * 24 * 30 , // 30 days
            httpOnly : true ,
            sameSite : 'None' , // Allow cross origin site
            secure : true
        });

        
        res.cookie('accessToken' , accessToken , {
            maxAge : 1000 * 60 * 60 * 24 * 30 ,
            httpOnly : true ,
            sameSite : 'None' ,
            secure : true
        });


        const userDto = new UserDto(user);

        res.json({user : userDto , auth : true});
    }

    async refresh(req , res){
        // get the refresh token from cookie
        const {refreshtoken : refreshTokenFromCookie} = req.cookies;
        // check if token is valid
        let userData;
        try {
            userData = await tokenService.verifyRefreshToken(refreshTokenFromCookie);
        } catch (err){
            console.log(err);
            return res.status(401).json({message : "Invalid Token"});
        }


        // check if token is in database
        try {
            const token = await tokenService.findRefreshToken(userData._id , refreshTokenFromCookie);
            if (!token){
                return res.status(401).json({message : 'Invalid token'});
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({message : "Interval Error"});
        }

        // check if valid user
        const user = await userService.findUser({_id : userData._id});

        if (!user){
            return res.status(404).json({message : "No user"});
        }

        // generate new token
        const {accessToken , refreshToken} = tokenService.generateTokens({_id : userData._id});

        // update refresh token
        try {
            const userId = userData._id;
            await tokenService.updateRefreshToken(userId , refreshToken);
        } catch (err) {
            console.log(err);
            return res.status(500).json({message : "Internal server error"});
        }

        // put in cookie
        res.cookie('refreshToken' , refreshToken , {
            maxAge : 1000 * 60 * 60 * 24 * 30 ,
            httpOnly : true
        });

        res.cookie('accessToken' , accessToken , {
            maxAge : 1000 * 60 * 60 * 24 * 30 ,
            httpOnly : true
        });


        // response
        const userDto = new UserDto(user);
        console.log(userDto);
        res.json({user : userDto , auth : true});
    }


    async logout(req , res){
        const {refreshtoken} = req.cookies;

        // delete refresh token from db
        await tokenService.removeToken(refreshtoken);
        // delete cookies
        res.clearCookie('refreshtoken');
        res.clearCookie('accesstoken');
        res.json({user : null , auth : false});
    }
}


module.exports = new AuthController();