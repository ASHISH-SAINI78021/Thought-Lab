import React, { useState, useEffect } from 'react';
import { FaSpa } from 'react-icons/fa';
import styles from './MeditationTracker.module.css';
import toast from 'react-hot-toast';
// import { url } from "../../url"; // Removed
import { useAuth } from "../../Context/auth";
import { Avatar } from 'antd';
// Import Axios API functions
import { getMeditationHistory, saveMeditationSession as apiSaveMeditationSession } from '../../http';

const MeditationTracker = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [duration, setDuration] = useState('');
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [auth] = useAuth(); // Destructuring only the state, not the setter

  // Fetch meditation history from database
  useEffect(() => {
    fetchMeditationHistory();
  }, [auth?.token]); // Rerun fetch when token/auth state changes

  const fetchMeditationHistory = async () => {
    if (!auth?.token) return; // Don't fetch if not logged in

    try {
      setLoading(true);
      // --- AXIOS INTEGRATION for GET ---
      const response = await getMeditationHistory(); 
      const data = response.data; // Axios returns data property
      
      if (data.success){
        setHistory(data?.sessions || []);
        console.log(data?.sessions);
      }
      else {
        toast.success(data.message || "No meditation sessions yet");
      }
    } catch (error) {
      console.error('Error fetching meditation history:', error);
      // Use error.response.data.message for specific API error, or error.message for network error
      toast.error(error.response?.data?.message || error.message || 'Failed to fetch meditation history');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setShowResult(false);
    setDuration('');
    
    if (option === 'no') {
      // Save 0 score session if the user selects 'No'
      saveMeditationSessionToDB(0, "No meditation today");
    }
  };

  const calculateScoreAndSave = () => {
    if (!auth?.token) {
      toast.error("Please log in to track your meditation session.");
      return;
    }
    
    const durationNum = parseInt(duration);
    
    if (isNaN(durationNum) || durationNum <= 0) {
      toast.error("Please enter a valid number of minutes");
      return;
    }
    
    // Calculate score
    const rawScore = durationNum;
    const roundedScore = Math.round(rawScore / 10) * 10;
    
    // Update state
    setScore(roundedScore);
    setShowResult(true);
    
    // Save to database
    saveMeditationSessionToDB(roundedScore, `${durationNum} minutes`);
    
    // Clear input after saving
    setDuration('');
  };

  // Renamed function to avoid conflict with imported API function
  const saveMeditationSessionToDB = async (score, details) => {
    if (!auth?.user?.id) return;

    const sessionData = {
      score,
      details,
      duration: details.includes('minutes') ? parseInt(details.split(' ')[0]) : 0,
      date: new Date().toISOString(),
      profilePicture : auth?.user?.profilePicture,
      name : auth?.user?.name
    };
    
    try {
      setLoading(true);
      // --- AXIOS INTEGRATION for POST ---
      const response = await apiSaveMeditationSession(auth.user.id, sessionData);
      const newSessionData = response.data; // Axios response data
      
      if (newSessionData.success) {
        toast.success(newSessionData.message || "Meditation session saved successfully!");
        // Add to beginning of history array (safely checking for the session property)
        const newHistory = [newSessionData?.session, ...history.slice(0, 4)].filter(item => item);
        setHistory(newHistory);
      } else {
        toast.error(newSessionData.message || 'Failed to save your meditation session.');
      }
      
    } catch (error) {
      console.error('Error saving meditation session:', error);
      toast.error(error.response?.data?.message || error.message || 'Error saving your meditation session.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreCalculationText = () => {
    if (!duration) return '';
    const durationNum = parseInt(duration);
    if (isNaN(durationNum)) return '';

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
            {loading && selectedOption === 'no' ? '...' : 'Yes'}
          </button>
          <button 
            className={`${styles.optionBtn} ${selectedOption === 'no' ? styles.selected : ''}`}
            onClick={() => handleOptionSelect('no')}
            disabled={loading}
          >
            {loading && selectedOption === 'no' ? '...' : 'No'}
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
          <button className={styles.calculateBtn} onClick={calculateScoreAndSave} disabled={loading || !duration}>
            {loading && selectedOption === 'yes' ? 'Saving...' : 'Calculate Score'}
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
            {loading && history.length === 0 ? (
              <div className={styles.scoreDetails}>Loading history...</div>
            ) : history.length > 0 ? (
              history.map((item, index) => (
                <div key={index} className={styles.historyItem}>
                  <div><Avatar src={item?.profilePicture} size={30} /></div>
                  <div className={styles.historyScore} >{item?.name}</div>
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