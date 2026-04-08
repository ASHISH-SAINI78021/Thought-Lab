import React, { useState, useEffect } from "react";
import styles from './AdminPanel.module.css';
import Card from "../../Card/Card";
import { toast } from 'react-hot-toast';
import { useAuth } from "../../../Context/auth";
import { url } from '../../../url'
import { socket } from "../../../App";


const AdminPanel = () => {
  const [users, setUsers] = useState();
  const [auth, setAuth] = useAuth();
  const [liveUsers, setLiveUsers] = useState({ count: 0, users: [] });
  const [events, setEvents] = useState(0);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    if (!socket) return;

    // Listen to updates
    // Listen to updates (receives { count: N, users: [...] })
    socket.on('active-users-update', (data) => {
      console.log('📡 Received active-users-update:', data);
      // Ensure data is in the correct format to prevent crashes
      if (data && typeof data === 'object' && Array.isArray(data.users)) {
        setLiveUsers(data);
      } else if (typeof data === 'number') {
        // Fallback for old broadcasts or simple count if ever used
        setLiveUsers(prev => ({ ...prev, count: data }));
      }
    });

    // Explicitly request the current count upon mounting
    socket.emit('get-active-users');

    return () => {
      socket.off('active-users-update');
    };
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        let response = await fetch(`${url}/all-users-count`, {
          headers: {
            Authorization: auth?.token
          }
        });
        if (response.ok) {
          response = await response.json();
          if (response.success) {
            setUsers(response.users);
          }
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }

    const init2 = async () => {
      try {
        let response = await fetch(`${url}/all-events-count`, {
          headers: {
            Authorization: auth?.token
          }
        });
        if (response.ok) {
          response = await response.json();
          if (response.success) {
            setEvents(response.events);
          }
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }

    const init3 = async () => {
      try {
        let response = await fetch(`${url}/dashboard/admin`, {
          headers: {
            Authorization: auth?.token
          }
        });
        if (response.ok) {
          response = await response.json();
          if (response.success) {
            setDashboardData(response.data);
          }
        }
      } catch (error) {
        console.log("Dashboard fetch error:", error);
      }
    };

    init();
    init2();
    if (auth?.token) {
      init3();
    }
  }, [auth?.token]);

  return (
    <div>
      <div>
        <p style={{ fontSize: "1.5rem", margin: "1rem", color: "rgb(21, 118, 255)" }}>Dashboard</p>
      </div>
      <div className={styles.cards}>
        <Card content="Total Events" number={events} text="59.6%" />
        <Card content="Total Users" number={users} text="70.5%" />
        <Card content="Total Live Users" number={liveUsers.count} text="Live Names" />
        {dashboardData && (
          <>
            <Card content="Total Mentors" number={dashboardData.totalMentors} text="Active" />
            <Card content="Tasks Completed" number={dashboardData.tasksCompletedToday} text="Today" />
            <Card content="Tasks Pending" number={dashboardData.tasksPending} text="System wide" />
          </>
        )}
      </div>

      {/* Mentor Listing Section */}
      {dashboardData && dashboardData.mentors && dashboardData.mentors.length > 0 && (
        <div className={styles.liveUsersList} style={{ marginTop: '2rem' }}>
          <h3 className={styles.listTitle}>Mentors Overview</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
            {dashboardData.mentors.map(mentor => (
              <div key={mentor._id} style={{ padding: '1rem', background: '#f7fafc', borderRadius: '8px', color: '#4a5568', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' }}>
                <div>
                  <strong style={{ fontSize: '1.2rem', color: '#1576ff' }}>{mentor.name}</strong> ({mentor.email})
                </div>
                <div style={{ color: mentor.studentCount >= 10 ? '#ef4444' : '#16a34a', background: mentor.studentCount >= 10 ? '#fee2e2' : '#dcfce7', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  {mentor.studentCount} / 10 Students
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live User Names List */}
      <div className={styles.liveUsersList}>
        <h3 className={styles.listTitle}>Currently Active</h3>
        <div className={styles.nameBadges}>
          {liveUsers?.users?.map((user, idx) => (
            <div key={idx} className={styles.nameBadge}>
              <span className={styles.statusDot}></span>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.userRoll}>{user.rollNumber !== 'N/A' ? `(${user.rollNumber})` : ''}</span>
            </div>
          ))}
          {(!liveUsers?.users || liveUsers.users.length === 0) && <p className={styles.emptyText}>No active users tracked</p>}
        </div>
      </div>

    </div>
  );
};

export default AdminPanel;
