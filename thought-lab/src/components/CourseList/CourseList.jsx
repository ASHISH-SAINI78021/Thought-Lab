import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, Clock, Search, Filter, Edit, Plus } from 'lucide-react';
import { getAllCourses } from '../../http';
import './CourseList.css';
import { useAuth } from '../../Context/auth';

const CourseList = () => {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [auth, setAuth] = useAuth();

    const isAdmin = auth?.user?.role == 'admin' || auth?.user?.role === 'superAdmin';

    const categories = ['all', 'Web Development', 'Video Editing', 'Graphic Designing', 'Marketing'];
    const levels = [
        { value: 'all', label: 'All Levels' },
        { value: 'beginner', label: 'Beginner' },
        { value: 'intermediate', label: 'Intermediate' },
        { value: 'advanced', label: 'Advanced' }
    ];

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        filterCourses();
    }, [courses, searchTerm, selectedCategory, selectedLevel]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await getAllCourses();
            const coursesData = response.data.data || response.data || [];
            setCourses(coursesData);
        } catch (err) {
            setError('Failed to load courses');
            console.error('Error fetching courses:', err);
        } finally {
            setLoading(false);
        }
    };

    const filterCourses = () => {
        let filtered = courses.filter(course => 
            course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.category.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(course => course.category === selectedCategory);
        }

        if (selectedLevel !== 'all') {
            filtered = filtered.filter(course => course.level === selectedLevel);
        }

        setFilteredCourses(filtered);
    };

    const getTotalDuration = (videos) => {
        return videos.reduce((total, video) => total + (parseInt(video.duration) || 0), 0);
    };

    const extractYouTubeId = (url) => {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7]?.length === 11) ? match[7] : null;
    };

    if (loading) {
        return (
            <div className="course-list-loading">
                <div className="loading-spinner"></div>
                <p>Loading courses...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="course-list-error">
                <p>{error}</p>
                <button onClick={fetchCourses}>Retry</button>
            </div>
        );
    }

    return (
        <div className="course-list-container">
            <div className="course-list-header">
                {/* <div className="header-top">
                    <h1>Manage Courses</h1>
                    <Link to="/courses/create" className="create-course-btn">
                        <Plus size={20} />
                        Create New Course
                    </Link>
                </div> */}
                
                <div className="search-filters">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="filters">
                        <select 
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat === 'all' ? 'All Categories' : cat}
                                </option>
                            ))}
                        </select>
                        
                        <select 
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                        >
                            {levels.map(level => (
                                <option key={level.value} value={level.value}>
                                    {level.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="courses-grid">
                {filteredCourses.length === 0 ? (
                    <div className="no-courses">
                        <p>No courses found matching your criteria.</p>
                        <Link to="/courses/create" className="create-course-btn">
                            Create Your First Course
                        </Link>
                    </div>
                ) : (
                    filteredCourses.map(course => (
                        <CourseCard 
                            key={course._id} 
                            course={course} 
                            getTotalDuration={getTotalDuration}
                            extractYouTubeId={extractYouTubeId}
                            isAdmin={isAdmin}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

const CourseCard = ({ course, getTotalDuration, extractYouTubeId, isAdmin }) => {
    const thumbnailUrl = course.thumbnailUrl || 
        (course.videos.length > 0 ? `https://img.youtube.com/vi/${extractYouTubeId(course.videos[0].url)}/hqdefault.jpg` : null);

    return (
        <div className="course-card">
            <div className="course-image">
                {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt={course.title} />
                ) : (
                    <div className="course-image-placeholder">
                        <PlayCircle size={48} />
                    </div>
                )}
                <div className="course-status">{course.status}</div>
            </div>
            
            <div className="course-content">
                <div className="course-category">{course.category}</div>
                <h3 className="course-title">{course.title}</h3>
                <p className="course-description">{course.description}</p>
                
                <div className="course-meta">
                    <div className="meta-item">
                        <Clock size={16} />
                        <span>{getTotalDuration(course.videos)}m</span>
                    </div>
                    <div className="meta-item">
                        <PlayCircle size={16} />
                        <span>{course.videos.length} videos</span>
                    </div>
                    <div className="meta-item">
                        <span className={`level-badge ${course.level}`}>{course.level}</span>
                    </div>
                </div>
                
                <div className="course-actions">
                    {isAdmin && <Link to={`/courses/${course._id}/videos`} className="btn-primary">
                        <Edit size={16} />
                        Manage Videos
                    </Link>}
                    <Link to={`/courses/${course._id}`} className="btn-secondary">
                        <PlayCircle size={16} />
                        View Course
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CourseList;