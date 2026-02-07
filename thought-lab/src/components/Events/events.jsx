import React, { useState, useEffect } from "react";
import styles from "./events.module.css";
import { Link } from "react-router-dom";
import eventsData from "./Data/eventsData";
import Spline from "@splinetool/react-spline";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  // Load events data
  useEffect(() => {
    setEvents(eventsData);
  }, []);

  // Detect mobile vs desktop
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile(); // initial check
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className={styles.eventsContainer}>
      {/* 🔮 Spline Animation Background */}
      <div className={styles.splineBackground}>
        <Spline
          scene={
            isMobile
              ? "https://prod.spline.design/V4qVQ3AGGJjryrRF/scene.splinecode" // mobile scene
              : "https://prod.spline.design/VYQQL18jWGjIZ5Xo/scene.splinecode" // desktop scene
          }
        />
      </div>

      {/* 🔼 Foreground Content */}
      <section className={styles.eventsContent}>
      
        <div className={styles.eventList}>
          {events.map((event) => (
            <div className={styles.eventCard} key={event._id}>
              <img
                src={event.banner}
                alt={event.name}
                className={styles.bannerImage}
                onError={(e) => {
                  e.target.src = "/placeholder-image.jpg";
                }}
              />
              <div className={styles.details}>
                <h2>{event.name}</h2>
                <p className={styles.description}>
                  {event.description?.slice(0, 200)}...
                </p>
                <p className={styles.date}>{new Date(event.date).toLocaleDateString()}</p>
                <p className={styles.registerLink}>
                  <Link to={`/events/${event._id}`}>Click Here to register!</Link>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Events;
