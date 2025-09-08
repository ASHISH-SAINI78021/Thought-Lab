import React, { useState, useEffect } from 'react';
import { FaSpa } from 'react-icons/fa';
import styles from './MeditationTracker.module.css';
import toast from 'react-hot-toast';
import {url} from "../../url";
import {useAuth} from "../../Context/auth";
import { Avatar } from 'antd';

const MeditationTracker = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [duration, setDuration] = useState('');
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [auth, setAuth] = useAuth();

  // Fetch meditation history from database
  useEffect(() => {
    fetchMeditationHistory();
  }, []);

  const fetchMeditationHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${url}/meditation-history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success){
          setHistory(data?.sessions);
          console.log(data?.sessions);
        }
        else {
          toast.success("No meditation sessions yet");
        }
      } else {
        toast.error('Failed to fetch meditation history')
        console.log('Failed to fetch meditation history');
      }
    } catch (error) {
      toast.error(error.message);
      console.log('Error fetching meditation history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setShowResult(false);
    
    if (option === 'no') {
      saveMeditationSession(0, "No meditation today");
    }
  };

  const calculateScore = () => {
    const durationNum = parseInt(duration);
    
    if (isNaN(durationNum) || durationNum <= 0) {
      alert("Please enter a valid number of minutes");
      return;
    }
    
    // Calculate raw score (1 point per minute)
    const rawScore = durationNum;
    
    // Round to nearest multiple of 10
    const roundedScore = Math.round(rawScore / 10) * 10;
    
    // Update state
    setScore(roundedScore);
    setShowResult(true);
    
    // Save to database
    saveMeditationSession(roundedScore, `${durationNum} minutes`);
    
    // Clear input
    setDuration('');
  };

  const saveMeditationSession = async (score, details) => {
    try {
      setLoading(true);
      const response = await fetch(`${url}/meditation-session/${auth?.user?.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization : auth?.token
        },
        body: JSON.stringify({
          score,
          details,
          duration: details.includes('minutes') ? parseInt(details.split(' ')[0]) : 0,
          date: new Date().toISOString(),
          profilePicture : auth?.user?.profilePicture,
          name : auth?.user?.name
        }),
      });
      
      if (response.ok) {
        const newSession = await response.json();
        // Add to beginning of history array
        const newHistory = [newSession?.session, ...history.slice(0, 4)];
        setHistory(newHistory);
      } else {
        console.error('Failed to save meditation session');
        alert('Failed to save your meditation session. Please try again.');
      }
    } catch (error) {
      console.error('Error saving meditation session:', error);
      alert('Error saving your meditation session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreCalculationText = () => {
    if (!duration) return '';
    const durationNum = parseInt(duration);
    const rawScore = durationNum;
    const roundedScore = Math.round(rawScore / 10) * 10;
    
    return `Calculation: ${durationNum} minutes × 1 point = ${rawScore} points → Rounded to ${roundedScore}`;
  };

  return (
    <div className={styles.mainContainer}>
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.meditationIcon}>
          <FaSpa />
        </div>
        <h1>Meditation Tracker</h1>
        <p>Track your meditation practice and earn points</p>
      </div>
      
      <div className={styles.content}>
        <div className={styles.question}>Did you meditate today?</div>
        
        <div className={styles.options}>
          <button 
            className={`${styles.optionBtn} ${selectedOption === 'yes' ? styles.selected : ''}`}
            onClick={() => handleOptionSelect('yes')}
            disabled={loading}
          >
            {loading ? '...' : 'Yes'}
          </button>
          <button 
            className={`${styles.optionBtn} ${selectedOption === 'no' ? styles.selected : ''}`}
            onClick={() => handleOptionSelect('no')}
            disabled={loading}
          >
            {loading ? '...' : 'No'}
          </button>
        </div>
        
        <div className={`${styles.durationContainer} ${selectedOption === 'yes' ? styles.active : ''}`}>
          <label className={styles.durationLabel}>How many minutes did you meditate?</label>
          <input 
            type="number" 
            className={styles.durationInput}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min="1" 
            max="240" 
            placeholder="Enter minutes (e.g., 15)"
            disabled={loading}
          />
          <button className={styles.calculateBtn} onClick={calculateScore} disabled={loading}>
            {loading ? 'Saving...' : 'Calculate Score'}
          </button>
        </div>
        
        <div className={`${styles.resultContainer} ${showResult ? styles.active : ''}`}>
          <div className={styles.scoreCircle}>{score}</div>
          <div className={styles.scoreLabel}>Your Meditation Score</div>
          <div className={styles.scoreDetails}>
            {selectedOption === 'yes' && duration 
              ? `You meditated for ${duration} minutes` 
              : 'Based on your meditation session'}
          </div>
          <div className={styles.scoreDetails}>
            {getScoreCalculationText()}
          </div>
        </div>
        
        <div className={styles.history}>
          <div className={styles.historyTitle}>Recent Scores</div>
          <div className={styles.historyList}>
            {loading ? (
              <div className={styles.scoreDetails}>Loading...</div>
            ) : history.length > 0 ? (
              history.map((item, index) => (
                <div key={index} className={styles.historyItem}>
                  <div><Avatar src={item?.profilePicture} size={30} /></div>
                  <div className={styles.historyScore} >{item?.name}</div>
                  {/* <div className={styles.historyDate}>
                    {new Date(item.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div> */}
                  <div className={styles.historyScore}>{item?.details}</div>
                  <div className={styles.historyScore}>{item?.score} pts</div>
                </div>
              ))
            ) : (
              <div className={styles.scoreDetails}>No entries yet</div>
            )}
          </div>
        </div>
      </div>
      
      <div className={styles.footer}>
        <p>Each minute of meditation = 1 point | Score rounded to nearest 10</p>
      </div>
    </div>
    </div>
  );
};

export default MeditationTracker;