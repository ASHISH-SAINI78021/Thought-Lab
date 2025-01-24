const express = require('express');
const router = express.Router();
const AuthController = require('./controllers/auth-controller.js');
const UserController = require("./controllers/user-controller.js");

router.post('/api/send-otp' , AuthController.sendOtp);
router.post('/api/verify-otp' , AuthController.verifyOtp);
router.put('/api/increment-year' , UserController.incrementYear); // middleware

module.exports = router;