import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PlayCircle, Clock, ChevronLeft, ChevronRight, BookOpen, Download } from 'lucide-react';
import { getCourse } from '../../http';
import './CoursePlayer.css';

const CoursePlayer = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const videoRef = useRef(null);

    useEffect(() => {
        fetchCourse();
    }, [courseId]);

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
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7]?.length === 11) ? match[7] : null;
    };

    const getYouTubeEmbedUrl = (url) => {
        const videoId = extractYouTubeId(url);
        return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : null;
    };

    const handleVideoSelect = (index) => {
        setCurrentVideoIndex(index);
    };

    const handleNextVideo = () => {
        if (currentVideoIndex < course.videos.length - 1) {
            setCurrentVideoIndex(currentVideoIndex + 1);
        }
    };

    const handlePrevVideo = () => {
        if (currentVideoIndex > 0) {
            setCurrentVideoIndex(currentVideoIndex - 1);
        }
    };

    if (loading) {
        return (
            <div className="course-player-loading">
                <div className="loading-spinner"></div>
                <p>Loading course...</p>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="course-player-error">
                <h2>Course Not Available</h2>
                <p>{error}</p>
                <Link to="/courses" className="back-button">Back to Courses</Link>
            </div>
        );
    }

    const currentVideo = course.videos[currentVideoIndex];
    const embedUrl = getYouTubeEmbedUrl(currentVideo?.url);

    return (
        <div className="course-player-container">
            <div className="course-player-header">
                <Link to="/courses" className="back-link">
                    <ChevronLeft size={20} />
                    Back to Courses
                </Link>
                <h1>{course.title}</h1>
                <p>{course.description}</p>
            </div>

            <div className="course-player-content">
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
                            ></iframe>
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
                            <Clock size={16} />
                            <span>{currentVideo.duration || '00:00'} minutes</span>
                        </div>
                        
                        <div className="video-navigation">
                            <button 
                                onClick={handlePrevVideo}
                                disabled={currentVideoIndex === 0}
                                className="nav-button"
                            >
                                <ChevronLeft size={16} />
                                Previous
                            </button>
                            <button 
                                onClick={handleNextVideo}
                                disabled={currentVideoIndex === course.videos.length - 1}
                                className="nav-button"
                            >
                                Next
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="course-sidebar">
                    <div className="course-info">
                        <div className="instructor-info">
                            <h3>Instructor</h3>
                            <p>{course.creatorName || 'Unknown Instructor'}</p>
                        </div>
                        
                        <div className="course-stats">
                            <div className="stat">
                                <PlayCircle size={20} />
                                <span>{course.videos.length} Videos</span>
                            </div>
                            <div className="stat">
                                <Clock size={20} />
                                <span>{course.videos.reduce((total, video) => total + (parseInt(video.duration) || 0), 0)}m Total</span>
                            </div>
                            <div className="stat">
                                <BookOpen size={20} />
                                <span className={`level ${course.level}`}>{course.level}</span>
                            </div>
                        </div>
                    </div>

                    <div className="video-playlist">
                        <h3>Course Content</h3>
                        <div className="playlist-items">
                            {course.videos.map((video, index) => (
                                <div
                                    key={video._id || index}
                                    className={`playlist-item ${index === currentVideoIndex ? 'active' : ''}`}
                                    onClick={() => handleVideoSelect(index)}
                                >
                                    <div className="video-number">
                                        {index + 1}
                                    </div>
                                    <div className="video-details">
                                        <h4>{video.title}</h4>
                                        <div className="video-meta-small">
                                            <Clock size={12} />
                                            <span>{video.duration || '00:00'}</span>
                                        </div>
                                    </div>
                                    <div className="video-play-icon">
                                        <PlayCircle size={16} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

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
    );
};

export default CoursePlayer;