import React, { useEffect, useState, useCallback } from 'react';
import { FaPlay, FaPause, FaRedo, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import styles from './MeditationTimer.module.css';
import toast from 'react-hot-toast';
// import { url } from "../../url"; // Removed
import { useAuth } from "../../Context/auth";
// Import the new Axios API function
import { saveMeditationSession as apiSaveMeditationSession } from '../../http';

const MeditationTimer = () => {
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [auth] = useAuth();
  // Define the fixed duration here since it's used in multiple places
  const FIXED_DURATION_MINUTES = 5;
  const FIXED_DURATION_SECONDS = FIXED_DURATION_MINUTES * 60;

  useEffect(() => {
    let interval = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      clearInterval(interval);
      setIsActive(false);
      setIsCompleted(true);
      completeMeditation();
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startTimer = () => {
    if (!auth?.token) {
      toast.error("Please log in to start a meditation session.");
      return;
    }
    setIsActive(true);
    setIsCompleted(false);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(FIXED_DURATION_SECONDS);
    setIsCompleted(false);
  };

  const calculateScore = (duration) => {
    const durationNum = parseInt(duration);
    
    if (isNaN(durationNum) || durationNum <= 0) {
      return 0;
    }
    
    // Calculate raw score (1 point per minute)
    const rawScore = durationNum;
    
    // Round to nearest multiple of 10
    return Math.round(rawScore / 10) * 10;
  };

  const saveMeditationSession = async (score, details) => {
    if (!auth?.token || !auth?.user?.id) {
      toast.error("Authentication required to save session.");
      return null;
    }

    const sessionData = {
      score,
      details,
      duration: FIXED_DURATION_MINUTES, // 5 minutes from the timer
      date: new Date().toISOString(),
      profilePicture: auth?.user?.profilePicture,
      name: auth?.user?.name
    };
    
    try {
      setIsLoading(true);
      
      // --- AXIOS INTEGRATION ---
      const response = await apiSaveMeditationSession(auth.user.id, sessionData);
      // Axios throws an error for non-2xx codes, so if we reach here, it's successful.
      
      toast.success("Meditation session saved successfully!");
      return response.data;
      
    } catch (error) {
      console.error('Error saving meditation session:', error);
      
      const errorMessage = error.response?.data?.message || 'Error saving your meditation session';
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const completeMeditation = useCallback(async () => {
    const score = calculateScore(FIXED_DURATION_MINUTES);
    const details = `${FIXED_DURATION_MINUTES} minutes (timer)`;
    
    const result = await saveMeditationSession(score, details);
    
    if (result) {
      toast.success(`Meditation completed! ${score} points earned.`);
    }
  }, [auth]); // Dependency on auth for saving the session

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage for the circular progress bar
  const progress = 100 - (timeLeft / FIXED_DURATION_SECONDS) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.background}></div>
      
      <div className={styles.timerCard}>
        <div className={styles.header}>
          <h1>Mindful Moments</h1>
          <p>{FIXED_DURATION_MINUTES}-Minute Meditation Timer</p>
        </div>
        
        <div className={styles.timerContainer}>
          <div className={styles.circularProgress}>
            <svg className={styles.progressSvg} viewBox="0 0 100 100">
              <circle 
                className={styles.progressBackground} 
                cx="50" 
                cy="50" 
                r="45" 
              />
              <circle 
                className={styles.progressCircle} 
                cx="50" 
                cy="50" 
                r="45" 
                strokeDasharray={283} 
                strokeDashoffset={283 - (progress * 2.83)}
              />
            </svg>
            
            <div className={styles.timeDisplay}>
              <span className={styles.time}>{formatTime(timeLeft)}</span>
              <span className={styles.timeLabel}>minutes remaining</span>
            </div>
          </div>
          
          <div className={styles.controls}>
            {!isActive && timeLeft > 0 && !isCompleted && (
              <button 
                className={`${styles.controlBtn} ${styles.playBtn}`}
                onClick={startTimer}
                disabled={isLoading}
              >
                <FaPlay />
                <span>Begin</span>
              </button>
            )}
            
            {isActive && (
              <button 
                className={`${styles.controlBtn} ${styles.pauseBtn}`}
                onClick={pauseTimer}
                disabled={isLoading}
              >
                <FaPause />
                <span>Pause</span>
              </button>
            )}
            
            {(timeLeft < FIXED_DURATION_SECONDS || isCompleted) && (
              <button 
                className={`${styles.controlBtn} ${styles.resetBtn}`}
                onClick={resetTimer}
                disabled={isLoading}
              >
                <FaRedo />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
        
        <div className={styles.status}>
          {isLoading ? (
            <div className={styles.loading}>
              <FaSpinner className={styles.spinner} />
              <p className={styles.p}>Sending your meditation score to the server...</p>
            </div>
          ) : isCompleted ? (
            <div className={styles.completed}>
              <FaCheckCircle className={styles.checkIcon} />
              <p className={styles.p}>Meditation completed! Score saved successfully. Please don't enter this score in meditation tracker. Your score has already recorded.</p>
            </div>
          ) : (
            <p className={styles.instruction}>Find a comfortable position and focus on your breath</p>
          )}
        </div>
        
        <div className={styles.footer}>
          <p>Each minute of meditation = 1 point | Score rounded to nearest 10</p>
        </div>
      </div>
    </div>
  );
};

export default MeditationTimer;