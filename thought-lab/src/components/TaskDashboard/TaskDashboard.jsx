import React, { useState, useEffect } from 'react';
import { getAllTasks, bidOnTask } from '../../http';
import { useAuth } from '../../Context/auth'; // Import useAuth
import toast from 'react-hot-toast';
import './TaskDashboard.css';

const TaskDashboard = () => {
  const [auth] = useAuth(); // Restore auth hook
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('OPEN'); // OPEN, ASSIGNED, COMPLETED
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Get current user ID from local storage
    const authData = localStorage.getItem('auth');
    if (authData) {
      const { user } = JSON.parse(authData);
      setUserId(user._id);
    }
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data } = await getAllTasks();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    if (auth?.user) {
      console.log("Auth User:", auth.user);
    }
  }, [auth]);

  useEffect(() => {
    console.log("Tasks:", tasks);
  }, [tasks]);

  const handleBid = async (taskId) => {
    try {
      const { data } = await bidOnTask(taskId);
      if (data.success) {
        toast.success('Bid placed successfully!');
        fetchTasks();
      }
    } catch (error) {
      console.error('Error bidding on task:', error);
      toast.error(error.response?.data?.message || 'Failed to place bid');
    }
  };

  const getFilteredTasks = () => {
    // Available Tasks (Open)
    const availableTasks = tasks.filter(task => task.status === 'OPEN');

    // My Active Tasks
    const currentUserId = auth?.user?.id || auth?.user?._id; // Use a local variable to avoid confusion with state userId
    const myTasks = tasks.filter(task =>
      task.assignedTo?._id === currentUserId && task.status === 'ASSIGNED'
    );

    // History
    const historyTasks = tasks.filter(task =>
      task.assignedTo?._id === currentUserId &&
      (task.status === 'COMPLETED' || task.status === 'FAILED')
    );

    if (filter === 'OPEN') {
      return availableTasks;
    } else if (filter === 'MY_TASKS') {
      return myTasks;
    } else if (filter === 'COMPLETED') { // Assuming 'COMPLETED' filter should show historyTasks
      return historyTasks;
    }
    return [];
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div className="task-dashboard-container">
      <header className="dashboard-header">
        <h1>Task Dashboard</h1>
        <p>Bid on tasks to earn points and climb the leaderboard!</p>
      </header>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${filter === 'OPEN' ? 'active' : ''}`}
          onClick={() => setFilter('OPEN')}
        >
          Available Tasks
        </button>
        <button
          className={`tab-btn ${filter === 'MY_TASKS' ? 'active' : ''}`}
          onClick={() => setFilter('MY_TASKS')}
        >
          My Active Tasks
        </button>
        <button
          className={`tab-btn ${filter === 'COMPLETED' ? 'active' : ''}`}
          onClick={() => setFilter('COMPLETED')}
        >
          Completed History
        </button>
      </div>

      <div className="tasks-grid">
        {loading ? (
          <div className="loading-state">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks found in this category.</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task._id} className="task-card">
              <div className="task-header">
                <h3>{task.title}</h3>
                <span className="reward-badge">+{task.scoreReward} pts</span>
              </div>

              <p className="task-description">{task.description}</p>

              <div className="task-details">
                <div className="detail-item">
                  <span className="label">Deadline:</span>
                  <span className="value">{new Date(task.deadline).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Penalty:</span>
                  <span className="value">-{task.scorePenalty} pts</span>
                </div>
                {task.status === 'OPEN' && (
                  <div className="detail-item">
                    <span className="label">Bidders:</span>
                    <span className="value">{task.bidders.length}</span>
                  </div>
                )}
              </div>

              <div className="task-actions">
                {filter === 'OPEN' && (
                  <button
                    className={`btn-bid ${task.bidders.some(b => b._id === userId) ? 'bid-placed' : ''}`}
                    onClick={() => handleBid(task._id)}
                    disabled={task.bidders.some(b => b._id === userId)}
                  >
                    {task.bidders.some(b => b._id === userId) ? 'Bid Placed ✅' : 'Bid Now ✋'}
                  </button>
                )}

                {filter === 'MY_TASKS' && (
                  <div className="status-message">
                    Assigned to you! Good luck.
                  </div>
                )}

                {filter === 'COMPLETED' && (
                  <div className="status-message success">
                    Completed on {new Date(task.completedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskDashboard;