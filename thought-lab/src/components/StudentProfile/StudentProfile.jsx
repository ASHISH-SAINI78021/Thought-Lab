// StudentProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './StudentProfile.module.css';
import toast from 'react-hot-toast';
import {url} from "../../url";

const StudentProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const {id} = useParams();
  
  // Sample data
  const data = {
    _id: "68659d3e9d231715faad4e80",
    name: "Ashish Saini",
    rollNumber: "12213075",
    year: "4th",
    branch: "Information Technology",
    programme: "B.Tech",
    email: "12213075@nitkkr.ac.in",
    profilePicture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    role: "superAdmin",
    attendance: [
      { date: "2025-07-04", status: "Present", _id: "6867a0dbf2e007abcffbb9c6" },
      { date: "2025-07-05", status: "Present", _id: "6867a7bdf2e007abcffbb9f1" },
      { date: "2025-07-06", status: "Absent", _id: "6867a7bdf2e007abcffbb9f2" },
      { date: "2025-07-07", status: "Present", _id: "6867a7bdf2e007abcffbb9f3" },
      { date: "2025-07-08", status: "Present", _id: "6867a7bdf2e007abcffbb9f4" },
      { date: "2025-07-09", status: "Present", _id: "6867a7bdf2e007abcffbb9f5" },
      { date: "2025-07-10", status: "Absent", _id: "6867a7bdf2e007abcffbb9f6" },
      { date: "2025-07-11", status: "Present", _id: "6867a7bdf2e007abcffbb9f7" },
      { date: "2025-07-12", status: "Present", _id: "6867a7bdf2e007abcffbb9f8" }
    ]
  };

  const [studentData, setStudentData] = useState({});

  useEffect(()=> {
    const init = async()=> {
        setIsLoading(true);
        try {
            let response = await fetch(`${url}/user/${id}`);
            if (response.ok){
                response = await response.json();
                // console.log(response);
                if (response.success){
                    setStudentData(response.user);
                    // console.log(response.user);
                }
            }
        }
        catch(err){
            console.log(err);
            toast.error(err.message);
        }
        finally {
            setIsLoading(false);
        }
    }
    init();
  }, [id]);

  // Calculate attendance stats
  const totalDays = studentData?.attendance?.length;
  const presentDays = studentData?.attendance?.filter(a => a.status === "Present").length;
  const attendancePercentage = Math.round((presentDays / totalDays) * 100);

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
                    <span>{(attendancePercentage) ? attendancePercentage : 0}%</span>
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