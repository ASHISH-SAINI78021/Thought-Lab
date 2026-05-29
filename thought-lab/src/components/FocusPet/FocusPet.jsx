import React, { useState, useEffect } from 'react';
import styles from './FocusPet.module.css';

const FocusPet = ({ petData }) => {
    if (!petData) return null;

    const { level, xp, petType } = petData;
    const maxXP = level * 50;
    const progress = (xp / maxXP) * 100;

    // A mapping to get an emoji/icon base on pet type
    const getPetIcon = () => {
        switch (petType) {
            case 'seed': return '🌱';
            case 'sprout': return '🪴';
            case 'plant': return '🌳';
            default: return '🌱';
        }
    };

    return (
        <div className={styles.petContainer}>
            <div className={styles.petAvatar}>
                {getPetIcon()}
            </div>
            <div className={styles.petInfo}>
                <span className={styles.levelText}>Lv. {level} Zen Pet</span>
                <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
                </div>
                <span className={styles.xpText}>{xp} / {maxXP} XP</span>
            </div>
        </div>
    );
};

export default FocusPet;
