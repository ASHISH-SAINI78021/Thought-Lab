import React, { useState, useEffect } from "react";
import styles from './AdminPanel.module.css';
import Card from "../../Card/Card";


const AdminPanel = () => {
  return (
    <div>
      <div>
      <p style={{ fontSize: "1.5rem" , margin : "1rem" , color: "rgb(21, 118, 255)" }}>Dashboard</p>
      </div>
      <div className={styles.cards}>
        <Card content="Total Page Views" number="7,45,236" text="59.6%"  />
        <Card content="Total Users" number="78,250
" text="70.5%"  />
        <Card content="Total Registerations" number="18,800
" text="27.4%"  />
      </div>
    </div>
  );
};

export default AdminPanel;
