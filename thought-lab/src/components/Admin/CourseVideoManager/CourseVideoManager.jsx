import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PlayCircle, Clock, Plus, Trash2, Edit3, ArrowLeft, Eye, Save } from 'lucide-react';
import { getCourse, addVideoToCourse, removeVideoFromCourse, saveCourse } from '../../../http';
import './CourseVideoManager.css';

const VideoCard = ({ video, onRemove, onEdit, extractYouTubeId }) => {
    const videoId = extractYouTubeId(video.url);
    
    return (
        <div className="video-card">
            <div className="video-thumbnail">
                {videoId ? (
                    <img 
                        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} 
                        alt={video.title}
                    />
                ) : (
                    <div className="video-placeholder">
                        <PlayCircle size={32} />
                    </div>
                )}
                <div className="video-duration">{video.duration || '00:00'}</div>
            </div>
            <div className="video-info">
                <h4>{video.title}</h4>
                <p className="video-url">{video.url}</p>
                <div className="video-actions">
                    <button className="btn-edit" onClick={() => onEdit(video)}>
                        <Edit3 size={16} />
                        Edit
                    </button>
                    <button className="btn-remove" onClick={() => onRemove(video._id)}>
                        <Trash2 size={16} />
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );
};

const CourseVideoManager = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [editingVideo, setEditingVideo] = useState(null);
    const [videoForm, setVideoForm] = useState({ title: '', url: '', duration: '' });
    const [saveLoading, setSaveLoading] = useState(false);

    useEffect(() => {
        fetchCourse();
    }, [courseId]);

    const fetchCourse = async () => {
        try {
            setLoading(true);
            const response = await getCourse(courseId);
            const courseData = response.data.data || response.data;
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

    const handleAddVideo = () => {
        setEditingVideo(null);
        setVideoForm({ title: '', url: '', duration: '' });
        setShowVideoModal(true);
    };

    const handleEditVideo = (video) => {
        setEditingVideo(video);
        setVideoForm({
            title: video.title,
            url: video.url,
            duration: video.duration
        });
        setShowVideoModal(true);
    };

    const handleSaveVideo = async () => {
        if (!videoForm.title.trim() || !videoForm.url.trim()) {
            alert('Title and URL are required');
            return;
        }

        setSaveLoading(true);
        try {
            if (editingVideo) {
                // Update existing video - use saveCourse for full course update
                const updatedVideos = course.videos.map(video => 
                    video._id === editingVideo._id ? { ...video, ...videoForm } : video
                );
                
                const response = await saveCourse({ videos: updatedVideos }, courseId);
                setCourse(response.data.data || response.data);
            } else {
                // Add new video - use addVideoToCourse for single video addition
                const response = await addVideoToCourse(courseId, videoForm);
                setCourse(response.data.data || response.data);
            }
            
            setShowVideoModal(false);
            setVideoForm({ title: '', url: '', duration: '' });
            setEditingVideo(null);
            alert(`Video ${editingVideo ? 'updated' : 'added'} successfully!`);
        } catch (err) {
            console.error('Error saving video:', err);
            alert(`Error saving video: ${err.response?.data?.message || err.message}`);
        } finally {
            setSaveLoading(false);
        }
    };

    const handleRemoveVideo = async (videoId) => {
        if (!window.confirm('Are you sure you want to remove this video?')) return;

        try {
            await removeVideoFromCourse(courseId, videoId);
            setCourse(prev => ({
                ...prev,
                videos: prev.videos.filter(video => video._id !== videoId)
            }));
            alert('Video removed successfully!');
        } catch (err) {
            console.error('Error removing video:', err);
            alert(`Error removing video: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleVideoFormChange = (field, value) => {
        setVideoForm(prev => ({ ...prev, [field]: value }));
    };

    const totalDuration = course?.videos.reduce((total, video) => total + (parseInt(video.duration) || 0), 0) || 0;

    if (loading) {
        return (
            <div className="video-manager-loading">
                <div className="loading-spinner"></div>
                <p>Loading course...</p>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="video-manager-error">
                <h2>Course Not Found</h2>
                <p>{error}</p>
                <div className="error-actions">
                    <Link to="/courses" className="btn-primary">
                        <ArrowLeft size={16} />
                        Back to Courses
                    </Link>
                    <button onClick={fetchCourse}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="video-manager-container">
            <div className="video-manager-header">
                <div className="header-top">
                    <Link to="/courses" className="back-link">
                        <ArrowLeft size={20} />
                        Back to Courses
                    </Link>
                    <h1>Manage Videos: {course.title}</h1>
                </div>
                
                <div className="course-info">
                    <div className="info-item">
                        <span className="label">Category:</span>
                        <span className="value">{course.category}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">Level:</span>
                        <span className={`value level-${course.level}`}>{course.level}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">Status:</span>
                        <span className={`value status-${course.status}`}>{course.status}</span>
                    </div>
                </div>

                <div className="header-stats">
                    <div className="stat">
                        <PlayCircle size={20} />
                        <span>{course.videos.length} Videos</span>
                    </div>
                    <div className="stat">
                        <Clock size={20} />
                        <span>{totalDuration} minutes total</span>
                    </div>
                </div>

                <div className="header-actions">
                    <button className="btn-primary" onClick={handleAddVideo}>
                        <Plus size={18} />
                        Add Video
                    </button>
                    <Link to={`/courses/${courseId}`} className="btn-secondary">
                        <Eye size={18} />
                        Preview Course
                    </Link>
                </div>
            </div>

            <div className="videos-section">
                <h2>Course Videos ({course.videos.length})</h2>
                
                {course.videos.length === 0 ? (
                    <div className="empty-videos">
                        <PlayCircle size={64} />
                        <h3>No videos added yet</h3>
                        <p>Start by adding your first video to this course</p>
                        <button className="btn-primary" onClick={handleAddVideo}>
                            <Plus size={18} />
                            Add First Video
                        </button>
                    </div>
                ) : (
                    <div className="videos-grid">
                        {course.videos.map((video, index) => (
                            <VideoCard 
                                key={video._id || index}
                                video={video}
                                onRemove={handleRemoveVideo}
                                onEdit={handleEditVideo}
                                extractYouTubeId={extractYouTubeId}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Add/Edit Video Modal */}
            {showVideoModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editingVideo ? 'Edit Video' : 'Add New Video'}</h3>
                            <button onClick={() => setShowVideoModal(false)}>
                                <span>×</span>
                            </button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Video Title *</label>
                                <input
                                    type="text"
                                    value={videoForm.title}
                                    onChange={(e) => handleVideoFormChange('title', e.target.value)}
                                    placeholder="Enter video title"
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>YouTube URL *</label>
                                <input
                                    type="url"
                                    value={videoForm.url}
                                    onChange={(e) => handleVideoFormChange('url', e.target.value)}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    required
                                />
                                <small>Paste the full YouTube URL</small>
                            </div>
                            
                            <div className="form-group">
                                <label>Duration (minutes)</label>
                                <input
                                    type="number"
                                    value={videoForm.duration}
                                    onChange={(e) => handleVideoFormChange('duration', e.target.value)}
                                    placeholder="e.g., 15"
                                    min="1"
                                />
                            </div>

                            {videoForm.url && extractYouTubeId(videoForm.url) && (
                                <div className="video-preview">
                                    <h4>Preview:</h4>
                                    <img 
                                        src={`https://img.youtube.com/vi/${extractYouTubeId(videoForm.url)}/hqdefault.jpg`} 
                                        alt="Video preview"
                                    />
                                </div>
                            )}
                        </div>
                        
                        <div className="modal-footer">
                            <button 
                                className="btn-outline"
                                onClick={() => setShowVideoModal(false)}
                                disabled={saveLoading}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn-primary"
                                onClick={handleSaveVideo}
                                disabled={saveLoading || !videoForm.title.trim() || !videoForm.url.trim()}
                            >
                                <Save size={16} />
                                {saveLoading ? 'Saving...' : editingVideo ? 'Update Video' : 'Add Video'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseVideoManager;