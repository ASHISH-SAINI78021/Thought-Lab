import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    PlayCircle,
    Image,
    Video,
    FileText,
    Plus,
    Trash2,
    Edit3,
    Eye,
    Save,
    Maximize,
    Minimize,
    X,
    ArrowLeft
} from 'lucide-react';
import './CourseCreater.css';
import { getCourse, saveCourse, updateCourseStatus } from "../../../http";


const COURSE_ID_TO_EDIT = null; 

const VideoCard = React.memo(({ video, onRemove, extractYouTubeId }) => {
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
                <div className="video-actions">
                    <button className="btn-edit">
                        <Edit3 size={16} />
                    </button>
                    <button className="btn-remove" onClick={() => onRemove(video.id)}>
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
});

const CourseCreater = () => {
    const fileInputRef = useRef(null);

    const [course, setCourse] = useState({
        _id: COURSE_ID_TO_EDIT,
        title: '',
        description: '',
        category: '',
        level: 'beginner',
        thumbnail: null,
        videos: [],
        content: '',
    });
    const [activeTab, setActiveTab] = useState('content');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [newVideo, setNewVideo] = useState({ title: '', url: '', duration: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saveLoading, setSaveLoading] = useState(false);

    const categories = [
        'Web Development', 'Data Science', 'Mobile Development', 'AI & Machine Learning',
        'Design', 'Business', 'Marketing'
    ];
    const levels = [
        { value: 'beginner', label: 'Beginner', color: '#10b981' },
        { value: 'intermediate', label: 'Intermediate', color: '#f59e0b' },
        { value: 'advanced', label: 'Advanced', color: '#ef4444' }
    ];

    const handleChange = useCallback((key, value) => {
        setCourse(prevCourse => ({
            ...prevCourse,
            [key]: value
        }));
    }, []);

    const extractYouTubeId = (url) => {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7]?.length === 11) ? match[7] : null;
    };

    // Check authentication on component mount
    useEffect(() => {
        const checkAuth = () => {
            const authData = localStorage.getItem('auth');
            if (!authData) {
                setError('Please login to create courses');
                setLoading(false);
                return false;
            }
            return true;
        };

        const fetchCourse = async () => {
            if (!checkAuth()) return;

            const courseId = COURSE_ID_TO_EDIT;
            
            if (!courseId) {
                setLoading(false);
                return; 
            }
            
            try {
                const response = await getCourse(courseId);
                const fetchedCourse = response.data.data || response.data;
                
                setCourse({ 
                    ...fetchedCourse,
                    _id: fetchedCourse._id,
                    thumbnail: fetchedCourse.thumbnailUrl || null 
                });
                
            } catch (err) {
                console.error("Error loading course:", err);
                const errorMessage = err.response?.data?.message || err.message || 'Could not load course data.';

                if (err.response?.status === 404) {
                    setCourse(prev => ({ ...prev, _id: courseId }));
                } else {
                    setError(errorMessage);
                }
            } finally {
                setLoading(false); 
            }
        };

        fetchCourse();
    }, []); 

    const handleThumbnailUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                handleChange('thumbnail', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddVideo = () => {
        if (newVideo.title && newVideo.url) {
            setCourse(prevCourse => ({
                ...prevCourse,
                videos: [...prevCourse.videos, { 
                    ...newVideo, 
                    id: Date.now(),
                    order: prevCourse.videos.length 
                }] 
            }));
            setNewVideo({ title: '', url: '', duration: '' });
            setShowVideoModal(false);
        }
    };

    const handleRemoveVideo = useCallback((id) => {
        setCourse(prevCourse => ({
            ...prevCourse,
            videos: prevCourse.videos.filter(video => video.id !== id)
        }));
    }, []);
    
    const handleSave = async () => {
        // Check authentication
        const authData = localStorage.getItem('auth');
        if (!authData) {
            alert('Please login to save courses');
            window.location.href = '/login';
            return;
        }

        setSaveLoading(true);
        setError(null);
    
        try {
            console.log('Current course state:', {
                title: course.title,
                category: course.category,
                videos: course.videos
            });
            
            // Validate required fields
            if (!course.title?.trim()) {
                throw new Error('Title is required');
            }
            if (!course.category?.trim()) {
                throw new Error('Category is required');
            }
    
            const courseDataToSend = {
                title: course.title.trim(),
                description: (course.description || '').trim(),
                content: (course.content || '').trim(),
                category: course.category,
                level: course.level || 'beginner',
                thumbnailUrl: course.thumbnail,
                videos: course.videos.map((video, index) => ({
                    title: video.title,
                    url: video.url,
                    duration: video.duration || '00:00',
                    order: video.order || index
                })),
                status: 'draft'
            };
    
            console.log('Sending course data:', courseDataToSend);
    
            const response = await saveCourse(courseDataToSend, course._id);
            const savedCourse = response.data.data || response.data;
            
            console.log('Course saved successfully:', savedCourse);
    
            // Update state with saved course data
            setCourse(prev => ({
                ...prev,
                _id: savedCourse._id,
                title: savedCourse.title || prev.title,
                description: savedCourse.description || prev.description,
                content: savedCourse.content || prev.content,
                category: savedCourse.category || prev.category,
                level: savedCourse.level || prev.level,
                thumbnail: savedCourse.thumbnailUrl || prev.thumbnail,
                videos: savedCourse.videos || prev.videos,
                status: savedCourse.status || 'draft'
            }));
            
            alert('Course saved successfully!');
    
        } catch (err) {
            console.error('Save error:', err);
            
            let errorMessage = 'Error saving course.';
            
            if (err.response) {
                // Server responded with error
                errorMessage = err.response.data?.message || 
                              err.response.data?.error || 
                              `Server error: ${err.response.status}`;
            } else if (err.request) {
                // Request made but no response received
                errorMessage = 'Network error: Could not connect to server';
            } else {
                // Something else happened
                errorMessage = err.message || 'Unknown error occurred';
            }
            
            setError(errorMessage);
            alert(`Error saving course: ${errorMessage}`);
        } finally {
            setSaveLoading(false);
        }
    };

    const handlePublish = async () => {
        if (!course._id) {
            alert("Please save the course draft before publishing.");
            await handleSave();
            if (!course._id) return; 
        }

        setSaveLoading(true);

        try {
            const response = await updateCourseStatus(course._id, 'published');
            const publishedCourse = response.data.data || response.data;
            
            setCourse(prev => ({ 
                ...prev, 
                status: 'published' 
            })); 
            alert('Course published successfully!');

        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Error publishing course.';
            alert(`Error publishing course: ${errorMessage}`);
            setError(errorMessage);
        } finally {
            setSaveLoading(false);
        }
    };

    const totalDuration = course.videos.reduce((total, video) => total + (parseInt(video.duration) || 0), 0);

    if (loading) {
        return <div className="loading-state">Loading Course...</div>;
    }

    if (error && !course._id) {
        return (
            <div className="error-state">
                Error: {error}
                <button onClick={() => window.location.href = '/login'} style={{marginLeft: '10px'}}>
                    Go to Login
                </button>
            </div>
        );
    }
    
    return (
        <div className={`course-editor ${isFullscreen ? 'fullscreen' : ''}`}>
            <header className="editor-header">
                <div className="header-left">
                    <h1>Course Editor {course._id ? `- ${course.status || 'Draft'}` : '- New Course'}</h1>
                    <div className="course-meta">
                        <input
                            type="text"
                            placeholder="Course Title *"
                            value={course.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            className="title-input"
                            required
                        />
                        <select 
                            value={course.category}
                            onChange={(e) => handleChange('category', e.target.value)}
                            className="category-select"
                            required
                        >
                            <option value="">Select Category *</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <select 
                            value={course.level}
                            onChange={(e) => handleChange('level', e.target.value)}
                            className="level-select"
                        >
                            {levels.map(level => (
                                <option key={level.value} value={level.value}>
                                    {level.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="header-actions">
                    <button 
                        className="btn-secondary"
                        onClick={() => setPreviewMode(prev => !prev)}
                    >
                        <Eye size={18} />
                        {previewMode ? 'Edit' : 'Preview'}
                    </button>
                    <button 
                        className="btn-secondary"
                        onClick={() => setIsFullscreen(prev => !prev)}
                    >
                        {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                        {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    </button>
                    <button 
                        className="btn-primary" 
                        onClick={handleSave} 
                        disabled={saveLoading}
                    >
                        <Save size={18} />
                        {saveLoading ? 'Saving...' : 'Save Draft'}
                    </button>
                    <button 
                        className="btn-publish" 
                        onClick={handlePublish} 
                        disabled={saveLoading || !course._id}
                    >
                        {saveLoading ? 'Publishing...' : 'Publish Course'}
                    </button>
                </div>
            </header>

            {error && (
                <div className="error-banner">
                    Error: {error}
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            <div className="editor-content">
                <aside className="editor-sidebar">
                    <nav className="sidebar-nav">
                        <button 
                            className={`nav-item ${activeTab === 'content' ? 'active' : ''}`}
                            onClick={() => setActiveTab('content')}
                        >
                            <FileText size={20} /> Content
                        </button>
                        <button 
                            className={`nav-item ${activeTab === 'media' ? 'active' : ''}`}
                            onClick={() => setActiveTab('media')}
                        >
                            <Video size={20} /> Videos
                        </button>
                    </nav>

                    <div className="thumbnail-section">
                        <h3>Course Thumbnail</h3>
                        <div 
                            className="thumbnail-upload"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {course.thumbnail ? (
                                <img src={course.thumbnail} alt="Course thumbnail" />
                            ) : (
                                <div className="upload-placeholder">
                                    <Image size={32} />
                                    <span>Click to upload thumbnail</span>
                                </div>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailUpload}
                            style={{ display: 'none' }}
                        />
                    </div>

                    <div className="course-stats">
                        <div className="stat-item">
                            <span className="stat-value">{course.videos.length}</span>
                            <span className="stat-label">Videos</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{totalDuration}m</span>
                            <span className="stat-label">Duration</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{course.status || 'draft'}</span>
                            <span className="stat-label">Status</span>
                        </div>
                    </div>
                </aside>

                <main className="editor-main">
                    {activeTab === 'content' && (
                        <div className="content-editor">
                            <h2>Course Content</h2>
                            <textarea
                                value={course.content}
                                onChange={(e) => handleChange('content', e.target.value)}
                                placeholder="Write your course description and content here..."
                                className="content-textarea"
                                rows={15}
                            />
                        </div>
                    )}

                    {activeTab === 'media' && (
                        <div className="media-editor">
                            <div className="media-header">
                                <h2>Course Videos ({course.videos.length})</h2>
                                <button 
                                    className="btn-primary"
                                    onClick={() => setShowVideoModal(true)}
                                >
                                    <Plus size={18} /> Add Video
                                </button>
                            </div>

                            <div className="videos-grid">
                                {course.videos.map(video => (
                                    <VideoCard 
                                        key={video.id} 
                                        video={video} 
                                        onRemove={handleRemoveVideo}
                                        extractYouTubeId={extractYouTubeId}
                                    />
                                ))}
                                
                                {course.videos.length === 0 && (
                                    <div className="empty-state">
                                        <Video size={48} />
                                        <h3>No videos added yet</h3>
                                        <button 
                                            className="btn-primary"
                                            onClick={() => setShowVideoModal(true)}
                                        >
                                            Add First Video
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {showVideoModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Add New Video</h3>
                            <button onClick={() => setShowVideoModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Video Title *</label>
                                <input
                                    type="text"
                                    value={newVideo.title}
                                    onChange={(e) => setNewVideo(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Enter video title"
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>YouTube URL *</label>
                                <input
                                    type="url"
                                    value={newVideo.url}
                                    onChange={(e) => setNewVideo(prev => ({ ...prev, url: e.target.value }))}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Duration (minutes)</label>
                                <input
                                    type="number"
                                    value={newVideo.duration}
                                    onChange={(e) => setNewVideo(prev => ({ ...prev, duration: e.target.value }))}
                                    placeholder="e.g., 15"
                                    min="1"
                                />
                            </div>
                        </div>
                        
                        <div className="modal-footer">
                            <button 
                                className="btn-outline"
                                onClick={() => setShowVideoModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn-primary"
                                onClick={handleAddVideo}
                                disabled={!newVideo.title.trim() || !newVideo.url.trim()}
                            >
                                Add Video
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CourseCreater;