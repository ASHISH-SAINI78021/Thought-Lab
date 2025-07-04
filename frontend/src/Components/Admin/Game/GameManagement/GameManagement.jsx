import React, { useState, useEffect } from 'react';
import { 
  FullscreenOutlined, 
  FullscreenExitOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './GameManagement.module.css';
import GameForm from '../GameForm/GameForm';
import { url } from "../../../../url";

const GameManagement = () => {
  const [games, setGames] = useState([]);
  const [editingGame, setEditingGame] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch games from API
  useEffect(() => {
    const fetchGames = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${url}/all-games`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setGames(data?.data);
      } catch (error) {
        console.error('Error fetching games:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGames();
  }, []);

  // Create a new game
  const handleCreate = async (gameData) => {
    try {
      const response = await fetch(`${url}/create-game`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(gameData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create game');
      }
      
      const newGame = await response.json();
      setGames(prevGames => [...prevGames, newGame?.data]);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating game:', error);
      setError(error.message);
    }
  };

  // Update an existing game
  const handleUpdate = async (gameData) => {
    try {
      const response = await fetch(`${url}/update-game/${editingGame._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(gameData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update game');
      }
      
      const updatedGame = await response.json();
      setGames(prevGames => 
        prevGames.map(game => 
          game._id === updatedGame._id ? updatedGame : game
        )
      );
      setEditingGame(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error updating game:', error);
      setError(error.message);
    }
  };

  // Delete a game
  const handleDelete = async (gameId) => {
    if (!window.confirm('Are you sure you want to delete this game?')) {
      return;
    }
    
    try {
      const response = await fetch(`${url}/delete-game/${gameId}`, { 
        method: 'DELETE' 
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete game');
      }
      
      setGames(prevGames => prevGames.filter(game => game._id !== gameId));
    } catch (error) {
      console.error('Error deleting game:', error);
      setError(error.message);
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading games...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={`${styles.title} ${styles.bold}`}>Games Management</h1>
        <div className={styles.actions}>
          <button 
            className={styles.actionButton}
            onClick={() => {
              setEditingGame(null);
              setShowForm(true);
            }}
          >
            <FullscreenOutlined className={styles.icon} />
            <span>Create New Game</span>
          </button>
          <button 
            className={styles.actionButton}
            onClick={() => window.location.reload()}
          >
            <FullscreenExitOutlined className={styles.icon} />
            <span>Refresh Games</span>
          </button>
        </div>
      </div>

      {showForm && (
        <GameForm 
          onSubmit={editingGame ? handleUpdate : handleCreate}
          initialData={editingGame || {}}
          onCancel={() => {
            setEditingGame(null);
            setShowForm(false);
          }}
        />
      )}

      <div className={styles.gamesGrid}>
        {games?.length === 0 ? (
          <div className={styles.noGames}>
            No games found. Create your first game!
          </div>
        ) : (
          games?.map(game => (
            <div key={game._id} className={styles.gameCard}>
              <div className={styles.gameHeader}>
                <h3>{game.name}</h3>
                <div className={styles.gameActions}>
                  <button 
                    onClick={() => {
                      setEditingGame(game);
                      setShowForm(true);
                    }}
                    className={styles.editButton}
                    aria-label="Edit game"
                  >
                    <EditOutlined />
                  </button>
                  <button 
                    onClick={() => handleDelete(game._id)}
                    className={styles.deleteButton}
                    aria-label="Delete game"
                  >
                    <DeleteOutlined />
                  </button>
                </div>
              </div>
              <p className={styles.gameDescription}>{game.description}</p>
              <div className={styles.gameDetails}>
                <div className={styles.detailItem}>
                  <span>Prize:</span>
                  <span className={styles.prize}>${game.prize}</span>
                </div>
                <div className={styles.detailItem}>
                  <span>Form Link:</span>
                  <a 
                    href={game.formLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.formLink}
                  >
                    Open Form
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GameManagement;