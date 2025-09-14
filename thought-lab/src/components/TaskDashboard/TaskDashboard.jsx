// TaskBoard.js
import React, { useState } from 'react';
import './TaskDashboard.css';

const TaskDashboard = () => {
  // Sample data - replace with your API data
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Design Homepage', description: 'Create responsive homepage design', score: 15, assignedTo: 1, status: 'completed', assigneeName: 'John Doe', dueDate: '2023-06-15', completedDate: '2023-06-14' },
    { id: 2, title: 'API Integration', description: 'Connect frontend to backend API', score: 20, assignedTo: 2, status: 'in-progress', assigneeName: 'Jane Smith', dueDate: '2023-06-20' },
    { id: 3, title: 'Database Optimization', description: 'Improve query performance', score: 25, assignedTo: 3, status: 'pending', assigneeName: 'Mike Johnson', dueDate: '2023-06-25' },
    { id: 4, title: 'User Authentication', description: 'Implement login/logout functionality', score: 18, assignedTo: 1, status: 'in-progress', assigneeName: 'John Doe', dueDate: '2023-06-18' },
    { id: 5, title: 'Mobile Responsiveness', description: 'Ensure app works on all devices', score: 22, assignedTo: 2, status: 'completed', assigneeName: 'Jane Smith', dueDate: '2023-06-10', completedDate: '2023-06-09' },
    { id: 6, title: 'Testing Suite', description: 'Write unit tests for all components', score: 30, assignedTo: 3, status: 'rejected', assigneeName: 'Mike Johnson', dueDate: '2023-06-12', completedDate: '2023-06-11', rejectionReason: 'Incomplete test coverage' },
  ]);

  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const rejectedTasks = tasks.filter(task => task.status === 'rejected').length;
  
  const totalScore = tasks.reduce((sum, task) => sum + task.score, 0);
  const completedScore = tasks
    .filter(task => task.status === 'completed')
    .reduce((sum, task) => sum + task.score, 0);

  // Filter tasks based on selected filter
  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === filter);

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'dueDate') {
      return new Date(a.dueDate) - new Date(b.dueDate);
    } else if (sortBy === 'score') {
      return b.score - a.score;
    } else if (sortBy === 'assignee') {
      return a.assigneeName.localeCompare(b.assigneeName);
    }
    return 0;
  });

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { class: 'status-pending', text: 'Pending' },
      'in-progress': { class: 'status-progress', text: 'In Progress' },
      'completed': { class: 'status-completed', text: 'Completed' },
      'rejected': { class: 'status-rejected', text: 'Rejected' },
    };
    
    const config = statusConfig[status] || { class: 'status-pending', text: 'Pending' };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  return (
    <div className="task-board">
      <header className="board-header">
        <h1>Team Task Board</h1>
        <p>Transparent view of all tasks across the team</p>
      </header>

      <div className="board-stats">
        <div className="stat-card">
          <div className="stat-value">{totalTasks}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{completedTasks}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{inProgressTasks}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{pendingTasks}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{rejectedTasks}</div>
          <div className="stat-label">Rejected</div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-value">{completedScore}/{totalScore}</div>
          <div className="stat-label">Points Earned/Total</div>
        </div>
      </div>

      <div className="board-controls">
        <div className="filter-group">
          <label>Filter by status:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="sort-group">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="dueDate">Due Date</option>
            <option value="score">Score</option>
            <option value="assignee">Assignee</option>
          </select>
        </div>
      </div>

      <div className="tasks-container">
        <div className="tasks-grid">
          {sortedTasks.map(task => (
            <div key={task.id} className="task-card">
              <div className="task-header">
                <h3>{task.title}</h3>
                <div className="task-score">{task.score} points</div>
              </div>
              
              <p className="task-description">{task.description}</p>
              
              <div className="task-meta">
                <div className="meta-item">
                  <span className="meta-label">Assigned to:</span>
                  <span className="meta-value">{task.assigneeName}</span>
                </div>
                
                <div className="meta-item">
                  <span className="meta-label">Due:</span>
                  <span className="meta-value">{formatDate(task.dueDate)}</span>
                </div>
                
                <div className="meta-item">
                  <span className="meta-label">Status:</span>
                  <span className="meta-value">{getStatusBadge(task.status)}</span>
                </div>
                
                {task.completedDate && (
                  <div className="meta-item">
                    <span className="meta-label">Completed:</span>
                    <span className="meta-value">{formatDate(task.completedDate)}</span>
                  </div>
                )}
                
                {task.rejectionReason && (
                  <div className="meta-item">
                    <span className="meta-label">Rejection Reason:</span>
                    <span className="meta-value">{task.rejectionReason}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {sortedTasks.length === 0 && (
        <div className="no-tasks">
          <p>No tasks found with the selected filter.</p>
        </div>
      )}
    </div>
  );
};

export default TaskDashboard;