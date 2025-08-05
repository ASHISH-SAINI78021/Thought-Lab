import React, { useState } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import styles from './GameForm.module.css';

const GameForm = ({ onSubmit, initialData, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    prize: initialData?.prize || '',
    formLink: initialData?.formLink || ''
  });

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

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalCard}>
        <div className={styles.modalHeader}>
          <h2>{initialData ? 'Edit Game' : 'Create New Game'}</h2>
          <button onClick={onCancel} className={styles.closeBtn}>
            <CloseOutlined />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Game Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter game name"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the game rules and objectives"
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Prize Amount</label>
              <div className={styles.currencyInput}>
                <span>$</span>
                <input
                  type="number"
                  name="prize"
                  value={formData.prize}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Form Link</label>
              <input
                type="url"
                name="formLink"
                value={formData.formLink}
                onChange={handleChange}
                placeholder="https://forms.google.com/..."
                required
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={onCancel}>
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