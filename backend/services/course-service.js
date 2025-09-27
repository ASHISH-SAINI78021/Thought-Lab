const CourseModel = require('../Models/course-model.js');
const mongoose = require('mongoose');

const DUMMY_USER_ID = new mongoose.Types.ObjectId("60c72b0f951e4d3a2c8f8e13"); 

class CourseRepository {
    static async create(courseData) {
        const newCourse = new CourseModel({
            ...courseData,
            creatorId: DUMMY_USER_ID, 
            status: 'draft',
        });
        return await newCourse.save();
    }

    static async update(courseId, courseData) {
        const course = await CourseModel.findOneAndUpdate(
            { _id: courseId, creatorId: DUMMY_USER_ID }, 
            courseData,
            { new: true, runValidators: true }
        );
        return course;
    }

    static async updateStatus(courseId, newStatus) {
        const course = await CourseModel.findOneAndUpdate(
            { _id: courseId, creatorId: DUMMY_USER_ID },
            { $set: { status: newStatus } },
            { new: true }
        );
        return course;
    }

    static async findById(courseId) {
        return await CourseModel.findById(courseId);
    }
}

module.exports = CourseRepository;