// AttendanceSuccess.jsx
import React from 'react';
import styles from './AttendanceSuccess.module.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../Context/auth';

const AttendanceSuccess = () => {
  const navigate = useNavigate();
  const [auth, setAuth] = useAuth();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.successCard}>
        {/* Animated Checkmark */}
        <div className={styles.checkmarkContainer}>
          <svg className={styles.checkmark} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className={styles.checkmarkCircle} cx="26" cy="26" r="25" fill="none"/>
            <path className={styles.checkmarkCheck} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>

        {/* Success Message */}
        <h1 className={styles.successTitle}>Attendance Marked Successfully!</h1>
        <p className={styles.successMessage}>
          Your attendance has been recorded and saved to the system.
        </p>

        {/* Home Button */}
        <button 
          className={styles.homeButton}
          onClick={handleGoHome}
        >
          <span className={styles.buttonIcon}>🏠</span>
          Go to Home
        </button>
        <span>&nbsp;</span>
        <button 
          className={styles.homeButton2}
          onClick={()=> navigate(`/leaderboard/${auth?.user?.id}`)}
        >
          <span className={styles.buttonIcon} >👨‍🎓</span>
          Check your attendance
        </button>

        {/* Decorative Elements */}
        <div className={styles.decorativeCircle1}></div>
        <div className={styles.decorativeCircle2}></div>
        <div className={styles.decorativeCircle3}></div>
      </div>
    </div>
  );
};

export default AttendanceSuccess;