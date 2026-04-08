import React, { useState, useEffect } from "react";
import styles from './StudentDashboard.module.css';
import { useAuth } from '../../../Context/auth';
import { url } from '../../../url';
import { toast } from 'react-hot-toast';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const CIRCLE_R = 40;
const CIRC = 2 * Math.PI * CIRCLE_R;

const priorityConfig = {
    High: { color: '#ef4444', bg: '#fff1f2', glow: 'rgba(239,68,68,0.3)' },
    Medium: { color: '#f59e0b', bg: '#fffbeb', glow: 'rgba(245,158,11,0.3)' },
    Low: { color: '#22c55e', bg: '#f0fdf4', glow: 'rgba(34,197,94,0.3)' },
};

const statusCols = ['To Do', 'In Progress', 'Completed'];
const colConfig = {
    'To Do': { color: '#94a3b8', accent: '#e2e8f0', label: '📋 To Do' },
    'In Progress': { color: '#3b82f6', accent: '#dbeafe', label: '⚡ In Progress' },
    'Completed': { color: '#22c55e', accent: '#dcfce7', label: '✅ Completed' },
};

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

export default function StudentDashboard() {
    const [auth] = useAuth();
    const [tasks, setTasks] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', priority: 'Medium', dueTime: '' });
    const [submitting, setSubmitting] = useState(false);
    const [consistency, setConsistency] = useState([]);
    const [leaderScore, setLeaderScore] = useState(null);

    const fetchTasks = async () => {
        try {
            const res = await fetch(`${url}/daily-tasks/my-tasks`, {
                headers: { Authorization: auth?.token }
            });
            const d = await res.json();
            if (d.success) setTasks(d.tasks);
        } catch { toast.error("Failed to load tasks"); }
    };

    const fetchConsistency = async () => {
        try {
            const res = await fetch(`${url}/student/consistency`, {
                headers: { Authorization: auth?.token }
            });
            const d = await res.json();
            if (d.success) setConsistency(d.data);
        } catch { /* non-critical */ }
    };

    const fetchLeaderScore = async () => {
        try {
            const res = await fetch(`${url}/leaderboard`);
            const d = await res.json();
            if (d.success) {
                const mine = d.leaderboard.find(e => e.user?._id === auth?.user?._id);
                if (mine) setLeaderScore(mine.score);
            }
        } catch { /* non-critical */ }
    };

    useEffect(() => {
        if (auth?.token) {
            fetchTasks();
            fetchConsistency();
            fetchLeaderScore();
        }
    }, [auth?.token]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`${url}/daily-tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: auth?.token },
                body: JSON.stringify(form)
            });
            const d = await res.json();
            if (d.success) {
                toast.success("Task created!");
                setTasks([d.task, ...tasks]);
                setForm({ title: '', description: '', priority: 'Medium', dueTime: '' });
                setShowModal(false);
            } else { toast.error(d.message); }
        } catch { toast.error("Error creating task"); }
        finally { setSubmitting(false); }
    };

    const updateStatus = async (taskId, status) => {
        try {
            const res = await fetch(`${url}/daily-tasks/${taskId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: auth?.token },
                body: JSON.stringify({ status })
            });
            const d = await res.json();
            if (d.success) {
                setTasks(t => t.map(x => x._id === taskId ? d.task : x));
                toast.success(`Moved to "${status}"`);
            }
        } catch { toast.error("Update failed"); }
    };

    const handleDelete = async (taskId) => {
        if (!confirm("Delete this task?")) return;
        try {
            const res = await fetch(`${url}/daily-tasks/${taskId}`, {
                method: 'DELETE', headers: { Authorization: auth?.token }
            });
            const d = await res.json();
            if (d.success) { setTasks(t => t.filter(x => x._id !== taskId)); toast.success("Deleted"); }
        } catch { toast.error("Delete failed"); }
    };

    // Stats
    const todayStr = new Date().toDateString();
    const todayTasks = tasks.filter(t => new Date(t.createdAt).toDateString() === todayStr);
    const completedToday = todayTasks.filter(t => t.status === 'Completed').length;
    const rate = todayTasks.length ? Math.round((completedToday / todayTasks.length) * 100) : 0;

    const colTasks = (col) => tasks.filter(t => t.status === col);

    // Streak: count consecutive days (from end of consistency array) with at least 1 completed
    const streak = (() => {
        let s = 0;
        for (let i = consistency.length - 1; i >= 0; i--) {
            if (consistency[i].completed > 0) s++;
            else break;
        }
        return s;
    })();

    return (
        <div className={styles.page}>
            {/* ── Hero ── */}
            <div className={styles.hero}>
                <div className={styles.heroLeft}>
                    <div className={styles.avatarRing}>
                        <div className={styles.avatarInner}>{auth?.user?.name?.[0]?.toUpperCase() || '?'}</div>
                    </div>
                    <div>
                        <h1 className={styles.heroName}>Hey, {auth?.user?.name?.split(' ')[0]}! 👋</h1>
                        <p className={styles.heroSub}>Track your goals and stay consistent today.</p>
                    </div>
                </div>
                <div className={styles.heroRight}>
                    {/* Circular progress */}
                    <div className={styles.ringWrap}>
                        <svg width="96" height="96">
                            <defs>
                                <linearGradient id="rdGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#6366f1" />
                                    <stop offset="100%" stopColor="#06b6d4" />
                                </linearGradient>
                            </defs>
                            <circle cx="48" cy="48" r={CIRCLE_R} className={styles.ringBg} />
                            <circle cx="48" cy="48" r={CIRCLE_R}
                                className={styles.ringFg}
                                strokeDasharray={CIRC}
                                strokeDashoffset={CIRC - (rate / 100) * CIRC}
                                style={{ transform: 'rotate(-90deg)', transformOrigin: '48px 48px' }} />
                        </svg>
                        <div className={styles.ringLabel}>
                            <span className={styles.ringPct}>{rate}%</span>
                            <span className={styles.ringSmall}>Today</span>
                        </div>
                    </div>
                    <div className={styles.heroStats}>
                        <div className={styles.statPill}>
                            <span className={styles.statNum}>{tasks.length}</span>
                            <span className={styles.statLbl}>Total</span>
                        </div>
                        <div className={styles.statPill} style={{ background: '#dcfce7', borderColor: '#bbf7d0' }}>
                            <span className={styles.statNum} style={{ color: '#16a34a' }}>{tasks.filter(t => t.status === 'Completed').length}</span>
                            <span className={styles.statLbl}>Done</span>
                        </div>
                        <div className={styles.statPill} style={{ background: '#dbeafe', borderColor: '#bfdbfe' }}>
                            <span className={styles.statNum} style={{ color: '#2563eb' }}>{tasks.filter(t => t.status === 'In Progress').length}</span>
                            <span className={styles.statLbl}>Active</span>
                        </div>
                        {streak > 0 && (
                            <div className={styles.statPill} style={{ background: '#fff7ed', borderColor: '#fed7aa' }}>
                                <span className={styles.statNum} style={{ color: '#ea580c' }}>🔥{streak}</span>
                                <span className={styles.statLbl}>Streak</span>
                            </div>
                        )}
                        {leaderScore !== null && (
                            <div className={styles.statPill} style={{ background: '#fdf4ff', borderColor: '#e9d5ff' }}>
                                <span className={styles.statNum} style={{ color: '#9333ea' }}>⭐{leaderScore}</span>
                                <span className={styles.statLbl}>Score</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Consistency Chart ── */}
            {consistency.length > 0 && (
                <div className={styles.chartSection}>
                    <div className={styles.chartHeader}>
                        <h2 className={styles.chartTitle}>📈 Weekly Consistency</h2>
                        <span className={styles.chartSub}>Your last 7 days at a glance</span>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={consistency} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11, fill: '#64748b' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: '#64748b' }}
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                            />
                            <Bar dataKey="total" name="Created" fill="#c7d2fe" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="completed" name="Completed" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* ── Add Task Button ── */}
            <div className={styles.addTaskBar}>
                <button className={styles.addBtn} onClick={() => setShowModal(true)}>
                    <span className={styles.plusIcon}>+</span> Create Task
                </button>
            </div>

            {/* ── Kanban Board ── */}
            <div className={styles.kanban}>
                {statusCols.map(col => (
                    <div key={col} className={styles.column}>
                        <div className={styles.colHeader} style={{ borderTop: `3px solid ${colConfig[col].color}` }}>
                            <span className={styles.colLabel}>{colConfig[col].label}</span>
                            <span className={styles.colCount} style={{ background: colConfig[col].accent, color: colConfig[col].color }}>
                                {colTasks(col).length}
                            </span>
                        </div>

                        <div className={styles.colBody}>
                            {colTasks(col).length === 0 && (
                                <div className={styles.emptyCol}>No tasks here</div>
                            )}
                            {colTasks(col).map(task => {
                                const p = priorityConfig[task.priority] || priorityConfig.Medium;
                                return (
                                    <div key={task._id} className={styles.taskCard} style={{ '--glow': p.glow }}>
                                        <div className={styles.cardTop}>
                                            <span className={styles.priorityDot} style={{ background: p.color }} title={task.priority + ' Priority'} />
                                            <span className={styles.taskTitle}>{task.title}</span>
                                        </div>
                                        {task.description && <p className={styles.taskDesc}>{task.description}</p>}

                                        <div className={styles.cardMeta}>
                                            <span className={styles.priorityBadge} style={{ background: p.bg, color: p.color }}>{task.priority}</span>
                                            {task.dueTime && <span className={styles.dueBadge}>⏰ {task.dueTime}</span>}
                                        </div>

                                        {task.comments?.length > 0 && (
                                            <div className={styles.feedbackBox}>
                                                <span className={styles.feedbackIcon}>💬</span>
                                                {task.comments[task.comments.length - 1].text}
                                            </div>
                                        )}

                                        <div className={styles.cardActions}>
                                            {col !== 'Completed' && (
                                                <button className={styles.moveBtn}
                                                    style={{ color: colConfig[col === 'To Do' ? 'In Progress' : 'Completed'].color }}
                                                    onClick={() => updateStatus(task._id, col === 'To Do' ? 'In Progress' : 'Completed')}>
                                                    {col === 'To Do' ? 'Start →' : 'Complete ✓'}
                                                </button>
                                            )}
                                            {col !== 'Completed' && (
                                                <button className={styles.deleteBtn} onClick={() => handleDelete(task._id)}>✕</button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Create Task Modal ── */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>New Task</h3>
                            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleCreate} className={styles.modalForm}>
                            <input className={styles.field} placeholder="Task Title *" value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })} required />
                            <textarea className={styles.field} rows={3} placeholder="Description (optional)"
                                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            <div className={styles.fieldRow}>
                                <select className={styles.field} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                                    <option value="Low">🟢 Low Priority</option>
                                    <option value="Medium">🟡 Medium Priority</option>
                                    <option value="High">🔴 High Priority</option>
                                </select>
                                <input className={styles.field} placeholder="Due time (e.g. 5 PM)" value={form.dueTime}
                                    onChange={e => setForm({ ...form, dueTime: e.target.value })} />
                            </div>
                            <button type="submit" className={styles.submitBtn} disabled={submitting}>
                                {submitting ? 'Adding…' : '+ Add Task'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
