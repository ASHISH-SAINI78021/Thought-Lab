// AppointmentForm.jsx
import { useState } from 'react';
import styles from './AppointmentForm.module.css';
import {url} from '../../url';
import { useAuth } from '../../Context/auth';

const AppointmentForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    concerns: '',
    sessionType: 'General Counselling' // Added session type
  });

  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [auth, setAuth] = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare payload with proper date format
      const payload = {
        ...formData,
        preferredDate: formData.preferredDate ? new Date(formData.preferredDate).toISOString() : null
      };

      console.log('Submitting:', payload); // Debug log

      const response = await fetch(`${url}/counsellor/create-appointment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization : auth?.token
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Response:', response.status, data); // Debug log

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      setSubmitted(true);
    } catch (error) {
      console.error('Submission error:', error);
      setError(error.message || 'Failed to submit appointment. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.successContent}>
          <div className={styles.lotusIcon}>🌸</div>
          <h2>Your Spiritual Journey Begins</h2>
          <p>Thank you for your appointment request, {formData.name}.</p>
          <p>Mam will review your request and you'll receive a confirmation email shortly.</p>
          <div className={styles.peaceSymbol}>☮</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.mandala}></div>
        <h1>Thought Lab Counseling</h1>
        <p>Find your inner peace through spiritual guidance</p>
      </div>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        <div className={styles.inputGroup}>
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />
          <span className={styles.focusBorder}></span>
        </div>

        <div className={styles.inputGroup}>
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
          <span className={styles.focusBorder}></span>
        </div>

        <div className={styles.inputGroup}>
          <label>Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            required
          />
          <span className={styles.focusBorder}></span>
        </div>

        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <label>Preferred Date</label>
            <input
              type="date"
              name="preferredDate"
              value={formData.preferredDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Preferred Time</label>
            <input
              type="time"
              name="preferredTime"
              value={formData.preferredTime}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label>Session Type</label>
          <select 
            name="sessionType"
            value={formData.sessionType}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="General Counselling">General Counseling</option>
            <option value="Meditation Guidance">Meditation Guidance</option>
            <option value="Chakra Balancing">Chakra Balancing</option>
            <option value="Life Purpose">Life Purpose</option>
          </select>
          <span className={styles.focusBorder}></span>
        </div>

        <div className={styles.inputGroup}>
          <label>Your Spiritual Concerns</label>
          <textarea
            name="concerns"
            value={formData.concerns}
            onChange={handleChange}
            placeholder="Share what's on your heart and mind..."
            rows="5"
            required
          ></textarea>
          <span className={styles.focusBorder}></span>
        </div>

        <button 
          type="submit" 
          disabled={isLoading} 
          className={styles.submitButton}
        >
          {isLoading ? (
            <>
              <span className={styles.spinner}></span>
              Sending Your Request...
            </>
          ) : (
            'Request Spiritual Guidance'
          )}
        </button>
      </form>

      <div className={styles.footer}>
        <p>All sessions are confidential and conducted with compassion</p>
        <div className={styles.symbols}>
          <span>☯</span>
          <span>🕉</span>
          <span>♾️</span>
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;