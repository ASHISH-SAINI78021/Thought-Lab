const express = require('express');
const router = express.Router();
const AuthController = require('./controllers/auth-controller.js');
const UserController = require("./controllers/user-controller.js");
const attendanceController = require('./controllers/attendance-controller.js');
const upload = require("./middlewares/upload-middleware.js");
const BlogController = require('./controllers/blog-controller.js');

router.post('/api/send-otp' , AuthController.sendOtp);
router.post('/api/verify-otp' , AuthController.verifyOtp);
router.put('/api/increment-year' , UserController.incrementYear); // middleware
router.post('/api/attendance-register' , upload.single("image") , attendanceController.register);
router.post('/api/attendance-login' , upload.single("image") , attendanceController.login);

router.get('/all-blogs' , BlogController.allBlogs);
router.get('/all-blogs/:id' , BlogController.blog);
router.put('/:id/like' , BlogController.likeBlog);
// router.post('/comment' , BlogController.commentBlog);
router.get('/:id' , BlogController.comment);


// admin route
router.post("/add-blog" , upload.single("thumbnail") , BlogController.addBlog);
router.put("/blog/:id" , BlogController.updateBlog);

module.exports = router;