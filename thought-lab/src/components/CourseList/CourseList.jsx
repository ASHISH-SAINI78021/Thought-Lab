import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, Clock, Search, Edit, BookOpen } from 'lucide-react';
import { getAllCourses } from '../../http';
import './CourseList.css';
import { useAuth } from '../../Context/auth';
import SplashCursor from '../react-bits/SplashCursor';

/* ── Skeleton card for loading state ─────────────────────────── */
const SkeletonCard = () => (
    <div className="skeleton-card">
        <div className="skeleton-img" />
        <div className="skeleton-body">
            <div className="skeleton-line short" />
            <div className="skeleton-line medium" />
            <div className="skeleton-line full" />
            <div className="skeleton-line full" />
            <div className="skeleton-line short" />
        </div>
    </div>
);

/* ── Main component ───────────────────────────────────────────── */
const CourseList = () => {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [auth] = useAuth();

    const isAdmin = auth?.user?.role === 'admin' || auth?.user?.role === 'superAdmin';

    const categories = ['all', 'Web Development', 'Video Editing', 'Graphic Designing', 'Marketing'];
    const levels = [
        { value: 'all', label: 'All Levels' },
        { value: 'beginner', label: 'Beginner' },
        { value: 'intermediate', label: 'Intermediate' },
        { value: 'advanced', label: 'Advanced' },
    ];

    useEffect(() => { fetchCourses(); }, []);

    useEffect(() => { filterCourses(); }, [courses, searchTerm, selectedCategory, selectedLevel]);

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
        if (selectedCategory !== 'all') filtered = filtered.filter(c => c.category === selectedCategory);
        if (selectedLevel !== 'all') filtered = filtered.filter(c => c.level === selectedLevel);
        setFilteredCourses(filtered);
    };

    const getTotalDuration = (videos) =>
        videos.reduce((total, v) => total + (parseInt(v.duration) || 0), 0);

    const extractYouTubeId = (url) => {
        const regExp = /^.*((youtu\.be\/)|(v\/)|(\u002fu\/\w\/)|(embed\/)|(watch\?))\\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7]?.length === 11) ? match[7] : null;
    };

    /* ── Hero stats ── */
    const totalVideos = courses.reduce((s, c) => s + c.videos.length, 0);
    const totalMinutes = courses.reduce((s, c) => s + getTotalDuration(c.videos), 0);
    const totalHours = Math.round(totalMinutes / 60);

    /* ── Loading ── */
    if (loading) {
        return (
            <div className="course-list-page">
                <SplashCursor />
                <div className="course-hero">
                    <p className="hero-eyebrow">Browse &amp; Learn</p>
                    <h1 className="hero-title">Our <span>Courses</span></h1>
                    <p className="hero-subtitle">Loading your learning journey…</p>
                </div>
                <div className="skeleton-grid">
                    {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                </div>
            </div>
        );
    }

    /* ── Error ── */
    if (error) {
        return (
            <div className="course-list-page">
                <SplashCursor />
                <div className="course-list-error">
                    <div className="no-courses-icon">⚠️</div>
                    <p>{error}</p>
                    <button onClick={fetchCourses}>Try Again</button>
                </div>
            </div>
        );
    }

    return (
        <div className="course-list-page">
            <SplashCursor />
            {/* ── Hero ── */}
            <div className="course-hero">
                <p className="hero-eyebrow">Browse &amp; Learn</p>
                <h1 className="hero-title">Explore Our <span>Courses</span></h1>
                <p className="hero-subtitle">
                    Curated learning paths to help you master new skills at your own pace.
                </p>

                <div className="hero-stats">
                    <div className="hero-stat">
                        <span className="hero-stat-value">{courses.length}</span>
                        <span className="hero-stat-label">Courses</span>
                    </div>
                    <div className="hero-stat">
                        <span className="hero-stat-value">{totalVideos}</span>
                        <span className="hero-stat-label">Videos</span>
                    </div>
                    <div className="hero-stat">
                        <span className="hero-stat-value">{totalHours}h</span>
                        <span className="hero-stat-label">Content</span>
                    </div>
                    <div className="hero-stat">
                        <span className="hero-stat-value">{categories.length - 1}</span>
                        <span className="hero-stat-label">Categories</span>
                    </div>
                </div>
            </div>

            {/* ── Search + Filter bar ── */}
            <div className="course-toolbar">
                <div className="toolbar-card">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search courses by title, topic…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        className="toolbar-select"
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
                        className="toolbar-select"
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                    >
                        {levels.map(l => (
                            <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ── Grid ── */}
            <div className="course-list-container">
                <p className="section-label">
                    {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
                </p>

                <div className="courses-grid">
                    {filteredCourses.length === 0 ? (
                        <div className="no-courses">
                            <div className="no-courses-icon">📚</div>
                            <h3>No courses found</h3>
                            <p>Try adjusting your search or filters.</p>
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
        </div>
    );
};

/* ── Course Card ─────────────────────────────────────────────── */
const CourseCard = ({ course, getTotalDuration, extractYouTubeId, isAdmin }) => {
    const videoId = course.videos.length > 0 ? extractYouTubeId(course.videos[0].url) : null;
    const thumbnailUrl = course.thumbnailUrl || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null);
    const totalDuration = getTotalDuration(course.videos);

    return (
        <div className="course-card">

            {/* Thumbnail */}
            <div className="course-image">
                {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt={course.title} loading="lazy" />
                ) : (
                    <div className="course-image-placeholder">
                        <BookOpen size={52} />
                    </div>
                )}

                {/* Play overlay */}
                <div className="course-overlay">
                    <div className="play-btn-overlay">
                        <PlayCircle size={26} />
                    </div>
                </div>

                {/* Status badge */}
                <div className="course-status">{course.status}</div>
            </div>

            {/* Content */}
            <div className="course-content">
                <div className="course-category">{course.category}</div>
                <h3 className="course-title">{course.title}</h3>
                <p className="course-description">{course.description}</p>

                {/* Meta */}
                <div className="course-meta">
                    {totalDuration > 0 && (
                        <div className="meta-item">
                            <Clock size={14} />
                            <span>{totalDuration}m</span>
                        </div>
                    )}
                    <div className="meta-item">
                        <PlayCircle size={14} />
                        <span>{course.videos.length} video{course.videos.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="meta-item">
                        <span className={`level-badge ${course.level}`}>{course.level}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="course-actions">
                    {isAdmin && (
                        <Link to={`/courses/${course._id}/videos`} className="btn-primary">
                            <Edit size={14} />
                            Manage
                        </Link>
                    )}
                    <Link to={`/courses/${course._id}`} className="btn-secondary">
                        <PlayCircle size={14} />
                        View Course
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CourseList;