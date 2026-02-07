import React, { useEffect, useState } from 'react';
import styles from './EventItem.module.css';
import { useParams } from 'react-router-dom';
import eventsData from "../Data/eventsData";

const EventItem = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const foundEvent = eventsData.find((ev) => String(ev._id) === String(id));
    setEvent(foundEvent);
  }, [id]);

  if (!event) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyIcon}>📭</div>
        <p>Event not found.</p>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {event.banner && (
          <div className={styles.bannerWrapper}>
            <img
  src={event.banner}
  alt={event.name}
  className={styles.bannerImage}
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = "/placeholder-image.jpg";
  }}
/>

            <div className={styles.bannerOverlay}></div>
          </div>
        )}

        <div className={styles.contentWrapper}>
          <div className={styles.header}>
            <div className={styles.dateBadge}>
              <span className={styles.dateText}>
                {new Date(event.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <h1 className={styles.title}>{event.name}</h1>
          </div>

          <div className={styles.content}>
            <div className={styles.descriptionLabel}>
              <span className={styles.labelIcon}>📋</span>
              <span>About This Event</span>
            </div>
            <p className={styles.description}>{event.description}</p>
          </div>

          <div className={styles.footer}>
            <a
              href={event.registrationLink || '#'}
              className={styles.registerBtn}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.btnText}>Register Now</span>
              <span className={styles.btnArrow}>→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventItem;
