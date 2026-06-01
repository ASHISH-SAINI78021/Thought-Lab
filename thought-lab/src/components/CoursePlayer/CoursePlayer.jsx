import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PlayCircle, Clock, ChevronLeft, ChevronRight, BookOpen, CheckCircle, Circle, Eye } from 'lucide-react';
import { getCourse, markVideoViewed, toggleVideoCompletion } from '../../http';
import './CoursePlayer.css';
import SplashCursor from '../react-bits/SplashCursor';

const CoursePlayer = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const videoRef = useRef(null);

    const currentUser = JSON.parse(localStorage.getItem('auth') || '{}')?.user;
    const currentUserId = currentUser?._id;
    const role = currentUser?.role;
    const isAdminUser = role === 'admin' || role === 'superAdmin';

    useEffect(() => { fetchCourse(); }, [courseId]);

    // Automatic view tracking
    useEffect(() => {
        if (!course || !course.videos || !course.videos.length) return;
        const video = course.videos[currentVideoIndex];

        const hasViewed = video.views?.some(v => (v._id || v) === currentUserId);

        if (currentUserId && video && (!video.views || !hasViewed)) {
            markVideoViewed(course._id, video._id).then((res) => {
                if (res.data.success) {
                    setCourse(prev => {
                        const newCourse = { ...prev };
                        const targetVideo = newCourse.videos[currentVideoIndex];
                        if (!targetVideo.views) targetVideo.views = [];

                        const alreadyExists = targetVideo.views.some(v => (v._id || v) === currentUserId);
                        if (!alreadyExists) {
                            targetVideo.views.push({ _id: currentUserId, name: currentUser.name });
                        }
                        return newCourse;
                    });
                }
            }).catch(console.error);
        }
    }, [currentVideoIndex, course, currentUserId]);

    const handleToggleCompletion = async (videoIndex, e) => {
        if (e) e.stopPropagation();
        try {
            const video = course.videos[videoIndex];
            const res = await toggleVideoCompletion(course._id, video._id);
            if (res.data.success) {
                setCourse(prev => {
                    const newCourse = { ...prev };
                    const targetVideo = newCourse.videos[videoIndex];
                    if (!targetVideo.completedBy) targetVideo.completedBy = [];

                    if (res.data.isCompleted) {
                        if (!targetVideo.completedBy.includes(currentUserId)) {
                            targetVideo.completedBy.push(currentUserId);
                        }
                    } else {
                        targetVideo.completedBy = targetVideo.completedBy.filter(id => id !== currentUserId);
                    }
                    return newCourse;
                });
            }
        } catch (err) {
            console.error('Error toggling completion', err);
        }
    };

    const fetchCourse = async () => {
        try {
            setLoading(true);
            const response = await getCourse(courseId);
            const courseData = response.data.data || response.data;
            if (courseData.status !== 'published') {
                throw new Error('This course is not available');
            }
            setCourse(courseData);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Course not found');
        } finally {
            setLoading(false);
        }
    };

    const extractYouTubeId = (url) => {
        const regExp = /^.*((youtu\.be\/)|(v\/)|(\u002fu\/\w\/)|(embed\/)|(watch\?))\\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7]?.length === 11) ? match[7] : null;
    };

    const getYouTubeEmbedUrl = (url) => {
        const videoId = extractYouTubeId(url);
        return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : null;
    };

    const handleVideoSelect = (index) => setCurrentVideoIndex(index);
    const handleNextVideo = () => { if (currentVideoIndex < course.videos.length - 1) setCurrentVideoIndex(i => i + 1); };
    const handlePrevVideo = () => { if (currentVideoIndex > 0) setCurrentVideoIndex(i => i - 1); };

    /* ── Loading ── */
    if (loading) {
        return (
            <div className="course-player-page">
                <SplashCursor />
                <div className="course-player-loading">
                    <div className="loading-spinner" />
                    <span>Loading course…</span>
                </div>
            </div>
        );
    }

    /* ── Error ── */
    if (error || !course) {
        return (
            <div className="course-player-page">
                <SplashCursor />
                <div className="course-player-error">
                    <h2>Course Not Available</h2>
                    <p>{error}</p>
                    <Link to="/courses" className="back-button">
                        <ChevronLeft size={16} />
                        Back to Courses
                    </Link>
                </div>
            </div>
        );
    }

    const currentVideo = course.videos[currentVideoIndex];
    const embedUrl = getYouTubeEmbedUrl(currentVideo?.url);
    const totalMinutes = course.videos.reduce((s, v) => s + (parseInt(v.duration) || 0), 0);

    return (
        <div className="course-player-page">
            <SplashCursor />
            <div className="course-player-container">

                {/* ── Inline header (no sticky topbar) ── */}
                <div className="course-player-header">
                    <Link to="/courses" className="back-link">
                        <ChevronLeft size={16} />
                        Back to Courses
                    </Link>
                    <h1 className="player-course-title">{course.title}</h1>
                    {course.description && (
                        <p className="player-course-desc">{course.description}</p>
                    )}
                </div>

                {/* ── Main grid ── */}
                <div className="course-player-content">

                    {/* ── Left: Video ── */}
                    <div className="video-section">
                        <div className="video-player">
                            {embedUrl ? (
                                <iframe
                                    ref={videoRef}
                                    src={embedUrl}
                                    title={currentVideo.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <div className="video-error">
                                    <p>Video URL is not valid</p>
                                </div>
                            )}
                        </div>

                        <div className="video-info">
                            <h2>{currentVideo.title}</h2>
                            <div className="video-meta">
                                <span>Video {currentVideoIndex + 1} of {course.videos.length}</span>
                                <span>•</span>
                                <Clock size={13} />
                                <span>{currentVideo.duration || '—'} min</span>
                                <span>•</span>
                                <Eye size={13} />
                                <span title={isAdminUser ? (currentVideo.views?.map(u => u.name || 'Unknown').join(', ') || 'No views') : undefined}>
                                    {currentVideo.views?.length || 0} views
                                </span>
                            </div>
                            <div className="video-navigation">
                                <button onClick={handlePrevVideo} disabled={currentVideoIndex === 0} className="nav-button">
                                    <ChevronLeft size={15} /> Previous
                                </button>
                                <button onClick={handleNextVideo} disabled={currentVideoIndex === course.videos.length - 1} className="nav-button">
                                    Next <ChevronRight size={15} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Sidebar ── */}
                    <div className="course-sidebar">

                        {/* Course info */}
                        <div className="course-info">
                            <h3>About this Course</h3>
                            <div className="instructor-info">
                                <p>{course.creatorName || 'Unknown Instructor'}</p>
                            </div>
                            <div className="course-stats">
                                <div className="stat">
                                    <PlayCircle size={16} />
                                    <span>{course.videos.length} Video{course.videos.length !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="stat">
                                    <Clock size={16} />
                                    <span>{totalMinutes}m Total</span>
                                </div>
                                <div className="stat">
                                    <BookOpen size={16} />
                                    <span className={`level ${course.level}`}>{course.level}</span>
                                </div>
                            </div>
                        </div>

                        {/* Playlist */}
                        <div className="video-playlist">
                            <h3>Course Content</h3>
                            <div className="playlist-items">
                                {course.videos.map((video, index) => {
                                    const isCompleted = video.completedBy?.includes(currentUserId);
                                    return (
                                        <div
                                            key={video._id || index}
                                            className={`playlist-item ${index === currentVideoIndex ? 'active' : ''}`}
                                            onClick={() => handleVideoSelect(index)}
                                        >
                                            <div
                                                className={`video-completion-toggle ${isCompleted ? 'completed' : ''}`}
                                                onClick={(e) => handleToggleCompletion(index, e)}
                                                title={isCompleted ? "Mark as unread" : "Mark as completed"}
                                                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginRight: '8px' }}
                                            >
                                                {isCompleted ? <CheckCircle size={16} style={{ color: '#10b981' }} /> : <Circle size={16} />}
                                            </div>
                                            <div className="video-number">{index + 1}</div>
                                            <div className="video-details" style={{ marginLeft: '8px' }}>
                                                <h4>{video.title}</h4>
                                                <div className="video-meta-small">
                                                    <Clock size={10} />
                                                    <span>{video.duration || '—'}</span>
                                                    <span style={{ margin: '0 4px' }}>•</span>
                                                    <Eye size={10} />
                                                    <span title={isAdminUser ? (video.views?.map(u => u.name || 'Unknown').join(', ') || 'No views') : undefined}>
                                                        {video.views?.length || 0}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="video-play-icon">
                                                <PlayCircle size={14} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Optional materials */}
                        {course.content && (
                            <div className="course-materials">
                                <h3>Course Materials</h3>
                                <div className="materials-content">
                                    <p>{course.content}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoursePlayer;