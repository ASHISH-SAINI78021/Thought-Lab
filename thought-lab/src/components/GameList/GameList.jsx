import React, { useEffect, useState } from 'react';
import styles from './GameList.module.css';
import { PlayCircleOutlined, TrophyOutlined, LinkOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';
import { getAllGames } from '../../http';
import SplashCursor from '../react-bits/SplashCursor';

/* ─── Accent cycle ─────────────────────── */
const accentMap = {
  0: { color: '#00d4ff', glow: 'rgba(0,212,255,0.25)' },
  1: { color: '#a855f7', glow: 'rgba(168,85,247,0.25)' },
  2: { color: '#f472b6', glow: 'rgba(244,114,182,0.25)' },
  3: { color: '#34d399', glow: 'rgba(52,211,153,0.25)' },
};

const GameList = () => {
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setIsLoading(true);
        const response = await getAllGames();
        const result = response.data;
        if (result.success) {
          setGames(result.data || []);
        } else {
          toast.error(result.message || 'Failed to load games');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Error loading games';
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGames();
  }, []);

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className={styles.page}>
        <SplashCursor />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p className={styles.loadingText}>Loading events…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <SplashCursor />

      {/* ── Hero ── */}
      <div className={styles.hero}>
        <span className={styles.heroEyebrow}>Thought Lab × NIT Kurukshetra</span>
        <h1 className={styles.heroTitle}>All <span>Events</span></h1>
        <p className={styles.heroSub}>
          Join the competition, showcase your talent, and win amazing prizes.
        </p>
        <div className={styles.heroDivider} />
      </div>

      {/* ── Grid ── */}
      {games.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🎮</div>
          <h3>No events available at the moment</h3>
          <p>Check back soon — something exciting is coming!</p>
        </div>
      ) : (
        <div className={styles.gameGrid}>
          {games.map((game, index) => {
            const accent = accentMap[index % 4];
            return (
              <div
                key={game._id}
                className={styles.gameCard}
                style={{ '--accent': accent.color, '--glow': accent.glow, '--i': index }}
              >
                {/* Icon + Title */}
                <div className={styles.cardHeader}>
                  <div className={styles.iconWrap}>
                    <PlayCircleOutlined />
                  </div>
                  <h3 className={styles.gameTitle}>{game.name}</h3>
                </div>

                <p className={styles.gameDescription}>{game.description}</p>

                {/* Details row */}
                <div className={styles.gameDetails}>
                  <div className={styles.detailItem}>
                    <TrophyOutlined className={styles.detailIcon} />
                    <span className={styles.prize}>₹{game.prize}</span>
                  </div>
                  <a
                    href={game.formLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.formLink}
                  >
                    <LinkOutlined /> View Details
                  </a>
                </div>

                <button
                  className={styles.joinButton}
                  onClick={() => window.open(game.formLink, '_blank')}
                >
                  Participate Now →
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GameList;