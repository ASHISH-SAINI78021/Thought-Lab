import { useState, useEffect } from 'react';
import styles from './ApproveAppointment.module.css';
import { url } from "../../url";

const ApproveAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('Pending');
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${url}/counsellor/all-appointments?status=${filter}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch appointments');
        setAppointments(data.appointments || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [filter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const endpoint = newStatus === 'approved' 
        ? `${url}/counsellor/${id}/approve` 
        : `${url}/counsellor/${id}/reject`;
      
      const response = await fetch(endpoint, { method: 'PATCH' });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Action failed');
      
      setAppointments(prev => prev.map(appt => 
        appt._id === id ? { ...appt, status: newStatus } : appt
      ));
      
      setSelectedAppointment(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredAppointments = filter === 'all' 
    ? appointments 
    : appointments.filter(appt => appt.status === filter);

  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingAnimation}>
        <div className={styles.spinner}></div>
        <p>Loading appointments...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className={styles.errorContainer}>
      <div className={styles.errorCard}>
        <svg className={styles.errorIcon} viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <h3>Error Loading Data</h3>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className={styles.retryButton}
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className={styles.adminDashboard}>
      <header className={styles.dashboardHeader}>
        <h1>
          <span className={styles.icon}>📋</span>
          Appointment Dashboard
        </h1>
        <div className={styles.headerActions}>
          <span className={styles.stats}>
            {appointments.filter(a => a.status === 'Pending').length} pending
          </span>
          <button className={styles.refreshButton}>
            ↻ Refresh
          </button>
        </div>
      </header>

      <div className={styles.filterTabs}>
        {['Pending', 'Approved', 'Rejected', 'All'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab === 'All' ? 'all' : tab)}
            className={`${styles.tab} ${filter === (tab === 'All' ? 'all' : tab) ? styles.activeTab : ''}`}
          >
            {tab}
            {tab !== 'All' && (
              <span className={styles.tabBadge}>
                {appointments.filter(a => a.status === tab).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className={styles.appointmentsGrid}>
        {filteredAppointments.length === 0 ? (
          <div className={styles.emptyState}>
            <svg className={styles.emptyIcon} viewBox="0 0 24 24">
              <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
            </svg>
            <h3>No {filter === 'all' ? '' : filter} appointments found</h3>
            <p>When new requests come in, they'll appear here</p>
          </div>
        ) : (
          filteredAppointments.map(appointment => (
            <div 
              key={appointment._id} 
              className={`${styles.appointmentCard} ${styles[appointment.status]}`}
              onClick={() => setSelectedAppointment(appointment)}
            >
              <div className={styles.cardHeader}>
                <div className={styles.userAvatar}>
                  {appointment.name.charAt(0).toUpperCase()}
                </div>
                <div className={styles.userInfo}>
                  <h3>{appointment.name}</h3>
                  <p>{appointment.email}</p>
                </div>
                <span className={`${styles.statusBadge} ${styles[appointment.status]}`}>
                  {appointment.status}
                </span>
              </div>

              <div className={styles.cardDetails}>
                <div className={styles.detailItem}>
                  <svg className={styles.detailIcon} viewBox="0 0 24 24">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
                  </svg>
                  <span>{new Date(appointment.preferredDate).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className={styles.detailItem}>
                  <svg className={styles.detailIcon} viewBox="0 0 24 24">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                  <span>{appointment.preferredTime}</span>
                </div>
                <div className={styles.detailItem}>
                  <svg className={styles.detailIcon} viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                  </svg>
                  <span>{appointment.sessionType}</span>
                </div>
              </div>

              {appointment.status === 'Pending' && (
                <div className={styles.cardActions}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(appointment._id, 'approved');
                    }}
                    className={styles.actionButton}
                  >
                    Approve
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(appointment._id, 'rejected');
                    }}
                    className={`${styles.actionButton} ${styles.rejectAction}`}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {selectedAppointment && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button 
              onClick={() => setSelectedAppointment(null)}
              className={styles.closeButton}
            >
              &times;
            </button>
            <div className={styles.modalHeader}>
              <h2>{selectedAppointment.name}'s Session</h2>
              <span className={`${styles.modalStatus} ${styles[selectedAppointment.status]}`}>
                {selectedAppointment.status}
              </span>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.modalSection}>
                <h3>Contact Information</h3>
                <p><strong>Email:</strong> {selectedAppointment.email}</p>
                <p><strong>Phone:</strong> {selectedAppointment.phone}</p>
              </div>
              <div className={styles.modalSection}>
                <h3>Appointment Details</h3>
                <p>
                  <strong>When:</strong> {new Date(selectedAppointment.preferredDate).toLocaleDateString()} at {selectedAppointment.preferredTime}
                </p>
                <p><strong>Session Type:</strong> {selectedAppointment.sessionType}</p>
              </div>
              <div className={styles.modalSection}>
                <h3>Concerns</h3>
                <p className={styles.concernsText}>{selectedAppointment.concerns}</p>
              </div>
            </div>
            {selectedAppointment.status === 'Pending' && (
              <div className={styles.modalActions}>
                <button 
                  onClick={() => {
                    handleStatusChange(selectedAppointment._id, 'approved');
                    setSelectedAppointment(null);
                  }}
                  className={styles.modalApprove}
                >
                  Approve Session
                </button>
                <button 
                  onClick={() => {
                    handleStatusChange(selectedAppointment._id, 'rejected');
                    setSelectedAppointment(null);
                  }}
                  className={styles.modalReject}
                >
                  Reject Session
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproveAppointment;