import React, { useState, useEffect } from 'react';
import styles from './MentorPicker.module.css';
import { useAuth } from '../../../Context/auth';
import { url } from '../../../url';
import { toast } from 'react-hot-toast';

const MAX_STUDENTS = 5;

export default function MentorPicker({ onAssigned }) {
    const [auth, setAuth] = useAuth();
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selecting, setSelecting] = useState(null); // mentorId being submitted

    useEffect(() => {
        const fetchMentors = async () => {
            try {
                const res = await fetch(`${url}/mentors/available`, {
                    headers: { Authorization: auth?.token }
                });
                const d = await res.json();
                if (d.success) setMentors(d.mentors);
            } catch {
                toast.error('Failed to load mentors. Please refresh.');
            } finally {
                setLoading(false);
            }
        };
        if (auth?.token) fetchMentors();
    }, [auth?.token]);

    const handleSelect = async (mentorId) => {
        setSelecting(mentorId);
        try {
            const res = await fetch(`${url}/student/request-mentor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: auth?.token
                },
                body: JSON.stringify({ mentorId })
            });
            const d = await res.json();
            if (d.success) {
                toast.success(d.message);
                // Update auth context + localStorage so mentorId is persisted
                const updatedAuth = {
                    ...auth,
                    user: { ...auth.user, mentorId: d.user.mentorId }
                };
                setAuth(updatedAuth);
                localStorage.setItem('auth', JSON.stringify(updatedAuth));
                onAssigned?.();
            } else {
                toast.error(d.message);
                // Refresh list to show updated capacities
                const res2 = await fetch(`${url}/mentors/available`, {
                    headers: { Authorization: auth?.token }
                });
                const d2 = await res2.json();
                if (d2.success) setMentors(d2.mentors);
            }
        } catch {
            toast.error('Something went wrong. Try again.');
        } finally {
            setSelecting(null);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <div className={styles.heroBadge}>🎓 Student Portal</div>
                <h1 className={styles.heroTitle}>Choose Your Mentor</h1>
                <p className={styles.heroSub}>
                    You need a mentor before accessing the Student Portal.<br />
                    Select one from the list below — each mentor can guide up to <strong>{MAX_STUDENTS} students</strong>.
                </p>
            </div>

            {loading ? (
                <div className={styles.loadingWrap}>
                    <div className={styles.spinner} />
                    <p>Loading mentors…</p>
                </div>
            ) : mentors.length === 0 ? (
                <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>🔍</span>
                    <p>No mentors are available right now. Contact your admin.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {mentors.map(mentor => {
                        const isFull = mentor.isFull;
                        const isSelecting = selecting === mentor._id;
                        const fillPct = (mentor.studentCount / MAX_STUDENTS) * 100;

                        return (
                            <div
                                key={mentor._id}
                                className={`${styles.card} ${isFull ? styles.cardFull : ''}`}
                            >
                                {isFull && <div className={styles.fullRibbon}>FULL</div>}

                                <div className={styles.cardTop}>
                                    <div className={styles.avatar}>
                                        {mentor.name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div className={styles.mentorInfo}>
                                        <h3 className={styles.mentorName}>{mentor.name}</h3>
                                        {mentor.branch && (
                                            <span className={styles.branch}>{mentor.branch}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Capacity bar */}
                                <div className={styles.capacityWrap}>
                                    <div className={styles.capacityHeader}>
                                        <span className={styles.capacityLabel}>Team capacity</span>
                                        <span className={`${styles.capacityCount} ${isFull ? styles.capacityFull : ''}`}>
                                            {mentor.studentCount}/{MAX_STUDENTS}
                                        </span>
                                    </div>
                                    <div className={styles.barTrack}>
                                        <div
                                            className={styles.barFill}
                                            style={{
                                                width: `${fillPct}%`,
                                                background: isFull
                                                    ? 'linear-gradient(90deg,#ef4444,#dc2626)'
                                                    : fillPct >= 70
                                                        ? 'linear-gradient(90deg,#f59e0b,#d97706)'
                                                        : 'linear-gradient(90deg,#22c55e,#16a34a)'
                                            }}
                                        />
                                    </div>
                                    {!isFull && (
                                        <span className={styles.spotsLeft}>
                                            {mentor.spotsLeft} spot{mentor.spotsLeft !== 1 ? 's' : ''} left
                                        </span>
                                    )}
                                </div>

                                <button
                                    className={`${styles.selectBtn} ${isFull ? styles.selectBtnDisabled : ''}`}
                                    disabled={isFull || !!selecting}
                                    onClick={() => handleSelect(mentor._id)}
                                >
                                    {isSelecting ? (
                                        <span className={styles.btnSpinner} />
                                    ) : isFull ? (
                                        '🔒 Team Full'
                                    ) : (
                                        '✋ Join This Mentor'
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
