import React, { useRef } from 'react';
import styles from './LevelUpCard.module.css';
import html2canvas from 'html2canvas';

const STAGE_MAP = {
    seed: '🌱',
    sprout: '🪴',
    plant: '🌳',
};

const LevelUpCard = ({ focusPet, userName, onClose }) => {
    const cardRef = useRef(null);

    const handleDownload = async () => {
        if (!cardRef.current) return;

        // Add snapshot attribute to fix rendering bugs during capture
        cardRef.current.setAttribute('data-snapshot', 'true');

        // Small delay to ensure styles apply
        await new Promise(r => setTimeout(r, 100));

        const canvas = await html2canvas(cardRef.current, {
            backgroundColor: null,
            scale: 3,
            useCORS: true,
            logging: false,
        });

        cardRef.current.removeAttribute('data-snapshot');

        const link = document.createElement('a');
        link.download = `zen-pet-level-${focusPet.level}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>

                {/* Downloadable Card */}
                <div ref={cardRef} className={styles.card}>
                    <div className={styles.cardBg} />
                    <div className={styles.cardOrb1} />
                    <div className={styles.cardOrb2} />

                    <div className={styles.cardInner}>
                        <p className={styles.platform}>Thought Lab · RTU Kota</p>
                        <div className={styles.petIcon}>{STAGE_MAP[focusPet.petType] || '🌱'}</div>
                        <h2 className={styles.levelUpText}>LEVEL UP!</h2>
                        <div className={styles.levelBadge}>Level {focusPet.level}</div>
                        <p className={styles.userName}>{userName || 'Zen Student'}</p>
                        <p className={styles.subText}>Your Focus Pet has grown stronger.<br />Keep meditating & reading to reach new heights.</p>
                        <div className={styles.xpBar}>
                            <div className={styles.xpFill} style={{ width: `${((focusPet.xp) / (focusPet.level * 50)) * 100}%` }} />
                        </div>
                        <p className={styles.xpLabel}>{focusPet.xp} / {focusPet.level * 50} XP to next level</p>
                        <p className={styles.cardFooter}>🌿 Focus Pet Achievement</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className={styles.actions}>
                    <button className={styles.downloadBtn} onClick={handleDownload}>
                        ⬇ Download Card
                    </button>
                    <button className={styles.closeBtn} onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LevelUpCard;
