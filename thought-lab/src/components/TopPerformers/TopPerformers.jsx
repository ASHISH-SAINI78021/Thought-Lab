import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { socket } from '../../App';
import styles from './TopPerformers.module.css';
import SpotlightCard from '../react-bits/SpotlightCard';
import { url } from '../../url';

const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';

const MEDALS = [
    { rank: 1, label: '🥇', color: '#FFD700', glow: 'rgba(255, 215, 0, 0.45)', podiumHeight: '170px', order: 1 },
    { rank: 2, label: '🥈', color: '#C0C0C0', glow: 'rgba(192, 192, 192, 0.35)', podiumHeight: '130px', order: 0 },
    { rank: 3, label: '🥉', color: '#CD7F32', glow: 'rgba(205, 127, 50, 0.35)', podiumHeight: '100px', order: 2 },
];

const getProfileImage = (path) => {
    if (!path) return FALLBACK_AVATAR;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${url}/${cleanPath}`;
};

const PerformerCard = ({ item, medal }) => {
    if (!item) return (
        <div className={styles.emptyCard} style={{ '--podium-h': medal.podiumHeight, '--order': medal.order }}>
            <div className={styles.avatarShell}>
                <span className={styles.medal}>{medal.label}</span>
                <div className={styles.emptyAvatar}><i className="fas fa-user" /></div>
            </div>
            <div className={styles.podium} style={{ height: medal.podiumHeight }}>
                <span className={styles.rankNum}>#{medal.rank}</span>
            </div>
        </div>
    );

    return (
        <SpotlightCard
            as={Link}
            to={`/leaderboard/${item.user?._id}`}
            className={styles.card}
            spotlightColor={medal.glow}
            style={{ '--glow': medal.glow, '--medal-color': medal.color, '--podium-h': medal.podiumHeight, '--order': medal.order }}
        >
            <div className={styles.avatarShell}>
                <span className={styles.medal}>{medal.label}</span>
                <div className={styles.avatarRing} style={{ borderColor: medal.color }}>
                    <img
                        src={getProfileImage(item.user?.profilePicture)}
                        alt={item.user?.name}
                        className={styles.avatar}
                        onError={e => { e.target.src = FALLBACK_AVATAR; }}
                    />
                </div>
            </div>
            <div className={styles.nameBlock}>
                <p className={styles.name}>{item.user?.name || 'Student'}</p>
                <p className={styles.roll}>{item.user?.rollNumber || '—'}</p>
            </div>
            <div className={styles.podium} style={{ height: medal.podiumHeight, boxShadow: `0 -4px 20px ${medal.glow}` }}>
                <span className={styles.rankNum}>#{medal.rank}</span>
                <span className={styles.score}>{item.score} <small>pts</small></span>
            </div>
        </SpotlightCard>
    );
};

const TopPerformers = () => {
    const [top3, setTop3] = useState([null, null, null]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        socket.emit('get-initial-leaderboard');

        const handleData = (leaderboard) => {
            const sorted = [...leaderboard].sort((a, b) => b.score - a.score).slice(0, 3);
            setTop3([sorted[0] || null, sorted[1] || null, sorted[2] || null]);
            setLoading(false);
        };

        socket.on('leaderboard-data', handleData);
        socket.on('leaderboard-update', handleData);

        const timeout = setTimeout(() => setLoading(false), 8000);

        return () => {
            socket.off('leaderboard-data', handleData);
            socket.off('leaderboard-update', handleData);
            clearTimeout(timeout);
        };
    }, []);

    // Display order: 2nd, 1st, 3rd (podium style)
    const displayOrder = [top3[1], top3[0], top3[2]];
    const medalsOrder = [MEDALS[1], MEDALS[0], MEDALS[2]];

    return (
        <section className={styles.section}>
            {/* Decorative background orbs */}
            <div className={styles.orb1} />
            <div className={styles.orb2} />

            <div className={styles.header}>
                <p className={styles.eyebrow}>Hall of Fame</p>
                <h2 className={styles.title}>Top Performers</h2>
                <p className={styles.subtitle}>Celebrating the dedication and hard work of our star members</p>
            </div>

            {loading ? (
                <div className={styles.skeleton}>
                    {[0, 1, 2].map(i => <div key={i} className={styles.skeletonCard} />)}
                </div>
            ) : (
                <div className={styles.podiumWrap}>
                    {displayOrder.map((item, i) => (
                        <PerformerCard key={i} item={item} medal={medalsOrder[i]} />
                    ))}
                </div>
            )}

            <Link to="/leaderboard" className={styles.viewAll}>
                View Full Leaderboard <i className="fas fa-arrow-right" />
            </Link>
        </section>
    );
};

export default TopPerformers;
