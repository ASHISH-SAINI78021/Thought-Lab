import React, { useEffect, useState, useCallback, useRef } from 'react';
import { FaPlay, FaPause, FaRedo, FaSpinner, FaCheckCircle, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import styles from './MeditationTimer.module.css';
import toast from 'react-hot-toast';
import { useAuth } from "../../Context/auth";
import { saveMeditationSession as apiSaveMeditationSession } from '../../http';

const MeditationTimer = () => {
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [lastTrackChange, setLastTrackChange] = useState(0); 
  const [auth] = useAuth();
  
  const audioRef = useRef(null);
  
  const FIXED_DURATION_MINUTES = 15;
  const FIXED_DURATION_SECONDS = FIXED_DURATION_MINUTES * 60;

  const musicTracks = [
    '/audio/meditation-1.mp3', 
    '/audio/meditation-2.mp3',
    '/audio/meditation-3.mp3'
  ];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3; 
      audioRef.current.loop = true;
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (isActive && !isMuted) {
        audioRef.current.play().catch(error => {
          console.log('Audio play failed:', error);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isActive, isMuted]);

  // Fixed track switching logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const minutesElapsed = Math.floor((FIXED_DURATION_SECONDS - timeLeft) / 60);
      const fiveMinuteInterval = Math.floor(minutesElapsed / 5);
      
      if (fiveMinuteInterval !== lastTrackChange && fiveMinuteInterval < musicTracks.length) {
        console.log(`🔄 Switching to track ${fiveMinuteInterval + 1} at ${minutesElapsed} minutes`);
        setCurrentTrackIndex(fiveMinuteInterval);
        setLastTrackChange(fiveMinuteInterval);
        
        if (audioRef.current && !isMuted) {
          audioRef.current.src = musicTracks[fiveMinuteInterval];
          audioRef.current.play().catch(error => {
            console.log('Audio play failed during track change:', error);
          });
        }
      }
    }
  }, [timeLeft, isActive, isMuted, lastTrackChange]);

  // Reset lastTrackChange when timer resets
  useEffect(() => {
    if (!isActive && timeLeft === FIXED_DURATION_SECONDS) {
      setLastTrackChange(0);
    }
  }, [isActive, timeLeft]);

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
    setCurrentTrackIndex(0);
    setLastTrackChange(0);
    
    if (audioRef.current && !isMuted) {
      audioRef.current.src = musicTracks[0];
      audioRef.current.play().catch(error => {
        console.log('Audio play failed:', error);
      });
    }
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(FIXED_DURATION_SECONDS);
    setIsCompleted(false);
    setCurrentTrackIndex(0);
    setLastTrackChange(0);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const calculateScore = (duration) => {
    const durationNum = parseInt(duration);
    
    if (isNaN(durationNum) || durationNum <= 0) {
      return 0;
    }
    const rawScore = durationNum;
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
      duration: FIXED_DURATION_MINUTES,
      date: new Date().toISOString(),
      profilePicture: auth?.user?.profilePicture,
      name: auth?.user?.name
    };
    
    try {
      setIsLoading(true);
      
      const response = await apiSaveMeditationSession(auth.user.id, sessionData);
      
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
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [auth]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = 100 - (timeLeft / FIXED_DURATION_SECONDS) * 100;

  // Calculate current time segment for display
  const getCurrentSegment = () => {
    const minutesElapsed = Math.floor((FIXED_DURATION_SECONDS - timeLeft) / 60);
    if (minutesElapsed < 5) return "First 5 minutes";
    if (minutesElapsed < 10) return "Second 5 minutes"; 
    if (minutesElapsed < 15) return "Final 5 minutes";
    return "Meditation complete";
  };

  return (
    <div className={styles.container}>
      <div className={styles.background}></div>
      
      <audio 
        ref={audioRef} 
        preload="auto"
        onError={(e) => console.log('Audio error:', e)}
      >
        <source src={musicTracks[currentTrackIndex]} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      
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
              <span className={styles.segmentLabel}>{getCurrentSegment()}</span>
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
            
            <button 
              className={`${styles.controlBtn} ${styles.musicBtn} ${isMuted ? styles.muted : ''}`}
              onClick={toggleMute}
              disabled={!isActive && timeLeft === FIXED_DURATION_SECONDS}
            >
              {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
              <span>{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>
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
          {isActive && !isMuted && (
            <p className={styles.musicInfo}>
              🎵 Playing: Track {currentTrackIndex + 1}/3 ({getCurrentSegment()})
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeditationTimer;