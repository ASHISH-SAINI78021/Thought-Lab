import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './StudentProfile.module.css';
import toast from 'react-hot-toast';
import { getStudentProfile, updateUserProfile, getUserPointsHistory } from '../../http';
import { useAuth } from '../../Context/auth';

const StudentProfile = () => {
    const [auth] = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(true);
    const { id } = useParams();
    const [studentData, setStudentData] = useState({});

    // Check if this is the logged-in user's own profile
    const isOwnProfile = auth?.user?.id === id;

    // State for Point History and Editing
    const [isEditMode, setIsEditMode] = useState(false);
    const [editData, setEditData] = useState({});
    const [isUpdating, setIsUpdating] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [pointsHistory, setPointsHistory] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!id) {
                toast.error("Student ID is missing.");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const response = await getStudentProfile(id);
                if (response.data.success) {
                    setStudentData(response.data.user);
                } else {
                    toast.error(response.data.message || "Failed to load profile.");
                }
            } catch (error) {
                console.error("Fetch error:", error);
                toast.error(error.response?.data?.message || "Error fetching profile.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [id]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await getUserPointsHistory(id, currentPage, limit);
                if (response.data.success) {
                    setPointsHistory(response.data.history);
                    setTotalPages(response.data.pagination.totalPages);
                }
            } catch (error) {
                console.error("Points history error:", error);
            }
        };

        if (id) fetchHistory();
    }, [id, currentPage, limit]);

    const startEditing = () => {
        setEditData({
            name: studentData.name,
            phone: studentData.phone || '',
            email: studentData.email || '',
            branch: studentData.branch || '',
            programme: studentData.programme || '',
            year: studentData.year || ''
        });
        setIsEditMode(true);
    };

    const cancelEditing = () => {
        setIsEditMode(false);
        setPreviewImage(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditData(prev => ({ ...prev, profilePicture: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const formData = new FormData();
            Object.keys(editData).forEach(key => {
                if (editData[key] !== null && editData[key] !== undefined) {
                    formData.append(key, editData[key]);
                }
            });

            const response = await updateUserProfile(formData);
            if (response.data.success) {
                toast.success("Profile updated successfully!");
                setStudentData(response.data.user);
                setIsEditMode(false);
                setPreviewImage(null);
            } else {
                toast.error(response.data.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.error(error.response?.data?.message || "Error updating profile");
        } finally {
            setIsUpdating(false);
        }
    };

    // Calculate attendance stats
    const totalDays = studentData?.attendance?.length || 0;
    const presentDays = studentData?.attendance?.filter(a => a.status === "Present").length || 0;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Loading student profile...</p>
                </div>
            </div>
        );
    }

    if (!studentData.name) {
        return (
            <div className={styles.container}>
                <div className={styles.profileCard}>
                    <div className={styles.header}>
                        <h1>Profile Not Found</h1>
                        <p>The requested student profile could not be loaded.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.profileCard}>
                <div className={styles.header}>
                    <div className={styles.avatarSection}>
                        <div className={styles.avatarWrapper}>
                            <img
                                src={previewImage || studentData.profilePicture}
                                alt={studentData.name}
                                className={styles.avatar}
                                onError={(e) => {
                                    e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80";
                                }}
                            />
                            {isEditMode && isOwnProfile && (
                                <label className={styles.imageUploadLabel}>
                                    <i className="fas fa-camera"></i>
                                    <input type="file" hidden onChange={handleImageChange} accept="image/*" />
                                </label>
                            )}
                        </div>
                        <div className={styles.roleBadge}>{studentData.role}</div>
                    </div>
                    <div className={styles.userInfo}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h1 className={styles.userName}>{studentData.name}</h1>
                            {!isEditMode && isOwnProfile && (
                                <button className={styles.editBtn} onClick={startEditing}>
                                    <i className="fas fa-edit"></i> Edit Profile
                                </button>
                            )}
                        </div>
                        <p className={styles.userRoll}>{studentData.rollNumber}</p>
                        <div className={styles.userMeta}>
                            <span className={styles.metaItem}>
                                <i className="fas fa-graduation-cap"></i>
                                {studentData.programme}
                            </span>
                            <span className={styles.metaItem}>
                                <i className="fas fa-map-marker-alt"></i>
                                {studentData.branch}
                            </span>
                            <span className={styles.metaItem}>
                                <i className="fas fa-calendar-alt"></i>
                                {studentData.year} Year
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'profile' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <i className="fas fa-user"></i> Profile
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'attendance' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('attendance')}
                    >
                        <i className="fas fa-calendar-check"></i> Attendance
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'points' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('points')}
                    >
                        <i className="fas fa-coins"></i> Points History
                    </button>
                </div>

                <div className={styles.tabContent}>
                    {activeTab === 'profile' ? (
                        isEditMode ? (
                            <form onSubmit={handleUpdateProfile} className={styles.editForm}>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label>Full Name</label>
                                        <input name="name" value={editData.name} onChange={handleInputChange} required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Email</label>
                                        <input name="email" value={editData.email} onChange={handleInputChange} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Phone</label>
                                        <input name="phone" value={editData.phone} onChange={handleInputChange} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Programme</label>
                                        <input name="programme" value={editData.programme} onChange={handleInputChange} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Branch</label>
                                        <input name="branch" value={editData.branch} onChange={handleInputChange} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Year</label>
                                        <input name="year" value={editData.year} onChange={handleInputChange} />
                                    </div>
                                </div>
                                <div className={styles.formActions}>
                                    <button type="button" className={styles.cancelBtn} onClick={cancelEditing}>Cancel</button>
                                    <button type="submit" className={styles.saveBtn} disabled={isUpdating}>
                                        {isUpdating ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className={styles.profileDetails}>
                                <div className={styles.detailGroup}>
                                    <h3 className={styles.detailTitle}>Personal Information</h3>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Full Name</span>
                                        <span className={styles.detailValue}>{studentData.name}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Email Address</span>
                                        <span className={styles.detailValue}>{studentData.email}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Phone</span>
                                        <span className={styles.detailValue}>{studentData.phone || 'N/A'}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Student ID</span>
                                        <span className={styles.detailValue}>{studentData._id}</span>
                                    </div>
                                </div>

                                <div className={styles.detailGroup}>
                                    <h3 className={styles.detailTitle}>Academic Information</h3>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Programme</span>
                                        <span className={styles.detailValue}>{studentData.programme}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Branch</span>
                                        <span className={styles.detailValue}>{studentData.branch}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Year</span>
                                        <span className={styles.detailValue}>{studentData.year} Year</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Roll Number</span>
                                        <span className={styles.detailValue}>{studentData.rollNumber}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    ) : activeTab === 'points' ? (
                        <div className={styles.pointsHistorySection}>
                            <h3 className={styles.sectionTitle}>Points Earning History</h3>
                            {pointsHistory.length > 0 ? (
                                <>
                                    <div className={styles.pointsList}>
                                        {pointsHistory.map((item) => (
                                            <div key={`${item.type}-${item.id}`} className={styles.pointsItem}>
                                                <div className={styles.pointsInfo}>
                                                    <div className={styles.pointsType}>
                                                        <span className={`${styles.badge} ${styles[item.type.toLowerCase() + 'Badge']}`}>
                                                            {item.type}
                                                        </span>
                                                        <span className={styles.pointsDate}>
                                                            {new Date(item.date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className={styles.pointsTitle}>{item.title}</p>
                                                </div>
                                                <div className={`${styles.pointsValue} ${item.points >= 0 ? styles.positive : styles.negative}`}>
                                                    {item.points >= 0 ? '+' : ''}{item.points}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {totalPages > 1 && (
                                        <div className={styles.pagination}>
                                            <button
                                                className={styles.pageBtn}
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage(prev => prev - 1)}
                                            >
                                                <i className="fas fa-chevron-left"></i> Previous
                                            </button>
                                            <span className={styles.pageInfo}>
                                                Page {currentPage} of {totalPages}
                                            </span>
                                            <button
                                                className={styles.pageBtn}
                                                disabled={currentPage === totalPages}
                                                onClick={() => setCurrentPage(prev => prev + 1)}
                                            >
                                                Next <i className="fas fa-chevron-right"></i>
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className={styles.emptyHistory}>
                                    <i className="fas fa-history"></i>
                                    <p>No points records available yet.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={styles.attendanceSection}>
                            <div className={styles.attendanceStats}>
                                <div className={styles.statCard}>
                                    <h4>Attendance Percentage</h4>
                                    <div className={styles.percentageCircle}>
                                        <span>{attendancePercentage}%</span>
                                    </div>
                                </div>
                                <div className={styles.statCard}>
                                    <h4>Summary</h4>
                                    <div className={styles.summaryItem}>
                                        <span className={styles.summaryLabel}>Total Days</span>
                                        <span className={styles.summaryValue}>{totalDays}</span>
                                    </div>
                                    <div className={styles.summaryItem}>
                                        <span className={styles.summaryLabel}>Present</span>
                                        <span className={styles.summaryValue}>{presentDays}</span>
                                    </div>
                                    <div className={styles.summaryItem}>
                                        <span className={styles.summaryLabel}>Absent</span>
                                        <span className={styles.summaryValue}>{totalDays - presentDays}</span>
                                    </div>
                                </div>
                            </div>

                            <h3 className={styles.attendanceHistoryTitle}>Attendance History</h3>
                            <div className={styles.attendanceList}>
                                {studentData?.attendance?.map((record) => (
                                    <div key={record._id} className={styles.attendanceItem}>
                                        <span className={styles.attendanceDate}>{record.date}</span>
                                        <span className={`${styles.attendanceStatus} ${record.status === 'Present' ? styles.statusPresent : styles.statusAbsent}`}>
                                            {record.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div >
        </div >
    );
};

export default StudentProfile;