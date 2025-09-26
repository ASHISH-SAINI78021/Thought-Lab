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
import { message } from 'antd';
import { useAuth } from "../../../../Context/auth";
import { 
  getAllGames, 
  createGame, 
  updateGame, 
  deleteGame 
} from "../../../../http"; // Import your API functions

const GameManagement = () => {
  const [games, setGames] = useState([]);
  const [editingGame, setEditingGame] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();

  // Fetch games from API
  useEffect(() => {
    const fetchGames = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getAllGames();
        setGames(response.data?.data || []);
      } catch (error) {
        console.error('Error fetching games:', error);
        
        // 401 errors are automatically handled by interceptor
        if (error.response?.status !== 401) {
          setError(error.response?.data?.message || 'Failed to fetch games');
          message.error('Failed to load games');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchGames();
  }, []);

  // Create a new game
  const handleCreate = async (gameData) => {
    try {
      setIsLoading(true);
      const response = await createGame(gameData);
      
      setGames(prevGames => [...prevGames, response.data?.data]);
      setShowForm(false);
      message.success('Game created successfully!');
    } catch (error) {
      console.error('Error creating game:', error);
      
      // 401 errors are automatically handled by interceptor
      if (error.response?.status !== 401) {
        setError(error.response?.data?.message || 'Failed to create game');
        message.error(error.response?.data?.message || 'Failed to create game');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing game
  const handleUpdate = async (gameData) => {
    try {
      setIsLoading(true);
      const response = await updateGame(editingGame._id, gameData);
      
      setGames(prevGames => 
        prevGames.map(game => 
          game._id === editingGame._id ? response.data?.data : game
        )
      );
      setEditingGame(null);
      setShowForm(false);
      message.success('Game updated successfully!');
    } catch (error) {
      console.error('Error updating game:', error);
      
      // 401 errors are automatically handled by interceptor
      if (error.response?.status !== 401) {
        setError(error.response?.data?.message || 'Failed to update game');
        message.error(error.response?.data?.message || 'Failed to update game');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a game
  const handleDelete = async (gameId) => {
    if (!window.confirm('Are you sure you want to delete this game?')) {
      return;
    }
    
    try {
      await deleteGame(gameId);
      
      setGames(prevGames => prevGames.filter(game => game._id !== gameId));
      message.success('Game deleted successfully!');
    } catch (error) {
      console.error('Error deleting game:', error);
      
      // 401 errors are automatically handled by interceptor
      if (error.response?.status !== 401) {
        message.error(error.response?.data?.message || 'Failed to delete game');
      }
    }
  };

  // Handle form submission
  const handleSubmit = (gameData) => {
    if (editingGame) {
      handleUpdate(gameData);
    } else {
      handleCreate(gameData);
    }
  };

  // Redirect to certificate (commented out as in original)
  // const handleGame = (game)=> {
  //   navigate(`/admin/certificate/${game._id}`, {
  //     state: {
  //       game: game.name,
  //       participant: {
  //         name: "John Doe",
  //         position: "1st Place",
  //         score: "100/100"
  //       },
  //       result: 'winner' // or 'participant'
  //     }
  //   });
  // }

  if (isLoading && games.length === 0) {
    return <div className={styles.loading}>Loading games...</div>;
  }

  if (error && games.length === 0) {
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
              setFormKey(prevKey => prevKey + 1);
            }}
            disabled={isLoading}
          >
            <FullscreenOutlined className={styles.icon} />
            <span style={{cursor: "pointer"}}> Create New Game</span>
          </button>
          <button 
            className={styles.actionButton}
            onClick={() => window.location.reload()}
            disabled={isLoading}
          >
            <FullscreenExitOutlined className={styles.icon} />
            <span style={{cursor: "pointer"}}> Refresh Games</span>
          </button>
        </div>
      </div>

      {showForm && (
        <GameForm 
          key={formKey}
          onSubmit={handleSubmit}
          initialData={editingGame || {}}
          isEditing={!!editingGame}
          loading={isLoading}
          onCancel={() => {
            setShowForm(false);
            setEditingGame(null);
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
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click event
                      setEditingGame(game);
                      setShowForm(true);
                      setFormKey(prevKey => prevKey + 1);
                    }}
                    className={styles.editButton}
                    aria-label="Edit game"
                    disabled={isLoading}
                  >
                    <EditOutlined />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click event
                      handleDelete(game._id);
                    }}
                    className={styles.deleteButton}
                    aria-label="Delete game"
                    disabled={isLoading}
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
                    onClick={(e) => e.stopPropagation()} // Prevent card click event
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