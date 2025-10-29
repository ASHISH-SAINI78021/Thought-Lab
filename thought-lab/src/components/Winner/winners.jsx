import React, { useEffect, useState } from "react";
import { Trophy, Award, Star } from "lucide-react";
import styles from "./winner.module.css";

const Winners = () => {
  const [groupedWinners, setGroupedWinners] = useState({});

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("winners")) || [];

    // Group winners by event name
    const grouped = saved.reduce((acc, winner) => {
      const eventName = winner.event.trim();
      if (!acc[eventName]) acc[eventName] = [];
      acc[eventName].push(winner);
      return acc;
    }, {});

    // ✅ Sort winners by position (ascending) inside each event
    Object.keys(grouped).forEach((event) => {
      grouped[event].sort((a, b) => {
        const posOrder = { "1": 1, "2": 2, "3": 3, "1st": 1, "2nd": 2, "3rd": 3 };
        const pa = posOrder[a.position?.toString().toLowerCase()] || Number(a.position) || 999;
        const pb = posOrder[b.position?.toString().toLowerCase()] || Number(b.position) || 999;
        return pa - pb;
      });
    });

    setGroupedWinners(grouped);
  }, []);

  const eventNames = Object.keys(groupedWinners);

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.trophyIconWrapper}>
          <Trophy className={styles.trophyIcon} strokeWidth={2.5} />
        </div>
        <h1 className={styles.mainTitle}>Event Winners</h1>
        <p className={styles.subtitle}>Celebrating Excellence and Achievement</p>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {eventNames.length === 0 ? (
          <div className={styles.emptyState}>
            <Award className={styles.emptyIcon} />
            <p className={styles.emptyText}>No winners uploaded yet.</p>
            <p className={styles.emptySubtext}>Check back soon for the list of champions!</p>
          </div>
        ) : (
          <div className={styles.eventsWrapper}>
            {eventNames.map((eventName) => (
              <div key={eventName} className={styles.eventSection}>
                {/* Event Title */}
                <div className={styles.eventTitleWrapper}>
                  <Star className={styles.eventStarIcon} fill="#f59e0b" />
                  <h2 className={styles.eventTitle}>{eventName}</h2>
                </div>

                {/* Winners Grid */}
                <div className={styles.winnersGrid}>
                  {groupedWinners[eventName].map((w, index) => (
                    <div key={index} className={styles.winnerCard}>
                      <div className={styles.cardContent}>
                        {/* Photo with Trophy Badge */}
                        <div className={styles.photoWrapper}>
                          <div className={styles.photoCircle}>
                            <img
                              src={w.photo}
                              alt={w.name}
                              className={styles.photo}
                            />
                          </div>
                          
                        </div>

                        {/* Info */}
                        <div className={styles.infoSection}>
                          <h3 className={styles.winnerName}>{w.name}</h3>
                          <p className={styles.rollNo}>{w.rollNo}</p>
                          <p className={styles.branch}>{w.branch}</p>
                          {/* 🏅 Added Position Display */}
                          {w.position && (
                            <p className={styles.position}>
                              🏅 Position: <strong>{w.position}</strong>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className={styles.cardAccent}></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Winners;
