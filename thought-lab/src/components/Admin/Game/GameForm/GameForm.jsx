import React, { useState, useRef } from 'react'; // 1. Import useRef
import { CloseOutlined } from '@ant-design/icons';
import styles from './GameForm.module.css';
import { useNavigate } from 'react-router-dom';

// The component no longer needs onCancel or onClose from the parent.
const GameForm = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    prize: initialData?.prize || '',
    formLink: initialData?.formLink || ''
  });
  const navigate = useNavigate();

  // 2. Create a ref to attach to the main div
  const modalRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (typeof onSubmit === 'function') {
      onSubmit(formData);
    }
  };

  // 3. This is the new, self-contained close function
  // It directly hides the component from the screen.
  const handleClose = () => {
    if (modalRef.current) {
      modalRef.current.style.display = 'none';
      // navigate("/admin");
    }
  };

  return (
    // 4. Attach the ref to the component's root element
    <div className={styles.modalBackdrop} ref={modalRef}> 
      <div className={styles.modalCard}>
        <div className={styles.modalHeader}>
          <h2>{initialData ? 'Edit Game' : 'Create New Game'}</h2>
          
          {/* This button now calls the internal handleClose function */}
          <button onClick={handleClose} className={styles.closeBtn}>
            <CloseOutlined />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Form fields remain the same */}
          <div className={styles.formGroup}>
            <label>Game Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter game name" required />
          </div>
          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Describe the game rules and objectives" required />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Prize Amount</label>
              <div className={styles.currencyInput}>
                <span>$</span>
                <input type="number" name="prize" value={formData.prize} onChange={handleChange} min="0" step="0.01" placeholder="0.00" required />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Form Link</label>
              <input type="url" name="formLink" value={formData.formLink} onChange={handleChange} placeholder="https://forms.google.com/..." required />
            </div>
          </div>
          
          <div className={styles.formActions}>
            {/* This button also calls the same internal handleClose function */}
            <button type="button" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className={styles.primaryBtn}>
              {initialData ? 'Save Changes' : 'Create Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GameForm;