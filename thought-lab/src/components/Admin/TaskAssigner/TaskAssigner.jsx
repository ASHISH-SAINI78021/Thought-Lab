import React, { useState, useEffect } from 'react';
import {
  createTask,
  getAllTasks,
  assignTask,
  completeTask,
  failTask,
  deleteTask,
  getAllUsers
} from '../../../http';
import toast from 'react-hot-toast';
import UserSearch from './UserSearch';
import './TaskAssigner.css';

function TaskAssigner() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]); // New state for users
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    scoreReward: '',
    scorePenalty: '',
    deadline: ''
  });
  const [selectedBidder, setSelectedBidder] = useState(''); // New state
  const [assignEmail, setAssignEmail] = useState(''); // New state for email assignment

  const fetchData = async () => {
    try {
      setLoading(true);
      const usersResponse = await getAllUsers();
      if (usersResponse.data.success) {
        setUsers(usersResponse.data.users);
      }

      const tasksResponse = await getAllTasks();
      if (tasksResponse.data.success) {
        setTasks(tasksResponse.data.tasks);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await createTask(newTask);
      if (data.success) {
        toast.success('Task created successfully');
        setNewTask({ title: '', description: '', scoreReward: '', scorePenalty: '', deadline: '' });
        setShowTaskForm(false);
        fetchData(); // Changed to fetchData
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const [reassigningTasks, setReassigningTasks] = useState({});

  const toggleReassign = (taskId) => {
    setReassigningTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const handleAssign = async (taskId, userId, email = null) => {
    console.log("handleAssign called:", { taskId, userId, email });

    // Optimistic Update
    const assignedUser = users.find(u => u._id === userId);
    setTasks(prevTasks => prevTasks.map(t => {
      if (t._id === taskId) {
        return {
          ...t,
          status: 'ASSIGNED',
          assignedTo: assignedUser || { name: email || 'Assigned User', rollNumber: '...' }
        };
      }
      return t;
    }));

    // Hide reassign search if open
    if (reassigningTasks[taskId]) {
      toggleReassign(taskId);
    }

    try {
      const payload = userId ? { userId } : { email };
      console.log("Sending payload:", payload);
      const { data } = await assignTask(taskId, payload);
      if (data.success) {
        toast.success(data.message);
        // fetchData(); // Optional: Fetch to ensure consistency, but optimistic update handles UI
        // We can fetch silently?
        fetchData();
      }
    } catch (error) {
      console.error('Error assigning task:', error);
      toast.error(error.response?.data?.message || 'Failed to assign task');
      fetchData(); // Revert UI on error
    }
  };

  // ... (keep other handlers)



  const handleComplete = async (taskId) => {
    if (!window.confirm('Mark this task as completed? This will add points to user score.')) return;
    try {
      const { data } = await completeTask(taskId);
      if (data.success) {
        toast.success(data.message);
        fetchTasks();
      }
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    }
  };

  const handleFail = async (taskId) => {
    if (!window.confirm('Mark this task as failed? This will deduct points from user score.')) return;
    try {
      const { data } = await failTask(taskId);
      if (data.success) {
        toast.error(data.message);
        fetchTasks();
      }
    } catch (error) {
      console.error('Error failing task:', error);
      toast.error('Failed to mark task as failed');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const { data } = await deleteTask(taskId);
      if (data.success) {
        toast.success(data.message);
        setTasks(tasks.filter(t => t._id !== taskId));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  return (
    <div className="task-assigner-container">
      <div className="header-section">
        <h1>Task Delegation</h1>
        <button
          className="btn-primary"
          onClick={() => setShowTaskForm(!showTaskForm)}
        >
          {showTaskForm ? 'Cancel' : '+ New Task'}
        </button>
      </div>

      {showTaskForm && (
        <div className="task-form-card">
          <h3>Create New Task</h3>
          <form onSubmit={handleTaskSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
                placeholder="e.g. Update Documentation"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                required
                placeholder="Detailed description of the task..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Reward Points (+)</label>
                <input
                  type="number"
                  value={newTask.scoreReward}
                  onChange={(e) => setNewTask({ ...newTask, scoreReward: e.target.value })}
                  required
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Penalty Points (-)</label>
                <input
                  type="number"
                  value={newTask.scorePenalty}
                  onChange={(e) => setNewTask({ ...newTask, scorePenalty: e.target.value })}
                  required
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Deadline</label>
              <input
                type="date"
                value={newTask.deadline}
                onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn-submit">Create Task</button>
          </form>
        </div>
      )}

      <div className="tasks-grid">
        {loading ? (
          <p>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          tasks.map(task => (
            <div key={task._id} className={`task-card status-${task.status.toLowerCase()}`}>
              <div className="task-header">
                <h3>{task.title}</h3>
                <span className={`status-badge ${task.status.toLowerCase()}`}>{task.status}</span>
              </div>
              <p className="task-desc">{task.description}</p>

              <div className="task-meta">
                <span>🏆 +{task.scoreReward}</span>
                <span>⚠️ -{task.scorePenalty}</span>
                <span>📅 {new Date(task.deadline).toLocaleDateString()}</span>
              </div>

              {task.status === 'OPEN' && (
                <div className="bidders-section">
                  <h4>Bidders ({task.bidders.length})</h4>
                  {task.bidders.length > 0 ? (
                    <div className="bidders-list">
                      {task.bidders.map(bidder => (
                        <div key={bidder._id} className="bidder-item">
                          <span>{bidder.name} ({bidder.rollNumber})</span>
                          <button
                            className="btn-assign"
                            onClick={() => handleAssign(task._id, bidder._id)}
                          >
                            Assign
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-bidders">No bids yet</p>
                  )}

                  <div className="direct-assign-section">
                    <h4>Assign Student</h4>
                    <UserSearch
                      users={users}
                      onSelect={(user) => handleAssign(task._id, user._id)}
                    />
                  </div>
                </div>
              )}

              {task.status === 'ASSIGNED' && (
                <div className="assigned-section">
                  <div className="assigned-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <p style={{ margin: 0 }}><strong>Assigned to:</strong> {task.assignedTo?.name} ({task.assignedTo?.rollNumber})</p>
                    <button
                      className="btn-change-assignee"
                      onClick={() => toggleReassign(task._id)}
                      style={{ fontSize: '12px', padding: '4px 8px', cursor: 'pointer', background: '#e2e8f0', border: 'none', borderRadius: '4px', color: '#4a5568' }}
                    >
                      {reassigningTasks[task._id] ? 'Cancel' : 'Change'}
                    </button>
                  </div>

                  {reassigningTasks[task._id] && (
                    <div className="direct-assign-section" style={{ marginTop: '10px', marginBottom: '10px' }}>
                      <UserSearch
                        users={users}
                        onSelect={(user) => handleAssign(task._id, user._id)}
                      />
                    </div>
                  )}

                  <div className="action-buttons">
                    <button className="btn-complete" onClick={() => handleComplete(task._id)}>Mark Complete</button>
                    <button className="btn-fail" onClick={() => handleFail(task._id)}>Mark Failed</button>
                  </div>
                </div>
              )}

              <button className="btn-delete" onClick={() => handleDelete(task._id)}>Delete Task</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TaskAssigner;