import React, { useState, useEffect } from "react";
import styles from './AdminPanel.module.css';
import Card from "../../Card/Card";
import { toast } from 'react-hot-toast';
import { useAuth } from "../../../Context/auth";
import { url } from '../../../url'
import { socket } from "../../../App";
import { Search, RefreshCcw, User as UserIcon } from 'lucide-react';


const AdminPanel = () => {
  const [users, setUsers] = useState();
  const [auth, setAuth] = useAuth();
  const [liveUsers, setLiveUsers] = useState({ count: 0, users: [] });
  const [events, setEvents] = useState(0);
  const [dashboardData, setDashboardData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [targetUser, setTargetUser] = useState(null);
  const [searching, setSearching] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showResults, setShowResults] = useState(false);

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

    const init4 = async () => {
      if (auth?.user?.role !== 'superAdmin') return;
      try {
        const res = await fetch(`${url}/users`, {
          headers: { Authorization: auth?.token }
        });
        const data = await res.json();
        if (data.success) {
          setAllUsers(data.users || []);
        }
      } catch (error) {
        console.error("Error fetching all users for search:", error);
      }
    };

    init();
    init2();
    if (auth?.token) {
      init3();
      init4();
    }
  }, [auth?.token, auth?.user?.role]);

  // Live search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers([]);
      setShowResults(false);
      return;
    }
    const filtered = allUsers.filter(u =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 8); // Limit to top 8 results
    setFilteredUsers(filtered);
    setShowResults(true);
  }, [searchQuery, allUsers]);

  const handleSelectUser = (user) => {
    setTargetUser(user);
    setSearchQuery("");
    setShowResults(false);
  };

  const handleResetMeditation = async () => {
    if (!targetUser) return;
    if (!window.confirm(`Are you absolutely sure you want to RESET meditation history and leaderboard score for ${targetUser.name}? This cannot be undone.`)) return;

    setResetting(true);
    try {
      const res = await fetch(`${url}/admin/user/${targetUser._id || targetUser.id}/meditation`, {
        method: 'DELETE',
        headers: { Authorization: auth?.token }
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setTargetUser(null);
        setSearchQuery("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Reset failed");
    } finally {
      setResetting(false);
    }
  };

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

      {/* Super Admin Section */}
      {auth?.user?.role === 'superAdmin' && (
        <div className={styles.liveUsersList} style={{ marginTop: '2rem', border: '1px solid #fee2e2', background: '#fff' }}>
          <h3 className={styles.listTitle} style={{ color: '#ef4444' }}>Super Admin Tools</h3>
          <p style={{ padding: '0 1rem', fontSize: '0.9rem', color: '#666' }}>Reset meditation records and leaderboard scores.</p>

          <div style={{ padding: '1rem', position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
              <input
                type="text"
                placeholder="Search by name, roll no or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowResults(true)}
                style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.5rem', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }}
              />

              {showResults && filteredUsers.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: '8px', marginTop: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100, maxHeight: '300px', overflowY: 'auto' }}>
                  {filteredUsers.map(u => (
                    <div
                      key={u._id || u.id}
                      onClick={() => handleSelectUser(u)}
                      style={{ padding: '0.8rem 1rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.8rem' }}
                      onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.target.style.background = '#fff'}
                    >
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        {(u.name || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{u.name}</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.rollNumber} · {u.email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {targetUser && (
            <div style={{ margin: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px dotted #cbd5e1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserIcon size={20} color="#64748b" />
                  </div>
                  <div>
                    <p style={{ fontWeight: 'bold', margin: 0 }}>{targetUser.name}</p>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>{targetUser.rollNumber} · {targetUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleResetMeditation}
                  disabled={resetting}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: resetting ? 'not-allowed' : 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}
                >
                  <RefreshCcw size={16} className={resetting ? 'animate-spin' : ''} />
                  {resetting ? 'Resetting...' : 'Reset Meditation Data'}
                </button>
              </div>
            </div>
          )}
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
