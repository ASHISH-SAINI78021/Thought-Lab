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
      const [selectedDate, setSelectedDate] = useState(() => {
            const today = new Date();
            const offset = today.getTimezoneOffset() * 60000;
            const localISODate = new Date(today.getTime() - offset).toISOString().split('T')[0];
            return localISODate;
      });
      const [totalScoreForDay, setTotalScoreForDay] = useState(0);
      const [auth] = useAuth(); // Destructuring only the state, not the setter

      // Helper to format date for display
      const formatDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
            });
      };

      // Fetch meditation history from database
      useEffect(() => {
            fetchMeditationHistory();
      }, [auth?.token, selectedDate]); // Rerun fetch when token or selectedDate changes

      const fetchMeditationHistory = async () => {
            if (!auth?.token) return; // Don't fetch if not logged in

            try {
                  setLoading(true);
                  // --- AXIOS INTEGRATION for GET with date filter ---
                  const response = await getMeditationHistory(selectedDate);
                  const data = response.data; // Axios returns data property

                  if (data.success) {
                        const sessions = data?.sessions || [];
                        setHistory(sessions);

                        // Calculate total score for the selected day
                        const total = sessions.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0);
                        setTotalScoreForDay(total);
                  }
                  else {
                        setHistory([]);
                        setTotalScoreForDay(0);
                        // toast.success(data.message || "No meditation sessions yet");
                  }
            } catch (error) {
                  console.error('Error fetching meditation history:', error);
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
                  profilePicture: auth?.user?.profilePicture,
                  name: auth?.user?.name
            };

            const originalHistory = [...history];
            const originalTotalScore = totalScoreForDay;

            // Optimistic Update
            const optimisticHistory = [sessionData, ...history];
            setHistory(optimisticHistory);
            setTotalScoreForDay(prev => prev + score);

            try {
                  setLoading(true);
                  // --- AXIOS INTEGRATION for POST ---
                  const response = await apiSaveMeditationSession(auth.user.id, sessionData);
                  const newSessionData = response.data; // Axios response data

                  if (newSessionData.success) {
                        toast.success(newSessionData.message || "Meditation session saved successfully!");
                        // Sync with server data (which will have real ID)
                        const syncedHistory = [newSessionData?.session, ...originalHistory].filter(item => item);
                        setHistory(syncedHistory);
                        const finalTotal = syncedHistory.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0);
                        setTotalScoreForDay(finalTotal);
                  } else {
                        toast.error(newSessionData.message || 'Failed to save your meditation session.');
                        setHistory(originalHistory);
                        setTotalScoreForDay(originalTotalScore);
                  }

            } catch (error) {
                  console.error('Error saving meditation session:', error);
                  toast.error(error.response?.data?.message || error.message || 'Error saving your meditation session.');
                  setHistory(originalHistory);
                  setTotalScoreForDay(originalTotalScore);
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
                              <div className={styles.todaySummary}>
                                    <div className={styles.summaryLabel}>Today's Summary</div>
                                    <div className={styles.summaryScore}>{totalScoreForDay}</div>
                                    <div className={styles.summaryText}>Total Meditation Points Earned</div>
                              </div>
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
                                    <div className={styles.historyHeader}>
                                          <div className={styles.historyTitle}>History Records</div>
                                          <div className={styles.filterControls}>
                                                {selectedDate && (
                                                      <button
                                                            className={styles.clearBtn}
                                                            onClick={() => setSelectedDate('')}
                                                      >
                                                            Show All
                                                      </button>
                                                )}
                                                <input
                                                      type="date"
                                                      className={styles.datePicker}
                                                      value={selectedDate}
                                                      onChange={(e) => setSelectedDate(e.target.value)}
                                                      onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                                />
                                          </div>
                                    </div>

                                    <div className={styles.historyList}>
                                          {loading && history.length === 0 ? (
                                                <div className={styles.scoreDetails}>Fetching records...</div>
                                          ) : history.length > 0 ? (
                                                history.map((item, index) => (
                                                      <div key={index} className={styles.historyItem}>
                                                            <div className={styles.historyMain}>
                                                                  <Avatar src={item?.profilePicture} size={40} />
                                                                  <div className={styles.historyInfo}>
                                                                        <div className={styles.historyName}>{item?.name}</div>
                                                                        <div className={styles.historyDate}>{formatDate(item?.date)}</div>
                                                                  </div>
                                                            </div>
                                                            <div className={styles.historyStats}>
                                                                  <div className={styles.historyDetails}>{item?.details}</div>
                                                                  <div className={styles.historyScore}>{item?.score}</div>
                                                            </div>
                                                      </div>
                                                ))
                                          ) : (
                                                <div className={styles.emptyHistory}>
                                                      <FaSpa size={30} style={{ opacity: 0.3, marginBottom: '10px' }} />
                                                      <p>No records found for this date.</p>
                                                </div>
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