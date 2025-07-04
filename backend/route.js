const express = require('express');
const router = express.Router();
const AuthController = require('./controllers/auth-controller.js');
const UserController = require("./controllers/user-controller.js");
const attendanceController = require('./controllers/attendance-controller.js');
const upload = require("./middlewares/upload-middleware.js");
const BlogController = require('./controllers/blog-controller.js');
const CounsellorController = require('./controllers/counsellor-controller.js');
const GameController = require('./controllers/game-controller.js');

router.post('/register', upload.single('profilePicture'), AuthController.registerStudent);
router.post('/login', AuthController.loginStudent);
router.put('/api/increment-year' , UserController.incrementYear); // middleware
router.post('/api/attendance-register' , upload.single("image") , attendanceController.register);
router.post('/api/attendance-login' , upload.single("image") , attendanceController.login);

router.get('/all-blogs' , BlogController.allBlogs);
router.get('/all-blogs/:id' , BlogController.blog);
// router.put('/:id/like' , BlogController.likeBlog);
// router.get('/:id' , BlogController.comment);


// admin route
router.post("/add-blog" , upload.single("thumbnail") , BlogController.addBlog);
router.put("/blog/:id" , BlogController.updateBlog);


// counsellor route
router.post("/counsellor/create-appointment" , CounsellorController.createAppointment);
router.patch("/counsellor/:id/approve" , CounsellorController.approveAppointment); // admin route
router.patch("/counsellor/:id/reject" , CounsellorController.rejectAppointment); // admin route
router.get("/counsellor/all-appointments" , CounsellorController.getAppointments);


// Attendance Route
router.get("/download-attendance" , attendanceController.downloadAttendance); // admin route

// Game Route
router.get('/all-games', GameController.getAllGames);// admin route
router.post('/create-game', GameController.createGame);// admin route
router.put('/update-game/:id', GameController.updateGame); // admin route
router.delete('/delete-game/:id', GameController.deleteGame); // admin route

module.exports = router;