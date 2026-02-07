const express = require('express');
const router = express.Router();
const AuthController = require('./controllers/auth-controller.js');
const UserController = require("./controllers/user-controller.js");
const attendanceController = require('./controllers/attendance-controller.js');
const upload = require("./middlewares/upload-middleware.js");
const BlogController = require('./controllers/blog-controller.js');
const CounsellorController = require('./controllers/counsellor-controller.js');
const GameController = require('./controllers/game-controller.js');
const MeditationController = require('./controllers/meditation-controller.js');
const CourseController = require("./controllers/course-controller.js");
const TaskController = require('./controllers/task-controller.js');
const { isLogin } = require('./middlewares/auth-middleware.js');
const { isAdmin } = require('./middlewares/admin-middleware.js');
const { isSuperAdmin } = require('./middlewares/superAdmin-middleware.js');

// authentication routes
router.post('/register', upload.single('profilePicture'), AuthController.registerStudent);
router.post('/login', AuthController.loginStudent);
router.post('/logout', isLogin, AuthController.logout);
router.get('/auth-status', isLogin, (req, res) => {
    return res.json({ success: true });
});

// user routes 
router.get('/user/:id', AuthController.getUser);
router.put('/api/increment-year', UserController.incrementYear); // middleware
router.get('/users', isLogin, isAdmin, UserController.getAllUsers); // Get all users for admin

// attendance routes
router.post('/api/attendance-register', upload.single("image"), isLogin, attendanceController.register);
router.post('/api/attendance-login', upload.single("image"), isLogin, attendanceController.login);
router.get("/download-attendance", attendanceController.downloadAttendance); // admin route

// blog routes
router.get('/all-blogs', BlogController.allBlogs);
router.get('/all-blogs/:id', BlogController.blog);
router.post("/add-blog", upload.single("thumbnail"), isLogin, isAdmin, BlogController.addBlog);
router.put("/blog/:id", isLogin, isAdmin, BlogController.updateBlog);
router.post('/blog/:id/react', isLogin, BlogController.reactToBlog);
router.get('/blog/:id/reactions', isLogin, BlogController.getReactions);
router.post('/blog/:blogId/comment', isLogin, BlogController.comment);

// counsellor routes
router.post("/counsellor/create-appointment", isLogin, CounsellorController.createAppointment);
router.patch("/counsellor/:id/approve", isLogin, isAdmin, CounsellorController.approveAppointment); // admin route
router.patch("/counsellor/:id/reject", isLogin, isAdmin, CounsellorController.rejectAppointment); // admin route
router.get("/counsellor/all-appointments", isLogin, isAdmin, CounsellorController.getAppointments);

// game routes
router.get('/all-games', GameController.getAllGames);
router.post('/create-game', isLogin, isAdmin, GameController.createGame); // admin route
router.put('/update-game/:id', isLogin, isAdmin, GameController.updateGame); // admin route
router.delete('/delete-game/:id', isLogin, isAdmin, GameController.deleteGame); // admin route

// meditation routes
router.get('/meditation-history', MeditationController.meditationHistory);
router.post('/meditation-session/:id', isLogin, MeditationController.meditationSession);

// courses routes
router.get('/courses', CourseController.getAllCourses);
router.get('/courses/search', CourseController.searchCourses);
router.get('/courses/:id', CourseController.getCourseById);
router.get('/courses/status/:status', CourseController.getCoursesByStatus);


router.post('/courses', isLogin, CourseController.createCourse);
router.post('/courses/:id/videos', isLogin, CourseController.addVideoToCourse);

// Admin-only routes
router.put('/courses/:id', isLogin, isAdmin, CourseController.updateCourse);
router.patch('/courses/:id/status', isLogin, isAdmin, CourseController.updateCourseStatus);
router.delete('/courses/:id', isLogin, isAdmin, CourseController.deleteCourse);
router.delete('/courses/:courseId/videos/:videoId', isLogin, isAdmin, CourseController.removeVideoFromCourse);


router.get('/courses-stats', isLogin, isAdmin, CourseController.getCourseStats);

router.get('/all-users-count', isLogin, isAdmin, AuthController.countAllUsers);
router.get('/all-events-count', isLogin, isAdmin, GameController.totalEvents);

router.put('/promote-to-admin', isLogin, isSuperAdmin, AuthController.promotion);

const NotificationController = require('./controllers/notification-controller.js');

// Task Routes
router.post('/tasks', isLogin, isAdmin, TaskController.createTask);
router.get('/tasks', isLogin, TaskController.getAllTasks);
router.post('/tasks/:taskId/bid', isLogin, TaskController.bidOnTask);
router.post('/tasks/:taskId/assign', isLogin, isAdmin, TaskController.assignTask);
router.post('/tasks/:taskId/complete', isLogin, isAdmin, TaskController.completeTask);
router.post('/tasks/:taskId/fail', isLogin, isAdmin, TaskController.failTask);
router.delete('/tasks/:taskId', isLogin, isAdmin, TaskController.deleteTask);

// Notification Routes
router.get('/notifications', isLogin, NotificationController.getNotifications);
router.post('/notifications/read', isLogin, NotificationController.markAsRead);

module.exports = router;