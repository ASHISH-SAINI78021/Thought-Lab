import React, { useState, useEffect, useMemo } from 'react';
import styles from './SystemTasks.module.css';
import { useAuth } from '../../../Context/auth';
import { url } from '../../../url';
import { toast } from 'react-hot-toast';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const MENTORS_PER_PAGE = 5;
const STUDENTS_PER_PAGE = 5;

const CIRCLE_RADIUS = 36;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

// Custom chart tooltip
const ChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className={styles.chartTooltip}>
                <p className={styles.tooltipLabel}>{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color, margin: '2px 0' }}>
                        {p.name}: <strong>{p.value}</strong>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Mini circular progress ring
const ProgressRing = ({ rate }) => (
    <div className={styles.graphContainer}>
        <svg width="80" height="80">
            <defs>
                <linearGradient id="pgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#0ea5e9" />
                </linearGradient>
            </defs>
            <circle cx="40" cy="40" r={CIRCLE_RADIUS} className={styles.circleBackground} />
            <circle
                cx="40" cy="40" r={CIRCLE_RADIUS}
                className={styles.circleProgress}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '40px 40px' }}
                strokeDasharray={CIRCLE_CIRCUMFERENCE}
                strokeDashoffset={CIRCLE_CIRCUMFERENCE - (rate / 100) * CIRCLE_CIRCUMFERENCE}
            />
        </svg>
        <div className={styles.graphLabel}>{rate}%</div>
    </div>
);

// Student row — loads habits + consistency chart on expand
const StudentRow = ({ student, token, role }) => {
    const [expanded, setExpanded] = useState(false);
    const [habits, setHabits] = useState(null);
    const [consistency, setConsistency] = useState([]);
    const [loading, setLoading] = useState(false);

    const toggleExpand = async () => {
        if (!expanded && habits === null) {
            setLoading(true);
            try {
                const pathPrefix = (role === 'admin' || role === 'superAdmin') ? 'admin' : 'mentor';
                const [habitsRes, consistencyRes] = await Promise.all([
                    fetch(`${url}/${pathPrefix}/students/${student._id}/habits`, {
                        headers: { Authorization: token }
                    }),
                    fetch(`${url}/mentor/students/${student._id}/consistency`, {
                        headers: { Authorization: token }
                    })
                ]);
                const habitsData = await habitsRes.json();
                const consistencyData = await consistencyRes.json();

                setHabits(habitsData.success ? habitsData.habits : []);
                if (consistencyData.success) setConsistency(consistencyData.data);
            } catch {
                toast.error('Failed to fetch student data');
                setHabits([]);
            } finally {
                setLoading(false);
            }
        }
        setExpanded(prev => !prev);
    };

    const todayStr = new Date().toISOString().split('T')[0];
    const doneToday = habits ? habits.filter(h => h.completions.includes(todayStr)).length : 0;
    const total = habits ? habits.length : 0;
    const rate = total === 0 ? 0 : Math.round((doneToday / total) * 100);

    const fmtMins = (m) => {
        if (!m) return '0m';
        const h = Math.floor(m / 60), min = m % 60;
        return h > 0 ? `${h}h${min > 0 ? ` ${min}m` : ''}` : `${min}m`;
    };

    return (
        <div className={styles.studentCard}>
            <div className={styles.studentHeader}>
                <div className={styles.studentMeta}>
                    <h4>{student.name}</h4>
                    <span className={styles.smallLabel}>Roll: {student.rollNumber}</span>
                </div>
                <button className={styles.openTasksBtn} onClick={toggleExpand}>
                    {loading ? 'Loading…' : expanded ? 'Collapse' : 'Assess Progress'}
                </button>
            </div>

            {expanded && (
                <div className={styles.expandedStudentArea}>
                    {habits === null || loading ? (
                        <p className={styles.emptyNote}>Loading data…</p>
                    ) : (
                        <>
                            {/* ── Today's Ring Stats ── */}
                            <div className={styles.statsWidget}>
                                <ProgressRing rate={rate} />
                                <div className={styles.statsText}>
                                    <h5>Today's Habit Score</h5>
                                    <p>{doneToday}/{total} habits completed today</p>
                                </div>
                            </div>

                            {/* ── 7-Day Consistency Bar Chart ── */}
                            {consistency.length > 0 && (
                                <div className={styles.chartWrap}>
                                    <p className={styles.chartTitle}>📊 7-Day Consistency</p>
                                    <ResponsiveContainer width="100%" height={150}>
                                        <BarChart
                                            data={consistency}
                                            margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fontSize: 9, fill: '#94a3b8' }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 9, fill: '#94a3b8' }}
                                                axisLine={false}
                                                tickLine={false}
                                                allowDecimals={false}
                                            />
                                            <Tooltip content={<ChartTooltip />} />
                                            <Bar dataKey="total" name="Created" fill="#c7d2fe" radius={[3, 3, 0, 0]} />
                                            <Bar dataKey="completed" name="Completed" fill="#6366f1" radius={[3, 3, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* ── Habit List ── */}
                            {habits.length === 0 ? (
                                <p className={styles.emptyNote}>No habits created yet.</p>
                            ) : (
                                <div className={styles.taskList}>
                                    {habits.map(habit => {
                                        const isDoneToday = habit.completions.includes(todayStr);
                                        const todayMins = habit.timeLogs?.find(l => l.date === todayStr)?.minutes || 0;

                                        return (
                                            <div key={habit._id} className={styles.taskItem} style={{ borderLeftColor: habit.color || '#6366f1' }}>
                                                <div className={styles.taskHeader}>
                                                    <strong>{habit.emoji} {habit.name}</strong>
                                                    <span className={styles.taskBadge} style={{
                                                        backgroundColor: isDoneToday ? (habit.color + '22') : '#f1f5f9',
                                                        color: isDoneToday ? habit.color : '#64748b',
                                                        borderColor: isDoneToday ? habit.color : 'transparent',
                                                        border: isDoneToday ? '1px solid' : 'none'
                                                    }}>
                                                        {isDoneToday ? (habit.habitType === 'time' ? `Logging: ${fmtMins(todayMins)}` : 'Completed ✓') : 'Pending'}
                                                    </span>
                                                </div>
                                                <p className={styles.taskDesc}>
                                                    Streak: <strong>{habit.completions.length} days total</strong>
                                                    {habit.habitType === 'time' && ` • Total Time: ${fmtMins(habit.timeLogs?.reduce((acc, l) => acc + l.minutes, 0))}`}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

// Mentor card with student list + pagination
const MentorCard = ({ mentor, token }) => {
    const [expanded, setExpanded] = useState(false);
    const [page, setPage] = useState(1);
    const [searchStudent, setSearchStudent] = useState('');

    const filtered = useMemo(() => {
        const q = searchStudent.toLowerCase();
        return q
            ? mentor.assignedStudents.filter(s => s.name.toLowerCase().includes(q) || (s.rollNumber && String(s.rollNumber).includes(q)))
            : mentor.assignedStudents;
    }, [mentor.assignedStudents, searchStudent]);

    const totalPages = Math.ceil(filtered.length / STUDENTS_PER_PAGE);
    const paginated = filtered.slice((page - 1) * STUDENTS_PER_PAGE, page * STUDENTS_PER_PAGE);

    return (
        <div className={styles.mentorCard}>
            <div className={styles.mentorHeader}>
                <div className={styles.mentorInfo}>
                    <h3>{mentor.name}</h3>
                    <span className={styles.badge}>{mentor.assignedStudents.length} Students Assigned</span>
                </div>
                <button className={styles.expandBtn} onClick={() => setExpanded(e => !e)}>
                    {expanded ? '▲ Close Portfolio' : '▼ View Portfolio'}
                </button>
            </div>

            {expanded && (
                <div className={styles.studentsBlock}>
                    <div className={styles.searchRow}>
                        <input
                            className={styles.searchInput}
                            type="text"
                            placeholder="Search student by name or roll…"
                            value={searchStudent}
                            onChange={e => { setSearchStudent(e.target.value); setPage(1); }}
                        />
                        <span className={styles.smallLabel}>{filtered.length} matching</span>
                    </div>

                    {paginated.length === 0 ? (
                        <p className={styles.emptyNote}>No students match your search.</p>
                    ) : (
                        <div className={styles.studentsGrid}>
                            {paginated.map(s => (
                                <StudentRow key={s._id} student={s} token={token} role={mentor.role || 'mentor'} />
                            ))}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className={styles.pagination}>
                            <button className={styles.pageBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
                            <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
                            <button className={styles.pageBtn} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Root component
const SystemTasks = () => {
    const [auth] = useAuth();
    const [hierarchy, setHierarchy] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mentorSearch, setMentorSearch] = useState('');
    const [mentorPage, setMentorPage] = useState(1);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch(`${url}/users`, {
                    headers: { Authorization: auth?.token }
                });
                const data = await res.json();
                if (data.success && data.users) {
                    const mentors = data.users.filter(u => u.role === 'mentor');
                    const students = data.users.filter(u => u.role === 'student' || u.role === 'user');
                    setHierarchy(mentors.map(m => ({
                        ...m,
                        assignedStudents: students.filter(s => String(s.mentorId) === String(m._id))
                    })));
                }
            } catch {
                toast.error('Failed to load mentors');
            } finally {
                setLoading(false);
            }
        };

        if (auth?.token) fetchUsers();
    }, [auth?.token]);

    const filteredMentors = useMemo(() => {
        const q = mentorSearch.toLowerCase();
        return q ? hierarchy.filter(m => m.name.toLowerCase().includes(q)) : hierarchy;
    }, [hierarchy, mentorSearch]);

    const totalMentorPages = Math.ceil(filteredMentors.length / MENTORS_PER_PAGE);
    const paginatedMentors = filteredMentors.slice((mentorPage - 1) * MENTORS_PER_PAGE, mentorPage * MENTORS_PER_PAGE);

    if (loading) return <div className={styles.container}><p>Loading mentorship data…</p></div>;

    return (
        <div className={styles.container}>
            <div className={styles.pageHeader}>
                <h2 className={styles.title}>Habit Monitoring System</h2>
                <p className={styles.subtitle}>Track live habit progress, streaks, and consistency graphs for all students.</p>
            </div>

            <div className={styles.topBar}>
                <input
                    className={styles.searchInput}
                    type="text"
                    placeholder="Search mentor by name…"
                    value={mentorSearch}
                    onChange={e => { setMentorSearch(e.target.value); setMentorPage(1); }}
                />
                <span className={styles.smallLabel}>{filteredMentors.length} mentor(s) found</span>
            </div>

            {paginatedMentors.map(mentor => (
                <MentorCard key={mentor._id} mentor={mentor} token={auth?.token} />
            ))}

            {totalMentorPages > 1 && (
                <div className={styles.pagination}>
                    <button className={styles.pageBtn} disabled={mentorPage === 1} onClick={() => setMentorPage(p => p - 1)}>Previous</button>
                    <span className={styles.pageInfo}>Mentors: Page {mentorPage} of {totalMentorPages}</span>
                    <button className={styles.pageBtn} disabled={mentorPage === totalMentorPages} onClick={() => setMentorPage(p => p + 1)}>Next</button>
                </div>
            )}
        </div>
    );
};

export default SystemTasks;
