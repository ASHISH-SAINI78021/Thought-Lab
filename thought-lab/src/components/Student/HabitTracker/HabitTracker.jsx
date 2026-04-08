import React, { useState, useEffect, useMemo } from 'react';
import styles from './HabitTracker.module.css';
import LogTimeModal from './LogTimeModal';
import { useAuth } from '../../../Context/auth';
import { url } from '../../../url';
import { toast } from 'react-hot-toast';

/* ─── helpers ─── */
const toDateStr = (d) => d.toISOString().split('T')[0];

const getWeekDays = () => {
    const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const dow = today.getDay() === 0 ? 6 : today.getDay() - 1;
    return names.map((label, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - dow + i);
        return { label, dateStr: toDateStr(d), isToday: i === dow };
    });
};

// Build 16-week × 7-day grid for checkbox heatmap
const buildHeatmap = (completions) => {
    const grid = [];
    const today = new Date();
    const endDay = new Date(today); endDay.setHours(23, 59, 59, 999);
    const startDay = new Date(endDay); startDay.setDate(startDay.getDate() - 7 * 16 + 1);
    const mondayOffset = startDay.getDay() === 0 ? 6 : startDay.getDay() - 1;
    startDay.setDate(startDay.getDate() - mondayOffset);
    const completionSet = new Set(completions);
    let week = [];
    const cur = new Date(startDay);
    while (cur <= endDay) {
        const ds = toDateStr(cur);
        week.push({ dateStr: ds, done: completionSet.has(ds), future: cur > today });
        if (week.length === 7) { grid.push(week); week = []; }
        cur.setDate(cur.getDate() + 1);
    }
    if (week.length) {
        while (week.length < 7) week.push({ dateStr: '', done: false, future: true });
        grid.push(week);
    }
    return grid;
};

const fmt = (n) => String(n).padStart(2, '0');

// Build 8-week duration table (Mon–Sun rows, weekly columns)
const buildDurationTable = (timeLogs) => {
    const logMap = {};
    timeLogs.forEach(l => { logMap[l.date] = (logMap[l.date] || 0) + l.minutes; });

    const today = new Date();
    const dow = today.getDay() === 0 ? 6 : today.getDay() - 1;
    // start from Monday 7 weeks ago
    const start = new Date(today);
    start.setDate(today.getDate() - dow - 7 * 7);
    const weeks = [];
    for (let w = 0; w < 8; w++) {
        const week = { label: '', days: [] };
        for (let d = 0; d < 7; d++) {
            const date = new Date(start);
            date.setDate(start.getDate() + w * 7 + d);
            const ds = toDateStr(date);
            const mins = logMap[ds] || 0;
            week.days.push({ dateStr: ds, mins, hours: +(mins / 60).toFixed(2), future: date > today });
            if (d === 0) week.label = date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
        }
        weeks.push(week);
    }
    return weeks;
};

const calcStreak = (completions) => {
    if (!completions.length) return 0;
    const set = new Set(completions);
    let streak = 0;
    const d = new Date();
    if (!set.has(toDateStr(d))) d.setDate(d.getDate() - 1);
    while (set.has(toDateStr(d))) { streak++; d.setDate(d.getDate() - 1); }
    return streak;
};

const fmtMins = (m) => {
    if (!m) return null;
    const h = Math.floor(m / 60), min = m % 60;
    return h > 0 ? `${h}h${min > 0 ? ` ${min}m` : ''}` : `${min}m`;
};

const DAY_LABELS = ['M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su'];
const COLORS = ['#6366f1', '#f97316', '#ef4444', '#22c55e', '#06b6d4', '#a855f7', '#eab308', '#ec4899'];
const EMOJIS = ['⭐', '📚', '💪', '🎯', '🧘', '💻', '🎨', '🏃', '🎵', '✍️', '🍎', '💡'];
const LABELS = { Mon: 'M', Tue: 'Tu', Wed: 'W', Thu: 'Th', Fri: 'F', Sat: 'Sa', Sun: 'Su' };

export default function HabitTracker() {
    const [auth] = useAuth();
    const [habits, setHabits] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingHabit, setEditingHabit] = useState(null);
    const [logTimeHabit, setLogTimeHabit] = useState(null); // habit object for LogTimeModal
    const [collapsedHeatmaps, setCollapsedHeatmaps] = useState(new Set());
    const [form, setForm] = useState({ name: '', emoji: '⭐', color: '#6366f1', habitType: 'check' });
    const weekDays = useMemo(() => getWeekDays(), []);
    const todayStr = toDateStr(new Date());

    // --- Global Persistent Timer ---
    const [activeTimer, setActiveTimer] = useState(() => {
        const s = localStorage.getItem('tl_timer');
        return s ? JSON.parse(s) : null;
    });
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        if (activeTimer?.running) {
            const id = setInterval(() => setNow(Date.now()), 1000);
            return () => clearInterval(id);
        }
    }, [activeTimer?.running]);

    useEffect(() => {
        if (activeTimer) localStorage.setItem('tl_timer', JSON.stringify(activeTimer));
        else localStorage.removeItem('tl_timer');
    }, [activeTimer]);

    const timerElapsed = useMemo(() => {
        if (!activeTimer) return 0;
        let el = activeTimer.accumulated || 0;
        if (activeTimer.running) el += Math.floor((now - activeTimer.lastStart) / 1000);
        return el;
    }, [activeTimer, now]);

    const timerRemaining = activeTimer?.type === 'countdown' ? Math.max(activeTimer.target - timerElapsed, 0) : null;

    useEffect(() => {
        if (activeTimer?.type === 'countdown' && activeTimer.running && timerRemaining === 0) {
            setActiveTimer(p => ({ ...p, running: false, accumulated: p.target }));
        }
    }, [timerRemaining, activeTimer]);

    const handleTimerStart = ({ habitId, type, target }) => {
        setActiveTimer({ habitId, type, target, accumulated: 0, lastStart: Date.now(), running: true });
        setLogTimeHabit(null);
    };

    const toggleTimer = () => {
        if (!activeTimer) return;
        if (activeTimer.running) {
            setActiveTimer(p => ({ ...p, running: false, accumulated: timerElapsed }));
        } else {
            setActiveTimer(p => ({ ...p, running: true, lastStart: Date.now() }));
        }
    };

    const finishTimerAndLog = () => {
        if (!activeTimer) return;
        const minutes = Math.max(Math.ceil(timerElapsed / 60), 1);
        handleLogTime(activeTimer.habitId, minutes);
        setActiveTimer(null);
    };

    const cancelTimer = () => {
        if (confirm("Cancel timer without logging?")) setActiveTimer(null);
    };

    const formatTimerDisp = () => {
        let secs = activeTimer?.type === 'countdown' ? timerRemaining : timerElapsed;
        if (secs == null) return "00:00";
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        if (h > 0) return `${h}:${fmt(m)}:${fmt(s)}`;
        return `${fmt(m)}:${fmt(s)}`;
    };
    // --------------------------------

    const fetchHabits = async () => {
        try {
            const res = await fetch(`${url}/habits/my-habits`, { headers: { Authorization: auth?.token } });
            const d = await res.json();
            if (d.success) setHabits(d.habits);
        } catch { toast.error('Failed to load habits'); }
    };

    useEffect(() => { if (auth?.token) fetchHabits(); }, [auth?.token]);

    const handleToggleToday = async (habitId) => {
        try {
            const res = await fetch(`${url}/habits/${habitId}/toggle`, { method: 'PUT', headers: { Authorization: auth?.token } });
            const d = await res.json();
            if (d.success) setHabits(prev => prev.map(h => h._id === habitId ? d.habit : h));
        } catch { toast.error('Toggle failed'); }
    };

    const handleToggleDate = async (habitId, dateStr) => {
        try {
            const res = await fetch(`${url}/habits/${habitId}/toggle-date`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: auth?.token },
                body: JSON.stringify({ date: dateStr })
            });
            const d = await res.json();
            if (d.success) setHabits(prev => prev.map(h => h._id === habitId ? d.habit : h));
        } catch { toast.error('Toggle failed'); }
    };

    const handleLogTime = async (habitId, minutes) => {
        try {
            const res = await fetch(`${url}/habits/${habitId}/log-time`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: auth?.token },
                body: JSON.stringify({ date: todayStr, minutes })
            });
            const d = await res.json();
            if (d.success) {
                setHabits(prev => prev.map(h => h._id === habitId ? d.habit : h));
                toast.success(`Logged ${fmtMins(minutes)}!`);
            } else toast.error(d.message);
        } catch { toast.error('Log failed'); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return toast.error('Name is required');
        const isEdit = !!editingHabit;
        try {
            const res = await fetch(`${url}/habits${isEdit ? `/${editingHabit._id}` : ''}`, {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: auth?.token },
                body: JSON.stringify(form)
            });
            const d = await res.json();
            if (d.success) {
                if (isEdit) {
                    setHabits(prev => prev.map(h => h._id === editingHabit._id ? d.habit : h));
                    toast.success('Habit updated!');
                } else {
                    setHabits(prev => [...prev, d.habit]);
                    toast.success('Habit created!');
                }
                setForm({ name: '', emoji: '⭐', color: '#6366f1', habitType: 'check' });
                setEditingHabit(null);
                setShowCreateModal(false);
            } else toast.error(d.message);
        } catch { toast.error((isEdit ? 'Update' : 'Create') + ' failed'); }
    };

    const openCreateModal = () => {
        setEditingHabit(null);
        setForm({ name: '', emoji: '⭐', color: '#6366f1', habitType: 'check' });
        setShowCreateModal(true);
    };

    const openEditModal = (habit) => {
        setEditingHabit(habit);
        setForm({ name: habit.name, emoji: habit.emoji, color: habit.color, habitType: habit.habitType || 'check' });
        setShowCreateModal(true);
    };

    const handleDelete = async (habitId) => {
        if (!confirm('Delete this habit?')) return;
        try {
            const res = await fetch(`${url}/habits/${habitId}`, { method: 'DELETE', headers: { Authorization: auth?.token } });
            const d = await res.json();
            if (d.success) { setHabits(prev => prev.filter(h => h._id !== habitId)); toast.success('Deleted'); }
        } catch { toast.error('Delete failed'); }
    };

    const toggleCollapse = (id) => setCollapsedHeatmaps(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
    });

    const dayCounts = useMemo(() =>
        weekDays.map(({ dateStr }) => ({
            dateStr, count: habits.filter(h => h.completions.includes(dateStr)).length
        })), [habits, weekDays]);

    return (
        <div className={styles.page}>
            {/* ── Sticky Header ── */}
            <div className={styles.header}>
                <div className={styles.headerInner}>
                    <div className={styles.headerTop}>
                        <div>
                            <div className={styles.dateLabel}>Today, {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                            <div className={styles.statsRow}>
                                <span className={styles.statsChip}>{habits.filter(h => h.completions.includes(todayStr)).length}/{habits.length} today</span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.weekStrip}>
                        {dayCounts.map(({ dateStr, count }, i) => {
                            const isToday = dateStr === todayStr;
                            const allDone = habits.length > 0 && count === habits.length;
                            return (
                                <div key={i} className={`${styles.dayPill} ${isToday ? styles.dayPillToday : ''}`}>
                                    <span className={styles.dayName}>{weekDays[i].label}</span>
                                    <div className={`${styles.dayCircle} ${allDone ? styles.dayCircleDone : ''}`}>
                                        {allDone ? '✓' : habits.length ? `${count}/${habits.length}` : '-'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Habit Cards ── */}
            <div className={styles.habitList}>
                {habits.length === 0 && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyEmoji}>🌱</div>
                        <p>No habits yet. Tap <strong>+</strong> to start tracking!</p>
                    </div>
                )}
                {habits.map(habit => {
                    const isTime = habit.habitType === 'time';
                    const doneToday = habit.completions.includes(todayStr);
                    const streak = calcStreak(habit.completions);
                    const weekCount = weekDays.filter(({ dateStr }) => habit.completions.includes(dateStr)).length;
                    const isCollapsed = collapsedHeatmaps.has(habit._id);
                    const todayLog = isTime && habit.timeLogs?.find(l => l.date === todayStr);
                    const todayMins = todayLog?.minutes || 0;

                    return (
                        <div key={habit._id} className={styles.habitCard} style={{ '--habit-color': habit.color }}>
                            {/* Card Header */}
                            <div className={styles.cardHeader}>
                                <div className={styles.habitIcon} style={{ background: `${habit.color}22`, border: `2px solid ${habit.color}` }}>
                                    {habit.emoji}
                                </div>
                                <div className={styles.habitMeta}>
                                    <div className={styles.habitName}>{habit.name}</div>
                                    <div className={styles.habitStreak}>
                                        🔥 Streak: {streak > 0 ? `${Math.floor(streak / 7)}w ${streak % 7}d` : '0 days'}
                                        <span className={styles.weekDot}>•</span>
                                        {isTime
                                            ? fmtMins(weekDays.reduce((acc, { dateStr }) => acc + (habit.timeLogs?.find(l => l.date === dateStr)?.minutes || 0), 0)) || '0m' + ' this week'
                                            : `${weekCount}/7 this week`}
                                    </div>
                                </div>
                                <div className={styles.cardActions}>
                                    {isTime ? (
                                        <button
                                            className={`${styles.actionBtn} ${doneToday ? styles.doneBtn : ''}`}
                                            style={doneToday ? { background: habit.color } : {}}
                                            onClick={() => {
                                                if (activeTimer?.habitId === habit._id) {
                                                    toggleTimer();
                                                } else {
                                                    if (activeTimer && !confirm("Another timer is already running. Switch?")) return;
                                                    setLogTimeHabit(habit);
                                                }
                                            }}
                                            title="Log time or Control timer"
                                        >
                                            {activeTimer?.habitId === habit._id
                                                ? (activeTimer.running ? '⏸' : '▶')
                                                : (doneToday ? fmtMins(todayMins) || '⏱' : '⏱')}
                                        </button>
                                    ) : (
                                        <button
                                            className={`${styles.actionBtn} ${doneToday ? styles.doneBtn : ''}`}
                                            style={doneToday ? { background: habit.color } : {}}
                                            onClick={() => handleToggleToday(habit._id)}
                                            title={doneToday ? 'Undo' : 'Mark done'}
                                        >
                                            {doneToday ? '✓' : '○'}
                                        </button>
                                    )}
                                    <button className={styles.expandBtn} onClick={() => openEditModal(habit)} title="Edit habit">
                                        ✏️
                                    </button>
                                    <button className={styles.expandBtn} onClick={() => toggleCollapse(habit._id)} title={isCollapsed ? 'Show heatmap' : 'Hide heatmap'}>
                                        {isCollapsed ? '▦' : '▣'}
                                    </button>
                                    <button className={styles.deleteBtn} onClick={() => handleDelete(habit._id)} title="Delete">✕</button>
                                </div>
                            </div>

                            {/* Weekly row — checkboxes for check habits, time cells for time habits */}
                            <div className={styles.weekRow}>
                                {weekDays.map(({ label, dateStr, isToday }) => {
                                    if (isTime) {
                                        const mins = habit.timeLogs?.find(l => l.date === dateStr)?.minutes || 0;
                                        const hrs = +(mins / 60).toFixed(1);
                                        const intensity = Math.min(mins / 120, 1); // max at 2h
                                        return (
                                            <div key={dateStr} className={styles.dayCol}>
                                                <span className={`${styles.weekDayLabel} ${isToday ? styles.weekDayToday : ''}`}>{LABELS[label]}</span>
                                                <div
                                                    className={`${styles.weekBox} ${mins > 0 ? styles.weekBoxDone : ''} ${isToday ? styles.weekBoxToday : ''}`}
                                                    style={mins > 0 ? { background: `${habit.color}${Math.round(intensity * 200 + 55).toString(16).padStart(2, '0')}`, borderColor: habit.color } : {}}
                                                    title={mins > 0 ? `${fmtMins(mins)}` : 'No time logged'}
                                                >
                                                    {mins > 0 && <span className={styles.timeCell}>{hrs > 0 ? `${hrs}` : ''}</span>}
                                                </div>
                                            </div>
                                        );
                                    }
                                    const done = habit.completions.includes(dateStr);
                                    return (
                                        <div key={dateStr} className={styles.dayCol}>
                                            <span className={`${styles.weekDayLabel} ${isToday ? styles.weekDayToday : ''}`}>{LABELS[label]}</span>
                                            <button
                                                className={`${styles.weekBox} ${done ? styles.weekBoxDone : ''} ${isToday ? styles.weekBoxToday : ''}`}
                                                style={done ? { background: habit.color, borderColor: habit.color } : {}}
                                                onClick={() => handleToggleDate(habit._id, dateStr)}
                                            >
                                                {done && <span className={styles.checkMark}>✓</span>}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Heatmap */}
                            {!isCollapsed && (
                                <div className={styles.heatmapWrap}>
                                    {isTime ? (
                                        /* Duration table */
                                        <div className={styles.durationTable}>
                                            {buildDurationTable(habit.timeLogs || []).map((w, wi) => (
                                                <div key={wi} className={styles.durationWeek}>
                                                    {wi % 4 === 0 && <div className={styles.durationWeekLabel}>{w.label}</div>}
                                                    {w.days.map((cell, di) => {
                                                        const intensity = cell.mins > 0 ? Math.min(cell.mins / 120, 1) : 0;
                                                        return (
                                                            <div key={di}
                                                                className={`${styles.durationCell} ${cell.future ? styles.heatCellFuture : ''}`}
                                                                style={cell.mins > 0 ? {
                                                                    background: habit.color,
                                                                    opacity: 0.3 + intensity * 0.7,
                                                                    color: '#fff'
                                                                } : {}}
                                                                title={cell.dateStr + (cell.mins ? `: ${fmtMins(cell.mins)}` : '')}>
                                                                {cell.hours > 0 ? cell.hours : ''}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        /* Dot heatmap */
                                        <div className={styles.heatmapGrid}>
                                            {buildHeatmap(habit.completions).map((week, wi) => (
                                                <div key={wi} className={styles.heatmapWeek}>
                                                    {week.map((cell, di) => (
                                                        <div key={di}
                                                            className={`${styles.heatCell} ${cell.done ? styles.heatCellDone : ''} ${cell.future ? styles.heatCellFuture : ''}`}
                                                            style={cell.done ? { background: habit.color, opacity: 0.85 } : {}}
                                                            title={cell.dateStr} />
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ── FAB ── */}
            <button className={styles.fab} onClick={openCreateModal}>+</button>

            {/* ── Create / Edit Habit Modal ── */}
            {showCreateModal && (
                <div className={styles.overlay} onClick={() => setShowCreateModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalTitle}>{editingHabit ? 'Edit Habit' : 'New Habit'}</div>
                        <form onSubmit={handleSubmit}>
                            <input className={styles.field} placeholder="Habit name (e.g. Reading)"
                                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required autoFocus />

                            <label className={styles.controlLabel}>Habit Type</label>
                            <div className={styles.typeRow}>
                                <button type="button"
                                    className={`${styles.typeBtn} ${form.habitType === 'check' ? styles.typeBtnActive : ''}`}
                                    style={form.habitType === 'check' ? { borderColor: form.color, color: form.color } : {}}
                                    onClick={() => setForm({ ...form, habitType: 'check' })}>
                                    ✓ Checkbox
                                </button>
                                <button type="button"
                                    className={`${styles.typeBtn} ${form.habitType === 'time' ? styles.typeBtnActive : ''}`}
                                    style={form.habitType === 'time' ? { borderColor: form.color, color: form.color } : {}}
                                    onClick={() => setForm({ ...form, habitType: 'time' })}>
                                    ⏱ Time Tracked
                                </button>
                            </div>

                            <label className={styles.controlLabel}>Pick an Emoji</label>
                            <div className={styles.emojiGrid}>
                                {EMOJIS.map(em => (
                                    <button key={em} type="button"
                                        className={`${styles.emojiBtn} ${form.emoji === em ? styles.emojiBtnActive : ''}`}
                                        onClick={() => setForm({ ...form, emoji: em })}>{em}</button>
                                ))}
                            </div>

                            <label className={styles.controlLabel}>Pick a Colour</label>
                            <div className={styles.colorRow}>
                                {COLORS.map(c => (
                                    <button key={c} type="button"
                                        className={`${styles.colorSwatch} ${form.color === c ? styles.colorSwatchActive : ''}`}
                                        style={{ background: c }} onClick={() => setForm({ ...form, color: c })} />
                                ))}
                            </div>

                            <button type="submit" className={styles.submitBtn} style={{ background: form.color }}>
                                {editingHabit ? 'Save Changes' : 'Create Habit'}
                            </button>
                        </form>
                        <button className={styles.closeModalBtn} onClick={() => setShowCreateModal(false)}>✕</button>
                    </div>
                </div>
            )}

            {/* ── Log Time Modal ── */}
            {logTimeHabit && (
                <LogTimeModal
                    habit={logTimeHabit}
                    onClose={() => setLogTimeHabit(null)}
                    onLogManual={handleLogTime}
                    onStartTimer={handleTimerStart}
                />
            )}

            {/* ── Floating Active Timer Bar ── */}
            {activeTimer && (() => {
                const h = habits.find(hab => hab._id === activeTimer.habitId);
                if (!h) return null;
                return (
                    <div className={styles.activeTimerBar} style={{ borderColor: h.color }}>
                        <div className={styles.atInfo}>
                            <div className={styles.atIcon} style={{ background: `${h.color}33`, borderColor: h.color }}>{h.emoji}</div>
                            <div className={styles.atName}>{h.name}</div>
                        </div>
                        <div className={styles.atTime} style={{ color: h.color }}>
                            <span className={styles.atStatusIcon}>{activeTimer.running ? (activeTimer.type === 'countdown' ? '⏳' : '⏱') : '⏸'}</span>
                            {formatTimerDisp()}
                        </div>
                        <div className={styles.atActions}>
                            <button className={styles.atBtn} onClick={toggleTimer} title={activeTimer.running ? 'Pause' : 'Resume'}>
                                {activeTimer.running ? '⏸' : '▶'}
                            </button>
                            <button className={styles.atBtnLog} onClick={finishTimerAndLog} style={{ background: h.color }} title="Stop & Log Time">
                                ⏹ Log
                            </button>
                            <button className={styles.atBtnCancel} onClick={cancelTimer} title="Cancel without saving">✕</button>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
