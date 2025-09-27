const Course = require('../Models/course-model.js');
const User = require('../Models/user-model.js');

class CourseController {
    // Get all courses
    async getAllCourses(req, res) {
        try {
            const courses = await Course.find().sort({ createdAt: -1 });
            res.json(courses);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching courses', error: error.message });
        }
    }

    // Get single course by ID
    async getCourseById(req, res) {
        try {
            const course = await Course.findById(req.params.id);
            
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
            
            res.json(course);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching course', error: error.message });
        }
    }

    // Create new course
    async createCourse(req, res) {
        try {
            // Validate required fields
            const { title, category } = req.body;
            
            if (!title || !category) {
                return res.status(400).json({
                    success: false,
                    message: 'Title and category are required fields'
                });
            }

            console.log("req : ", req.user);
            const user = await User.findById(req.user.id);

            const courseData = {
                ...req.body,
                creatorId: req.user._id,
                creatorName: user?.name || 'Ashish'
            };

            // Validate video data if provided
            if (courseData.videos && Array.isArray(courseData.videos)) {
                courseData.videos = courseData.videos.map((video, index) => ({
                    title: video.title || `Video ${index + 1}`,
                    url: video.url || '',
                    duration: video.duration || '00:00',
                    order: video.order || index
                }));
            }

            const course = new Course(courseData);
            // console.log("Course : ", course);
            const savedCourse = await course.save();
            
            res.status(201).json({
                success: true,
                message: 'Course created successfully',
                data: savedCourse
            });
        } catch (error) {
            console.error('Create course error:', error);
            
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: messages
                });
            }
            
            res.status(500).json({ 
                success: false,
                message: 'Error creating course', 
                error: error.message 
            });
        }
    }

    // Update course
    async updateCourse(req, res) {
        try {
            const { title, category } = req.body;
            
            if (title && title.length < 3) {
                return res.status(400).json({
                    success: false,
                    message: 'Title must be at least 3 characters long'
                });
            }

            const course = await Course.findById(req.params.id);
            
            if (!course) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Course not found' 
                });
            }
            
            // Check if user is the creator or admin
            if (course.creatorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ 
                    success: false,
                    message: 'Access denied. You can only edit your own courses.' 
                });
            }
            
            // Update only provided fields
            const updateData = { ...req.body };
            
            // Handle videos array properly
            if (updateData.videos && Array.isArray(updateData.videos)) {
                updateData.videos = updateData.videos.map((video, index) => ({
                    _id: video._id || new mongoose.Types.ObjectId(),
                    title: video.title || `Video ${index + 1}`,
                    url: video.url || '',
                    duration: video.duration || '00:00',
                    order: video.order || index
                }));
            }
            
            const updatedCourse = await Course.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true, runValidators: true }
            );
            
            res.json({
                success: true,
                message: 'Course updated successfully',
                data: updatedCourse
            });
        } catch (error) {
            console.error('Update course error:', error);
            
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: messages
                });
            }
            
            res.status(400).json({ 
                success: false,
                message: 'Error updating course', 
                error: error.message 
            });
        }
    }

    // Update course status
    async updateCourseStatus(req, res) {
        try {
            const { status } = req.body;
            
            if (!['draft', 'published', 'archived'].includes(status)) {
                return res.status(400).json({ message: 'Invalid status' });
            }
            
            const course = await Course.findByIdAndUpdate(
                req.params.id,
                { status },
                { new: true, runValidators: true }
            );
            
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
            
            res.json(course);
        } catch (error) {
            res.status(400).json({ message: 'Error updating course status', error: error.message });
        }
    }

    // Delete course
    async deleteCourse(req, res) {
        try {
            const course = await Course.findByIdAndDelete(req.params.id);
            
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
            
            res.json({ message: 'Course deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting course', error: error.message });
        }
    }

    // Add video to course
    async addVideoToCourse(req, res) {
        try {
            const { title, url, duration } = req.body;
            
            const course = await Course.findById(req.params.id);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
            
            const newVideo = {
                title,
                url,
                duration: duration || '00:00',
                order: course.videos.length
            };
            
            course.videos.push(newVideo);
            await course.save();
            
            res.json(course);
        } catch (error) {
            res.status(400).json({ message: 'Error adding video', error: error.message });
        }
    }

    // Remove video from course
    async removeVideoFromCourse(req, res) {
        try {
            const { videoId } = req.params;
            
            const course = await Course.findById(req.params.courseId);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
            
            course.videos = course.videos.filter(video => video._id.toString() !== videoId);
            await course.save();
            
            res.json(course);
        } catch (error) {
            res.status(400).json({ message: 'Error removing video', error: error.message });
        }
    }

    // Additional method: Get courses by status
    async getCoursesByStatus(req, res) {
        try {
            const { status } = req.params;
            
            if (!['draft', 'published', 'archived'].includes(status)) {
                return res.status(400).json({ message: 'Invalid status' });
            }
            
            const courses = await Course.find({ status }).sort({ createdAt: -1 });
            res.json(courses);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching courses by status', error: error.message });
        }
    }

    // Additional method: Search courses
    async searchCourses(req, res) {
        try {
            const { query } = req.query;
            
            if (!query) {
                return res.status(400).json({ message: 'Search query is required' });
            }
            
            const courses = await Course.find({
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } },
                    { category: { $regex: query, $options: 'i' } }
                ]
            }).sort({ createdAt: -1 });
            
            res.json(courses);
        } catch (error) {
            res.status(500).json({ message: 'Error searching courses', error: error.message });
        }
    }

    // Additional method: Get course statistics
    async getCourseStats(req, res) {
        try {
            const stats = await Course.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        totalVideos: { $sum: { $size: '$videos' } },
                        avgVideos: { $avg: { $size: '$videos' } }
                    }
                },
                {
                    $project: {
                        status: '$_id',
                        count: 1,
                        totalVideos: 1,
                        avgVideos: { $round: ['$avgVideos', 2] },
                        _id: 0
                    }
                }
            ]);
            
            res.json(stats);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching course statistics', error: error.message });
        }
    }
}

// Create an instance of the controller
const courseController = new CourseController();

module.exports = courseController;