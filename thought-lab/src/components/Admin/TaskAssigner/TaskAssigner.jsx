import React, { useState, useEffect } from 'react';
import './TaskAssigner.css';

// API base URL - adjust according to your backend URL
const API_BASE = 'http://localhost:5000/api';

function TaskAssigner() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    score: '',
    assignedTo: ''
  });

  // Fetch team members and tasks from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [membersResponse, tasksResponse] = await Promise.all([
          fetch(`${API_BASE}/team-members`),
          fetch(`${API_BASE}/tasks`)
        ]);
        
        const membersData = await membersResponse.json();
        const tasksData = await tasksResponse.json();
        
        setTeamMembers(membersData);
        setTasks(tasksData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });
      
      if (response.ok) {
        const createdTask = await response.json();
        setTasks([...tasks, createdTask]);
        setNewTask({ title: '', description: '', score: '', assignedTo: '' });
        setShowTaskForm(false);
      } else {
        console.error('Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const toggleTaskCompletion = async (taskId, currentStatus) => {
    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !currentStatus }),
      });
      
      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map(task => 
          task.id === taskId ? updatedTask : task
        ));
      } else {
        console.error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setTasks(tasks.filter(task => task.id !== taskId));
      } else {
        console.error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading">Loading data...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>Team Task Manager</h1>
        <p>Track tasks and scores for your team</p>
      </header>

      <div className="container">
        <div className="dashboard">
          <div className="dashboard-header">
            <h2>Team Dashboard</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowTaskForm(!showTaskForm)}
            >
              {showTaskForm ? 'Cancel' : 'Create New Task'}
            </button>
          </div>

          {showTaskForm && (
            <div className="task-form">
              <h3>Create New Task</h3>
              <form onSubmit={handleTaskSubmit}>
                <div className="form-group">
                  <label>Task Title</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Score Value</label>
                  <input
                    type="number"
                    value={newTask.score}
                    onChange={(e) => setNewTask({...newTask, score: e.target.value})}
                    min="1"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Assign To</label>
                  <select
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                    required
                  >
                    <option value="">Select Team Member</option>
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button type="submit" className="btn btn-primary">
                  Create Task
                </button>
              </form>
            </div>
          )}

          <div className="team-scores">
            <h3>Team Scores</h3>
            <div className="score-cards">
              {teamMembers.map(member => {
                const memberTasks = tasks.filter(task => task.assignedTo === member.id);
                const completedTasks = memberTasks.filter(task => task.completed);
                const score = completedTasks.reduce((total, task) => total + task.score, 0);
                
                return (
                  <div key={member.id} className="score-card">
                    <h4>{member.name}</h4>
                    <div className="score-value">{score} points</div>
                    <div className="task-count">{memberTasks.length} tasks</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="tasks-section">
            <h3>All Tasks</h3>
            <div className="tasks-list">
              {tasks.map(task => {
                const assignedTo = teamMembers.find(m => m.id === task.assignedTo);
                return (
                  <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
                    <div className="task-info">
                      <h4>{task.title}</h4>
                      <p>{task.description}</p>
                      <div className="task-meta">
                        <span className="task-score">{task.score} points</span>
                        <span className="task-assignee">Assigned to: {assignedTo ? assignedTo.name : 'Unknown'}</span>
                        <span className="task-status">{task.completed ? 'Completed' : 'Pending'}</span>
                      </div>
                    </div>
                    <div className="task-actions">
                      <button 
                        className={`btn ${task.completed ? 'btn-completed' : 'btn-incomplete'}`}
                        onClick={() => toggleTaskCompletion(task.id, task.completed)}
                      >
                        {task.completed ? 'Completed' : 'Mark Complete'}
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => deleteTask(task.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskAssigner;