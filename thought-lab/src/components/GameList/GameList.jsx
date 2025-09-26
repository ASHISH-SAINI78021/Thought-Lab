import React, { useEffect, useState } from 'react';
import styles from './GameList.module.css';
import { PlayCircleOutlined, TrophyOutlined, LinkOutlined } from '@ant-design/icons';
// import { url } from '../../url'; // Removed
import toast from 'react-hot-toast';
// Import the Axios API function
import { getAllGames } from '../../http'; 

const GameList = () => {
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Axios requests don't require manual AbortController for basic component cleanup
    // If you needed to cancel on dependency changes, you'd use Axios's CancelToken or AbortController passed via config.
    const fetchGames = async () => {
      try {
        setIsLoading(true); // Ensure loading is true on fetch start
        
        // --- AXIOS INTEGRATION ---
        // The getAllGames function uses api.get('/all-games')
        const response = await getAllGames(); 
        const result = response.data; // Axios wraps response body in 'data'

        if (result.success) {
          setGames(result.data || []);
        } else {
          // Handle cases where status is 200, but success: false
          toast.error(result.message || "Failed to load games");
        }
      } catch (error) {
        // Axios throws an error for network issues AND non-2xx status codes
        console.error('Axios error:', error);
        
        // Get the error message from the response body if available, otherwise use a generic message
        const errorMessage = error.response?.data?.message || error.message || "Error loading games";
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();

    // Cleanup function (no Axios cancellation needed for this simple case)
    return () => {
      // Clean up if necessary, but not strictly needed for this GET request
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