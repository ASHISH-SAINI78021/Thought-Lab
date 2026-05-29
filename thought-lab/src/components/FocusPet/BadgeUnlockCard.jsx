import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import styles from './BadgeUnlockCard.module.css';

const BADGE_COLORS = {
    first_steps: { bg: 'linear-gradient(135deg,#f6d365,#fda085)', glow: 'rgba(253,160,133,0.5)' },
    zen_seeker: { bg: 'linear-gradient(135deg,#a18cd1,#fbc2eb)', glow: 'rgba(161,140,209,0.5)' },
    garden_master: { bg: 'linear-gradient(135deg,#11998e,#38ef7d)', glow: 'rgba(56,239,125,0.5)' },
    blog_maven: { bg: 'linear-gradient(135deg,#4facfe,#00f2fe)', glow: 'rgba(79,172,254,0.5)' },
    meditation_monk: { bg: 'linear-gradient(135deg,#f093fb,#f5576c)', glow: 'rgba(245,87,108,0.5)' },
};

const BadgeUnlockCard = ({ badge, onClose }) => {
    const cardRef = useRef(null);
    const colors = BADGE_COLORS[badge.id] || { bg: 'linear-gradient(135deg,#667eea,#764ba2)', glow: 'rgba(100,100,255,0.4)' };
    const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const handleDownload = async () => {
        if (!cardRef.current) return;

        cardRef.current.setAttribute('data-snapshot', 'true');
        await new Promise(r => setTimeout(r, 100));

        const canvas = await html2canvas(cardRef.current, {
            backgroundColor: null,
            scale: 3,
            useCORS: true,
            logging: false,
        });

        cardRef.current.removeAttribute('data-snapshot');

        const link = document.createElement('a');
        link.download = `badge-unlocked-${badge.id}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>

                <div className={styles.celebration}>
                    <span className={styles.confetti}>🎉</span>
                    <h2 className={styles.modalTitle}>Achievement Unlocked!</h2>
                    <p className={styles.modalSub}>You've earned a new badge for your dedication.</p>
                </div>

                <div ref={cardRef} className={styles.badgeCard} style={{ '--badge-bg': colors.bg, '--badge-glow': colors.glow }}>
                    <div className={styles.badgeCardBg} />
                    <div className={styles.badgeIcon}>{badge.icon}</div>
                    <h3 className={styles.badgeName}>{badge.name}</h3>

                    <div className={styles.badgeSignificance}>
                        <span className={styles.significanceLabel}>Significance</span>
                        <p className={styles.badgeDesc}>{badge.description}</p>
                    </div>

                    <span className={styles.badgeDate}>Earned {date}</span>
                    <div className={styles.badgeFooter}>Thought Lab · RTU Kota</div>
                </div>

                <div className={styles.actions}>
                    <button className={styles.downloadBtn} onClick={handleDownload}>
                        ⬇ Download Badge
                    </button>
                    <button className={styles.closeBtn} onClick={onClose}>
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BadgeUnlockCard;
