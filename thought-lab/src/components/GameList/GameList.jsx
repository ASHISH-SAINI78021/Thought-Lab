import React, { useEffect, useState } from 'react';
import styles from './GameList.module.css';
import { PlayCircleOutlined, TrophyOutlined, LinkOutlined } from '@ant-design/icons';
import { url } from '../../url';
import toast from 'react-hot-toast';

const GameList = () => {
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // Track mounted state
    const controller = new AbortController(); // For request cancellation

    const fetchGames = async () => {
      try {
        const response = await fetch(`${url}/all-games`, {
          signal: controller.signal
        });

        if (!isMounted) return; // Don't update if unmounted

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setGames(result.data || []);
        } else {
          toast.error(result.message || "Failed to load games");
        }
      } catch (error) {
        if (error.name !== 'AbortError') { // Ignore cancellation errors
          console.error('Fetch error:', error);
          toast.error(error.message || "Error loading games");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchGames();

    // Cleanup function
    return () => {
      isMounted = false;
      controller.abort(); // Cancel ongoing request
    };
  }, []);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading games...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Available Events</h2>
        <p className={styles.subtitle}>Join the competition and win amazing prizes</p>
      </div>

      {games.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No games available at the moment</p>
        </div>
      ) : (
        <div className={styles.gameGrid}>
          {games.map(game => (
            <div key={game._id} className={styles.gameCard}>
              <div className={styles.cardHeader}>
                <PlayCircleOutlined className={styles.gameIcon} />
                <h3 className={styles.gameTitle}>{game.name}</h3>
              </div>
              
              <p className={styles.gameDescription}>{game.description}</p>
              
              <div className={styles.gameDetails}>
                <div className={styles.detailItem}>
                  <TrophyOutlined className={styles.detailIcon} />
                  <span className={styles.prize}>${game.prize}</span>
                </div>
                
                <div className={styles.detailItem}>
                  <LinkOutlined className={styles.detailIcon} />
                  <a 
                    href={game.formLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.formLink}
                  >
                    Join Event
                  </a>
                </div>
              </div>
              
              <button 
                className={styles.joinButton} 
                onClick={() => window.open(game.formLink, '_blank')}
              >
                Participate Now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GameList;