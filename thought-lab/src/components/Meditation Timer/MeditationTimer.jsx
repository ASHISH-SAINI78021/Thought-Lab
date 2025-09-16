import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaRedo, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import styles from './MeditationTimer.module.css';
import toast from 'react-hot-toast';
import { url } from "../../url";
import { useAuth } from "../../Context/auth";

const MeditationTimer = () => {
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [auth] = useAuth();

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
    setIsActive(true);
    setIsCompleted(false);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(5 * 60);
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
    const roundedScore = Math.round(rawScore / 10) * 10;
    
    return roundedScore;
  };

  const saveMeditationSession = async (score, details) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${url}/meditation-session/${auth?.user?.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: auth?.token
        },
        body: JSON.stringify({
          score,
          details,
          duration: 5, // 5 minutes from the timer
          date: new Date().toISOString(),
          profilePicture: auth?.user?.profilePicture,
          name: auth?.user?.name
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success("Meditation session saved successfully!");
        return data;
      } else {
        console.error('Failed to save meditation session');
        toast.error('Failed to save your meditation session');
        return null;
      }
    } catch (error) {
      console.error('Error saving meditation session:', error);
      toast.error('Error saving your meditation session');
      return null;
    }
  };

  const completeMeditation = async () => {
    const score = calculateScore(5); // 5 minutes from timer
    const details = "5 minutes (timer)";
    
    const result = await saveMeditationSession(score, details);
    
    if (result) {
      toast.success(`Meditation completed! ${score} points earned.`);
    }
    
    setIsLoading(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage for the circular progress bar
  const progress = 100 - (timeLeft / (5 * 60)) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.background}></div>
      
      <div className={styles.timerCard}>
        <div className={styles.header}>
          <h1>Mindful Moments</h1>
          <p>5-Minute Meditation Timer</p>
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
            
            {(timeLeft < 5 * 60) && (
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