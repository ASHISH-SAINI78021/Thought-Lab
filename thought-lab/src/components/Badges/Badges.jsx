import React, { useEffect, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import styles from './Badges.module.css';
import { url } from '../../url';
import { useAuth } from '../../Context/auth';
import { useNavigate, useParams } from 'react-router-dom';

const BADGE_COLORS = {
    first_steps: { bg: 'linear-gradient(135deg,#f6d365,#fda085)', glow: 'rgba(253,160,133,0.5)' },
    zen_seeker: { bg: 'linear-gradient(135deg,#a18cd1,#fbc2eb)', glow: 'rgba(161,140,209,0.5)' },
    garden_master: { bg: 'linear-gradient(135deg,#11998e,#38ef7d)', glow: 'rgba(56,239,125,0.5)' },
    blog_maven: { bg: 'linear-gradient(135deg,#4facfe,#00f2fe)', glow: 'rgba(79,172,254,0.5)' },
    meditation_monk: { bg: 'linear-gradient(135deg,#f093fb,#f5576c)', glow: 'rgba(245,87,108,0.5)' },
};

const ALL_BADGE_DEFINITIONS = [
    { id: 'first_steps', name: 'First Steps', icon: '🐣', description: 'Awarded for nurturing your Focus Pet to Level 2 Mastery' },
    { id: 'zen_seeker', name: 'Zen Seeker', icon: '🧘', description: 'Awarded for reaching Level 5 Enlightenment through mindfulness' },
    { id: 'garden_master', name: 'Garden Master', icon: '🌳', description: 'Awarded for Level 10 Zenith – A master of your internal garden' },
    { id: 'blog_maven', name: 'Blog Maven', icon: '📖', description: 'Awarded for wisdom gained through reading 5 educational blogs' },
    { id: 'meditation_monk', name: 'Meditation Monk', icon: '🙏', description: 'Awarded for deep focus and persistence in 10 meditation sessions' },
];

const BadgeCard = ({ badge, isLocked }) => {
    const cardRef = useRef(null);
    const colors = BADGE_COLORS[badge.id] || { bg: 'linear-gradient(135deg,#667eea,#764ba2)', glow: 'rgba(100,100,255,0.4)' };
    const date = badge.earnedAt ? new Date(badge.earnedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null;

    const handleDownload = async () => {
        if (!cardRef.current || isLocked) return;
        const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 3, useCORS: true });
        const link = document.createElement('a');
        link.download = `badge-${badge.id}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    return (
        <div className={`${styles.badgeWrapper} ${isLocked ? styles.locked : ''}`}>
            {isLocked && <div className={styles.lockOverlay}>🔒 Locked</div>}
            <div ref={cardRef} className={styles.badgeCard} style={{ '--badge-bg': colors.bg, '--badge-glow': colors.glow }}>
                <div className={styles.badgeCardBg} />
                <div className={styles.badgeIcon}>{badge.icon}</div>
                <h3 className={styles.badgeName}>{badge.name}</h3>
                <div className={styles.badgeSignificance}>
                    <span className={styles.significanceLabel}>Significance</span>
                    <p className={styles.badgeDesc}>{badge.description}</p>
                </div>
                <span className={styles.badgeDate}>{isLocked ? 'Not yet earned' : `Earned ${date}`}</span>
                <div className={styles.badgeFooter}>Thought Lab · RTU Kota</div>
            </div>
            {!isLocked && (
                <button className={styles.downloadBadgeBtn} onClick={handleDownload}>
                    ⬇ Download
                </button>
            )}
            {isLocked && (
                <div className={styles.lockedHint}>Keep pushing to unlock!</div>
            )}
        </div>
    );
};

const Badges = () => {
    const [userName, setUserName] = useState('');
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [auth] = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        if (!auth?.token) { navigate('/login'); return; }
        const fetchBadges = async () => {
            try {
                const endpoint = id ? `${url}/user/badges/${id}` : `${url}/user/badges/me`;
                const res = await fetch(endpoint, {
                    headers: { Authorization: auth.token }
                });
                const data = await res.json();
                if (data.success) {
                    setBadges(data.badges || []);
                    setUserName(data.name || '');
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchBadges();
    }, [auth?.token, id]);

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <p className={styles.eyebrow}>{id ? `${userName}'s Achievements` : 'Your Achievements'}</p>
                <h1 className={styles.title}>🏅 Badges</h1>
                <p className={styles.subtitle}>
                    {id ? `Celebrating the growth and focus of ${userName}.` : 'Earn badges by growing your Focus Pet through meditation and reading!'}
                </p>
            </div>

            {loading ? (
                <div className={styles.skeletonGrid}>
                    {[1, 2, 3].map(i => <div key={i} className={styles.skeleton} />)}
                </div>
            ) : badges.length === 0 ? (
                <div className={styles.empty}>
                    <span>🌱</span>
                    <p>No badges yet! Start meditating or reading blogs to grow your Focus Pet and earn your first badge.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {ALL_BADGE_DEFINITIONS.map(badgeDef => {
                        const earnedBadge = badges.find(b => b.id === badgeDef.id);
                        return (
                            <BadgeCard
                                key={badgeDef.id}
                                badge={earnedBadge || badgeDef}
                                isLocked={!earnedBadge}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Badges;
