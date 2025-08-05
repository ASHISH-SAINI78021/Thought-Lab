import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Unauthorized.module.css';

const Unauthorized = () => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.status}>403</h1>
        <h2 className={styles.message}>Unauthorized Access</h2>
        <p className={styles.description}>
          You do not have permission to view this page.
        </p>
        <Link to="/" className={styles.homeButton}>Go to Home</Link>
      </div>
    </div>
  );
};

export default Unauthorized;
