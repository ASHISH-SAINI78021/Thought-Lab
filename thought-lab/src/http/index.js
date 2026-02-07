import axios from 'axios';
import {url} from '../url';

const api = axios.create({
    baseURL : url , 
    withCredentials : true , 
    headers : {
        Accept : 'application/json'
    }
});

api.interceptors.request.use(
    (config)=> {
        const data = localStorage.getItem('auth');
        let token;
        if (data){
            const d = JSON.parse(data);
            if (d && d?.token) token = d.token; 
        }

        if (token){
            config.headers.Authorization = token;
        }

        if (config.data instanceof FormData){
            delete config.headers['Content-Type'];
        }

        return config;
    }
    ,(error)=>{
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
      // Only logout on 401 if it's NOT from attendance or notification endpoints
      // Attendance endpoints use 401 for face recognition failures, not auth failures
      const isAttendanceEndpoint = error.config?.url?.includes('/attendance-');
      const isNotificationEndpoint = error.config?.url?.includes('/notifications');
      
      if (error.response?.status === 401 && !isAttendanceEndpoint && !isNotificationEndpoint) {
        localStorage.removeItem('auth');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
);

// Course API functions - Add missing exports
export const getCourse = (courseId) => {
    if (!courseId) {
        return Promise.reject(new Error('Course ID is required'));
    }
    return api.get(`/courses/${courseId}`); 
};

export const saveCourse = (courseData, courseId = null) => {
    if (courseId) {
        return api.put(`/courses/${courseId}`, courseData);
    } else {
        return api.post(`/courses`, courseData);
    }
};

// Add these missing exports
export const updateCourse = (courseId, courseData) => {
    return api.put(`/courses/${courseId}`, courseData);
};

export const updateCourseStatus = (courseId, status) => {
    return api.patch(`/courses/${courseId}/status`, { status });
};

export const addVideoToCourse = (courseId, videoData) => {
    return api.post(`/courses/${courseId}/videos`, videoData);
};

export const removeVideoFromCourse = (courseId, videoId) => {
    return api.delete(`/courses/${courseId}/videos/${videoId}`);
};

export const getAllCourses = () => api.get('/courses');

// Existing endpoints (keep these)
export const sendOtp = (data) => api.post('/api/send-otp', {phone: data});
export const verifyOtp = (data) => api.post('/api/verify-otp', data);
export const activate = (data) => api.post('/api/activate', data);
export const logout = () => api.post('/api/logout');
export const addBlog = (data) => api.post('/add-blog', data, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
});
export const studentAttendanceLogin = (data) => api.post('/api/attendance-login', data, {
    headers : {
        'Content-Type' : 'multipart/form-data' 
    }
});
export const studentAttendanceRegister = (data) => api.post('/api/attendance-register', data, {
    headers : {
        'Content-Type' : 'multipart/form-data' 
    }
});
export const studentRegister = (formData) => api.post('/register', formData, {
    headers : {
        'Content-Type' : 'multipart/form-data' 
    }
});
export const promoteToAdmin = (data) => api.put('/promote-to-admin', data);
export const createAppointment = (data) => api.post('/counsellor/create-appointment', data);
export const getAllAppointments = (status) => api.get(`/counsellor/all-appointments?status=${status}`);
export const approveAppointment = (id) => api.patch(`/counsellor/${id}/approve`);
export const rejectAppointment = (id) => api.patch(`/counsellor/${id}/reject`);
export const getAllGames = () => api.get('/all-games');
export const createGame = (gameData) => api.post('/create-game', gameData);
export const updateGame = (gameId, gameData) => api.put(`/update-game/${gameId}`, gameData);
export const deleteGame = (gameId) => api.delete(`/delete-game/${gameId}`);
export const userLogin = (credentials) => api.post('/login', credentials);
export const getAllBlogs = () => api.get('/all-blogs');
export const getBlogById = (blogId) => api.get(`/all-blogs/${blogId}`);
export const reactToBlog = (blogId, type) => api.post(`/blog/${blogId}/react`, { type });
export const getBlogReactions = (blogId) => api.get(`/blog/${blogId}/reactions`);
export const addComment = (blogId, content) => api.post(`/blog/${blogId}/comment`, { content });
export const saveMeditationSession = (userId, sessionData)=> api.post(`/meditation-session/${userId}`, sessionData);
export const getMeditationHistory = () => api.get('/meditation-history');
export const getStudentProfile = (id) => api.get(`/user/${id}`);
export const getAllUsers = () => api.get('/users'); // New API for Admin

// Task API
export const createTask = (data) => api.post('/tasks', data);
export const getAllTasks = (status) => api.get(`/tasks?status=${status || ''}`);
export const bidOnTask = (taskId) => api.post(`/tasks/${taskId}/bid`);
export const assignTask = (taskId, payload) => api.post(`/tasks/${taskId}/assign`, payload);
export const completeTask = (taskId) => api.post(`/tasks/${taskId}/complete`);
export const failTask = (taskId) => api.post(`/tasks/${taskId}/fail`);
export const deleteTask = (taskId) => api.delete(`/tasks/${taskId}`);

// Notification API
export const getNotifications = () => api.get('/notifications');
export const markNotificationAsRead = (notificationId) => api.post('/notifications/read', { notificationId });

export default api;