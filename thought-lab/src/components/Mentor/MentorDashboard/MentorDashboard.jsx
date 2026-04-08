import React, { useState, useEffect } from "react";
import styles from './MentorDashboard.module.css';
import { useAuth } from '../../../Context/auth';
import { url } from '../../../url';
import { toast } from 'react-hot-toast';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className={styles.chartTooltip}>
                <p className={styles.tooltipLabel}>{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color }}>
                        {p.name}: <strong>{p.value}</strong>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const MentorDashboard = () => {
    const [auth] = useAuth();
    const [students, setStudents] = useState([]);
    const [expandedStudent, setExpandedStudent] = useState(null);
    const [studentTasks, setStudentTasks] = useState([]);
    const [studentHabits, setStudentHabits] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [consistency, setConsistency] = useState([]);

    // Score award form state
    const [scoreForm, setScoreForm] = useState({ rawPoints: 50, reason: '' });
    const [submittingScore, setSubmittingScore] = useState(false);

    const fetchDashboard = async () => {
        try {
            const response = await fetch(`${url}/dashboard/mentor`, {
                headers: { 'Authorization': auth?.token }
            });
            const data = await response.json();
            if (data.success && data.data?.students) {
                setStudents(data.data.students);
            }
        } catch (error) {
            console.error("Failed to load mentor dashboard:", error);
            toast.error("Error loading dashboard data.");
        }
    };

    useEffect(() => {
        if (auth?.token) {
            fetchDashboard();
        }
    }, [auth?.token]);

    const handleExpandStudent = async (studentId) => {
        if (expandedStudent === studentId) {
            setExpandedStudent(null);
            setStudentTasks([]);
            setConsistency([]);
            return;
        }

        try {
            const [tasksRes, consistencyRes] = await Promise.all([
                fetch(`${url}/mentor/students/${studentId}/tasks`, {
                    headers: { 'Authorization': auth?.token }
                }),
                fetch(`${url}/mentor/students/${studentId}/consistency`, {
                    headers: { 'Authorization': auth?.token }
                })
            ]);

            const tasksData = await tasksRes.json();
            const consistencyData = await consistencyRes.json();

            if (tasksData.success) {
                setStudentTasks(tasksData.tasks);
                setStudentHabits(tasksData.habits || []);
                setExpandedStudent(studentId);
            } else {
                toast.error(tasksData.message || "Failed to load tasks.");
            }

            if (consistencyData.success) {
                setConsistency(consistencyData.data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error fetching student data.");
        }
    };

    const handleAddComment = async (taskId) => {
        if (!commentText.trim()) return toast.error("Comment cannot be empty");

        try {
            const response = await fetch(`${url}/mentor/tasks/${taskId}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': auth?.token
                },
                body: JSON.stringify({ text: commentText })
            });
            const data = await response.json();
            if (data.success) {
                toast.success("Comment added!");
                setCommentText("");
                setStudentTasks(prevTasks => prevTasks.map(t =>
                    t._id === taskId ? data.task : t
                ));
            } else {
                toast.error(data.message || "Failed to add comment.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error adding comment.");
        }
    };

    const handleAwardScore = async (studentId) => {
        if (!scoreForm.rawPoints || scoreForm.rawPoints < 1 || scoreForm.rawPoints > 100) {
            return toast.error("Points must be between 1 and 100");
        }
        setSubmittingScore(true);
        try {
            const response = await fetch(`${url}/mentor/students/${studentId}/add-score`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': auth?.token
                },
                body: JSON.stringify({
                    rawPoints: Number(scoreForm.rawPoints),
                    reason: scoreForm.reason
                })
            });
            const data = await response.json();
            if (data.success) {
                toast.success(`🎉 ${data.message}`);
                setScoreForm({ rawPoints: 50, reason: '' });
                // Refresh dashboard to show updated stats
                fetchDashboard();
            } else {
                toast.error(data.message || "Failed to award score.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error awarding score.");
        } finally {
            setSubmittingScore(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed':
            case 'COMPLETED': return '#22c55e';
            case 'In Progress':
            case 'ASSIGNED': return '#3b82f6';
            case 'FAILED': return '#ef4444';
            case 'OPEN': return '#9ca3af';
            default: return '#9ca3af';
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.pageHeader}>
                <h2 className={styles.title}>🧑‍🏫 Mentor Dashboard</h2>
                <p className={styles.subtitle}>Welcome back, {auth?.user?.name}. Here are your assigned students.</p>
            </div>

            {students.length === 0 ? (
                <div className={styles.emptyState}>
                    No students assigned yet. Contact your admin.
                </div>
            ) : (
                <div className={styles.studentGrid}>
                    {students.map(student => {
                        const completionRate = student.todaysTaskCount
                            ? Math.round((student.completedTaskCount / student.todaysTaskCount) * 100)
                            : 0;

                        return (
                            <div key={student._id} className={styles.studentCard}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.studentInfo}>
                                        <div className={styles.avatarCircle}>
                                            {student.name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <h3 className={styles.studentName}>{student.name}</h3>
                                            <span className={styles.studentRoll}>{student.rollNumber}</span>
                                        </div>
                                    </div>
                                    <button
                                        className={`${styles.expandBtn} ${expandedStudent === student._id ? styles.expandBtnActive : ''}`}
                                        onClick={() => handleExpandStudent(student._id)}
                                    >
                                        {expandedStudent === student._id ? '▲ Close' : '▼ View Details'}
                                    </button>
                                </div>

                                <div className={styles.statsRow}>
                                    <div className={styles.statBox}>
                                        <span className={styles.statNumber}>{student.todaysTaskCount}</span>
                                        <span className={styles.statLabel}>Tasks Today</span>
                                    </div>
                                    <div className={styles.statBox}>
                                        <span className={styles.statNumber} style={{ color: '#22c55e' }}>{student.completedTaskCount}</span>
                                        <span className={styles.statLabel}>Completed</span>
                                    </div>
                                    <div className={styles.statBox}>
                                        <span className={styles.statNumber} style={{ color: completionRate >= 70 ? '#22c55e' : completionRate >= 40 ? '#f59e0b' : '#ef4444' }}>
                                            {completionRate}%
                                        </span>
                                        <span className={styles.statLabel}>Today's Rate</span>
                                    </div>
                                </div>

                                {/* Completion rate progress bar */}
                                <div className={styles.progressBarWrap}>
                                    <div
                                        className={styles.progressBarFill}
                                        style={{
                                            width: `${completionRate}%`,
                                            background: completionRate >= 70
                                                ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                                                : completionRate >= 40
                                                    ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                                                    : 'linear-gradient(90deg, #ef4444, #dc2626)'
                                        }}
                                    />
                                </div>

                                {expandedStudent === student._id && (
                                    <div className={styles.expandedSection}>

                                        {/* ── Consistency Chart ── */}
                                        {consistency.length > 0 && (
                                            <div className={styles.chartWrap}>
                                                <h4 className={styles.sectionTitle}>📈 7-Day Consistency</h4>
                                                <ResponsiveContainer width="100%" height={160}>
                                                    <BarChart data={consistency} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                                        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                                        <Tooltip content={<CustomTooltip />} />
                                                        <Bar dataKey="total" name="Created" fill="#bfdbfe" radius={[3, 3, 0, 0]} />
                                                        <Bar dataKey="completed" name="Completed" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        )}

                                        {/* ── Habits Section ── */}
                                        <div className={styles.habitsSection}>
                                            <h4 className={styles.sectionTitle}>⭐ Habit Monitoring</h4>
                                            {studentHabits.length === 0 ? (
                                                <p className={styles.noTasksMsg}>Student has no active habits.</p>
                                            ) : (
                                                <div className={styles.habitsGrid}>
                                                    {studentHabits.map(habit => {
                                                        const isCompletedToday = habit.completions.includes(new Date().toISOString().split('T')[0]);
                                                        return (
                                                            <div key={habit._id} className={styles.habitCard} style={{ borderLeftColor: habit.color }}>
                                                                <span className={styles.habitEmoji}>{habit.emoji}</span>
                                                                <div className={styles.habitInfo}>
                                                                    <span className={styles.habitName}>{habit.name}</span>
                                                                    <span className={styles.habitStatus} style={{ color: isCompletedToday ? '#22c55e' : '#94a3b8' }}>
                                                                        {isCompletedToday ? '✅ Done Today' : '⏳ Pending'}
                                                                    </span>
                                                                </div>
                                                                {habit.habitType === 'time' && (
                                                                    <div className={styles.habitTime}>
                                                                        {habit.timeLogs?.find(l => l.date === new Date().toISOString().split('T')[0])?.minutes || 0}m
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* ── Award Score Form ── */}
                                        <div className={styles.scoreSection}>
                                            <h4 className={styles.sectionTitle}>⭐ Award Leaderboard Score</h4>
                                            <p className={styles.formulaNote}>
                                                Formula: <strong>{scoreForm.rawPoints} pts × (1 + {completionRate}% × 0.5)</strong>
                                                {' → '}
                                                <strong className={styles.finalScorePreview}>
                                                    ≈ {Math.round(scoreForm.rawPoints * (1 + (completionRate / 100) * 0.5))} pts
                                                </strong>
                                                <span className={styles.formulaNote2}> (consistency bonus applied)</span>
                                            </p>
                                            <div className={styles.scoreInputRow}>
                                                <div className={styles.sliderWrap}>
                                                    <label className={styles.sliderLabel}>
                                                        Points: <strong>{scoreForm.rawPoints}</strong>
                                                    </label>
                                                    <input
                                                        type="range"
                                                        min="1"
                                                        max="100"
                                                        value={scoreForm.rawPoints}
                                                        onChange={e => setScoreForm({ ...scoreForm, rawPoints: Number(e.target.value) })}
                                                        className={styles.slider}
                                                    />
                                                    <div className={styles.sliderTicks}>
                                                        <span>1</span><span>25</span><span>50</span><span>75</span><span>100</span>
                                                    </div>
                                                </div>
                                                <input
                                                    className={styles.reasonInput}
                                                    type="text"
                                                    placeholder="Reason (e.g. Excellent project submission)"
                                                    value={scoreForm.reason}
                                                    onChange={e => setScoreForm({ ...scoreForm, reason: e.target.value })}
                                                />
                                                <button
                                                    className={styles.awardBtn}
                                                    onClick={() => handleAwardScore(student._id)}
                                                    disabled={submittingScore}
                                                >
                                                    {submittingScore ? 'Awarding…' : '🏅 Award Score'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* ── Task List ── */}
                                        <div className={styles.tasksSection}>
                                            <h4 className={styles.sectionTitle}>📋 Daily Tasks</h4>
                                            {studentTasks.length === 0 ? (
                                                <p className={styles.noTasksMsg}>Student has no active tasks.</p>
                                            ) : (
                                                <div className={styles.tasksList}>
                                                    {studentTasks.map(task => (
                                                        <div key={task._id} className={styles.taskItem}>
                                                            <div className={styles.taskHeader}>
                                                                <div className={styles.taskTitleGroup}>
                                                                    <strong>{task.title}</strong>
                                                                    {task.isAssignedTask && (
                                                                        <span className={styles.assignedBadge}>📌 Assigned</span>
                                                                    )}
                                                                </div>
                                                                <span
                                                                    className={styles.taskBadge}
                                                                    style={{ borderColor: getStatusColor(task.status), color: getStatusColor(task.status) }}
                                                                >
                                                                    {task.status}
                                                                </span>
                                                            </div>
                                                            {task.description && <p className={styles.taskDesc}>{task.description}</p>}
                                                            <div className={styles.taskMeta}>
                                                                <span>Priority: <span style={{ color: task.priority === 'High' ? '#ef4444' : task.priority === 'Medium' ? '#f59e0b' : '#22c55e', fontWeight: 700 }}>{task.priority}</span></span>
                                                                {task.dueTime && <span>Due: {task.dueTime}</span>}
                                                            </div>

                                                            <div className={styles.commentsSection}>
                                                                {(task.comments?.length > 0) && (
                                                                    <div className={styles.commentList}>
                                                                        {task.comments.map((c, i) => (
                                                                            <div key={i} className={styles.commentBubble}>
                                                                                <span className={styles.commentAuthor}>Mentor Note:</span> {c.text}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                <div className={styles.addCommentForm}>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Add a note on this task..."
                                                                        value={commentText}
                                                                        onChange={(e) => setCommentText(e.target.value)}
                                                                    />
                                                                    <button onClick={() => handleAddComment(task._id)}>Comment</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MentorDashboard;
