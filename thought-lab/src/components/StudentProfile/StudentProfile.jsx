// StudentProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './StudentProfile.module.css';
import toast from 'react-hot-toast';
// import {url} from "../../url"; // Removed
// Import the new Axios API function
import { getStudentProfile } from '../../http'; 

const StudentProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const {id} = useParams();
  
  // Removed sample data as it will now be fetched from the API
  const [studentData, setStudentData] = useState({});

  useEffect(()=> {
    const init = async()=> {
        if (!id) {
          toast.error("Student ID is missing.");
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        try {
            // --- AXIOS INTEGRATION ---
            // Use the imported Axios utility function
            const response = await getStudentProfile(id); 
            const data = response.data; // Axios response body is in the 'data' property
            
            if (data.success){
                setStudentData(data.user);
            } else {
                toast.error(data.message || "Failed to load profile.");
            }
        }
        catch(error){
            console.error(error);
            // Axios error handling
            toast.error(error.response?.data?.message || error.message || "Error fetching profile.");
        }
        finally {
            setIsLoading(false);
        }
    }
    init();
  }, [id]);

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
            <img 
              src={studentData.profilePicture} 
              alt={studentData.name}
              className={styles.avatar}
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80";
              }}
            />
            <div className={styles.roleBadge}>{studentData.role}</div>
          </div>
          <div className={styles.userInfo}>
            <h1 className={styles.userName}>{studentData.name}</h1>
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
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'profile' ? (
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
                  <span className={styles.detailValue}>{studentData.year}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Roll Number</span>
                  <span className={styles.detailValue}>{studentData.rollNumber}</span>
                </div>
              </div>
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
      </div>
    </div>
  );
};

export default StudentProfile;