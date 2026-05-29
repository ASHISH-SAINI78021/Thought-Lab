import React, { useEffect, useState } from 'react';
import styles from './PetLeaderboard.module.css';
import { url } from '../../url';
import { socket } from '../../App';

const PET_ICON = { seed: '🌱', sprout: '🪴', plant: '🌳' };
const RANKS = ['🥇', '🥈', '🥉', '4', '5'];

const PetLeaderboard = () => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleUpdate = (data) => {
            console.log("🔥 Pet Leaderboard Live Update:", data);
            setLeaders(data);
        };

        if (socket) {
            socket.on('pet-leaderboard-update', handleUpdate);
        }

        const fetchLeaders = async () => {
            try {
                const res = await fetch(`${url}/users/pet-leaderboard`);
                const data = await res.json();
                if (data.success) setLeaders(data.leaders);
            } catch (e) { }
            finally { setLoading(false); }
        };
        fetchLeaders();

        return () => {
            if (socket) socket.off('pet-leaderboard-update', handleUpdate);
        };
    }, []);

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <p className={styles.eyebrow}>🌿 Zen Growth</p>
                <h2 className={styles.title}>Focus Pet Leaderboard</h2>
                <p className={styles.subtitle}>Top students growing their zen pets through mindfulness</p>
            </div>

            <div className={styles.list}>
                {loading ? (
                    [1, 2, 3, 4, 5].map(i => <div key={i} className={styles.skeletonRow} />)
                ) : leaders.length === 0 ? (
                    <p className={styles.empty}>No pet data yet. Start meditating!</p>
                ) : (
                    leaders.map((leader, i) => (
                        <div key={i} className={`${styles.row} ${i === 0 ? styles.topRow : ''}`}>
                            <span className={styles.rank}>{RANKS[i] || i + 1}</span>
                            <div className={styles.avatar}>
                                {leader.profilePicture
                                    ? <img src={leader.profilePicture.startsWith('http') ? leader.profilePicture : `${url}/${leader.profilePicture}`} alt={leader.name} />
                                    : <span>{(leader.name || 'A').charAt(0)}</span>
                                }
                            </div>
                            <div className={styles.info}>
                                <span className={styles.name}>{leader.name}</span>
                                <span className={styles.rollNo}>{leader.rollNumber}</span>
                            </div>
                            <div className={styles.petInfo}>
                                <span className={styles.petEmoji}>{PET_ICON[leader.focusPet?.petType] || '🌱'}</span>
                                <span className={styles.petLevel}>Lv. {leader.focusPet?.level || 1}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
};

export default PetLeaderboard;
