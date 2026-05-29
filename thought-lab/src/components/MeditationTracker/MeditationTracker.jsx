import React, { useState, useEffect } from 'react';
import { FaSpa } from 'react-icons/fa';
import styles from './MeditationTracker.module.css';
import toast from 'react-hot-toast';
import { useAuth } from "../../Context/auth";
import { Avatar } from 'antd';
import { getMeditationHistory, saveMeditationSession as apiSaveMeditationSession } from '../../http';
import SplashCursor from '../react-bits/SplashCursor';
import { getTier, getXpProgress, getXpToNextTier } from '../../utils/soulXp';
import FocusPet from '../FocusPet/FocusPet';
import LevelUpCard from '../FocusPet/LevelUpCard';
import BadgeUnlockCard from '../FocusPet/BadgeUnlockCard';
import { url } from '../../url';

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
      const [petData, setPetData] = useState(null);
      const [petStats, setPetStats] = useState({ blogsRead: 0, meditationsLogged: 0 });
      const [levelUpData, setLevelUpData] = useState(null);
      const [unlockedBadge, setUnlockedBadge] = useState(null);
      const [totalPoints, setTotalPoints] = useState(0); // Total Soul XP
      const [auth] = useAuth();

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

                        // Trigger Focus Pet API concurrently
                        if (score > 0) {
                              fetch(`${url}/user/pet/award-xp`, {
                                    method: 'POST',
                                    headers: { Authorization: auth.token, 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ actionType: 'MEDITATE', duration: score })
                              })
                                    .then(res => res.json())
                                    .then(data => {
                                          if (data.success) {
                                                setPetData(data.focusPet);
                                                setPetStats(prev => ({
                                                      ...prev,
                                                      meditationsLogged: prev.meditationsLogged + 1
                                                }));
                                                if (data.leveledUp) {
                                                      setLevelUpData(data.focusPet);
                                                } else {
                                                      toast.success(data.message, { duration: 3000 });
                                                }
                                                (data.newBadges || []).forEach((b, idx) => {
                                                      if (idx === 0) {
                                                            setUnlockedBadge(b);
                                                      }
                                                      toast.success(`🏅 New Badge: ${b.icon} ${b.name}!`, { duration: 5000 });
                                                });
                                          }
                                    })
                                    .catch(err => console.error("Pet XP error:", err));
                        }
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

      // Fetch Pet Data on load
      useEffect(() => {
            if (auth?.user?.id) {
                  const fetchUser = async () => {
                        try {
                              const res = await fetch(`${url}/user/${auth.user.id}`, {
                                    headers: auth?.token ? { Authorization: auth.token } : {}
                              });
                              const data = await res.json();
                              if (data?.user?.focusPet) {
                                    setPetData(data.user.focusPet);
                              }
                              if (data?.user?.petStats) {
                                    setPetStats(data.user.petStats);
                              }
                              if (data?.user?.points !== undefined) {
                                    setTotalPoints(data.user.points);
                              }
                              if (data?.success && !data?.user?.focusPet) {
                                    setPetData({ level: 1, xp: 0, petType: 'seed' });
                              }
                        } catch (err) { }
                  };
                  fetchUser();
            }
      }, [auth?.user?.id, auth?.token]);

      return (
            <div className={styles.mainContainer}>
                  <SplashCursor />
                  {levelUpData && (
                        <LevelUpCard
                              focusPet={levelUpData}
                              userName={auth?.user?.name}
                              onClose={() => setLevelUpData(null)}
                        />
                  )}
                  {unlockedBadge && (
                        <BadgeUnlockCard
                              badge={unlockedBadge}
                              onClose={() => setUnlockedBadge(null)}
                        />
                  )}
                  <div className={styles.container}>
                        <div className={styles.header}>
                              <div className={styles.meditationIcon}>
                                    <FaSpa />
                              </div>
                              <h1>Meditation Tracker</h1>
                              <p>Earn <strong style={{ color: getTier(totalScoreForDay).color }}>Soul XP</strong> ✨ and ascend your tier</p>

                              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                                    <FocusPet petData={petData} />
                              </div>
                        </div>

                        <div className={styles.content}>
                              <div className={styles.todaySummary} style={{ borderColor: getTier(totalScoreForDay).color }}>
                                    <div className={styles.summaryLabel} style={{ color: getTier(totalScoreForDay).color }}>
                                          {getTier(totalScoreForDay).emoji} {getTier(totalScoreForDay).title}
                                    </div>
                                    <div className={styles.summaryScore} style={{ color: getTier(totalScoreForDay).color }}>{totalScoreForDay}</div>
                                    <div className={styles.summaryText}>Soul XP Earned Today</div>
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

                              {/* ── MILESTONE PROGRESS ── */}
                              <div className={styles.milestoneTracker}>
                                    <h3 className={styles.milestoneTitle}>🏆 Next Milestones</h3>
                                    <div className={styles.milestoneGrid}>
                                          {/* Leaderboard Ascension Badge */}
                                          {totalPoints < 5001 && (
                                                <div className={styles.milestoneCard}>
                                                      <div className={styles.milestoneIcon}>
                                                            {getTier(totalPoints + (getXpToNextTier(totalPoints) || 0)).emoji}
                                                      </div>
                                                      <div className={styles.milestoneInfo}>
                                                            <span className={styles.milestoneName}>
                                                                  Next Tier: {getTier(totalPoints + (getXpToNextTier(totalPoints) || 0)).title}
                                                            </span>
                                                            <div className={styles.progressRow}>
                                                                  <div className={styles.miniBar}>
                                                                        <div
                                                                              className={`${styles.miniFill} ${styles[getTier(totalPoints + (getXpToNextTier(totalPoints) || 0)).id]}`}
                                                                              style={{
                                                                                    width: `${getXpProgress(totalPoints)}%`
                                                                              }}
                                                                        />
                                                                  </div>
                                                                  <span className={styles.progressText}>
                                                                        {totalPoints} / {getTier(totalPoints + (getXpToNextTier(totalPoints) || 0)).minXp} XP
                                                                  </span>
                                                            </div>
                                                            <p className={styles.milestoneHint} style={{ color: getTier(totalPoints + 1).color }}>
                                                                  {getXpToNextTier(totalPoints)} Soul XP to ascend!
                                                            </p>
                                                      </div>
                                                </div>
                                          )}

                                          {/* Pet Level Progress */}
                                          {petData && (
                                                <div className={styles.milestoneCard}>
                                                      <div className={styles.milestoneIcon}>
                                                            {petData.level < 2 ? '🐣' : petData.level < 5 ? '🧘' : '🌳'}
                                                      </div>
                                                      <div className={styles.milestoneInfo}>
                                                            <span className={styles.milestoneName}>
                                                                  Next Pet Badge: {petData.level < 2 ? 'First Steps' : petData.level < 5 ? 'Zen Seeker' : 'Garden Master'}
                                                            </span>
                                                            <div className={styles.progressRow}>
                                                                  <div className={styles.miniBar}>
                                                                        <div
                                                                              className={styles.miniFill}
                                                                              style={{
                                                                                    width: `${(petData.xp / (petData.level * 50)) * 100}%`,
                                                                                    background: '#34d399'
                                                                              }}
                                                                        />
                                                                  </div>
                                                                  <span className={styles.progressText}>
                                                                        {petData.xp} / {petData.level * 50} XP
                                                                  </span>
                                                            </div>
                                                            <p className={styles.milestoneHint}>
                                                                  {(petData.level * 50) - petData.xp} Pet XP to Level {petData.level + 1}
                                                            </p>
                                                      </div>
                                                </div>
                                          )}

                                          {/* Meditation Monk Progress */}
                                          {petStats.meditationsLogged < 10 && (
                                                <div className={styles.milestoneCard}>
                                                      <div className={styles.milestoneIcon}>🙏</div>
                                                      <div className={styles.milestoneInfo}>
                                                            <span className={styles.milestoneName}>Meditation Monk</span>
                                                            <div className={styles.progressRow}>
                                                                  <div className={styles.miniBar}>
                                                                        <div
                                                                              className={styles.miniFill}
                                                                              style={{ width: `${(petStats.meditationsLogged / 10) * 100}%` }}
                                                                        />
                                                                  </div>
                                                                  <span className={styles.progressText}>
                                                                        {petStats.meditationsLogged} / 10 sessions
                                                                  </span>
                                                            </div>
                                                            <p className={styles.milestoneHint}>
                                                                  {10 - petStats.meditationsLogged} sessions left to unlock!
                                                            </p>
                                                      </div>
                                                </div>
                                          )}
                                    </div>
                              </div>

                              <div className={styles.history}>
                                    <div className={styles.historyHeader}>
                                          <div className={styles.historyTitle}>History Records</div>
                                          <div className={styles.filterControls}>
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