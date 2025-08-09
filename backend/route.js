const express = require('express');
const router = express.Router();
const AuthController = require('./controllers/auth-controller.js');
const UserController = require("./controllers/user-controller.js");
const attendanceController = require('./controllers/attendance-controller.js');
const upload = require("./middlewares/upload-middleware.js");
const BlogController = require('./controllers/blog-controller.js');
const CounsellorController = require('./controllers/counsellor-controller.js');
const GameController = require('./controllers/game-controller.js');
const { isLogin } = require('./middlewares/auth-middleware.js');
const { isAdmin } = require('./middlewares/admin-middleware.js');

router.post('/register', upload.single('profilePicture'), AuthController.registerStudent);
router.post('/login', AuthController.loginStudent);
router.put('/api/increment-year' , UserController.incrementYear); // middleware
router.post('/api/attendance-register', upload.single("image"), isLogin , attendanceController.register);
router.post('/api/attendance-login', upload.single("image"), isLogin , attendanceController.login);

router.get('/all-blogs' , BlogController.allBlogs);
router.get('/all-blogs/:id' , BlogController.blog);
// router.put('/:id/like' , BlogController.likeBlog);
// router.get('/:id' , BlogController.comment);


// admin route
router.post("/add-blog",upload.single("thumbnail"), isLogin, isAdmin, BlogController.addBlog);
router.put("/blog/:id", isLogin, isAdmin, BlogController.updateBlog);


// counsellor route
router.post("/counsellor/create-appointment", isLogin, CounsellorController.createAppointment);
router.patch("/counsellor/:id/approve" ,isLogin, isAdmin, CounsellorController.approveAppointment); // admin route
router.patch("/counsellor/:id/reject" ,isLogin, isAdmin, CounsellorController.rejectAppointment); // admin route
router.get("/counsellor/all-appointments", isLogin, isAdmin, CounsellorController.getAppointments);


// Attendance Route
router.get("/download-attendance", isLogin, isAdmin, attendanceController.downloadAttendance); // admin route

// Game Route
router.get('/all-games', GameController.getAllGames);// admin route
router.post('/create-game', isLogin, isAdmin, GameController.createGame);// admin route
router.put('/update-game/:id', isLogin, isAdmin, GameController.updateGame); // admin route
router.delete('/delete-game/:id', isLogin, isAdmin, GameController.deleteGame); // admin route

module.exports = router;