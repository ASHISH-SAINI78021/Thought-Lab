import React, { useState, useEffect } from "react";
import styles from "./events.module.css";
import { Link } from "react-router-dom";
import eventsData from "./Data/eventsData";
import SplashCursor from "../react-bits/SplashCursor";

/* ─── Category color map ───────────────────────────────── */
const accentMap = {
  0: { color: "#00d4ff", glow: "rgba(0, 212, 255, 0.25)" },
  1: { color: "#a855f7", glow: "rgba(168, 85, 247, 0.25)" },
  2: { color: "#f472b6", glow: "rgba(244, 114, 182, 0.25)" },
  3: { color: "#34d399", glow: "rgba(52, 211, 153, 0.25)" },
};

/* ─── Event Card ───────────────────────────────────────── */
const EventCard = ({ event, index }) => {
  const accent = accentMap[index % 4];

  return (
    <div
      className={styles.eventCard}
      style={{ "--accent": accent.color, "--glow": accent.glow, "--i": index }}
    >
      {/* Banner */}
      <div className={styles.cardBanner}>
        <img
          src={event.banner}
          alt={event.name}
          className={styles.bannerImg}
          onError={(e) => { e.target.src = "/placeholder-image.jpg"; }}
        />
        <div className={styles.bannerOverlay} />
        <span className={styles.datePill}>
          {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      </div>

      {/* Body */}
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{event.name}</h3>
        <p className={styles.cardExcerpt}>{event.description?.slice(0, 160)}…</p>

        <div className={styles.cardFooter}>
          <Link to={`/events/${event._id}`} className={styles.viewBtn}>
            Explore Event <span>→</span>
          </Link>
          {event.registrationLink && (
            <a
              href={event.registrationLink}
              className={styles.registerBtn}
              target="_blank"
              rel="noopener noreferrer"
            >
              Register
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ───────────────────────────────────── */
const Events = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => { setEvents(eventsData); }, []);

  return (
    <div className={styles.page}>
      <SplashCursor />

      {/* Hero */}
      <div className={styles.hero}>
        <span className={styles.heroEyebrow}>Thought Lab × NIT Kurukshetra</span>
        <h1 className={styles.heroTitle}>
          Upcoming <span>Events</span>
        </h1>
        <p className={styles.heroSub}>
          Discover workshops, competitions, and experiences crafted to ignite your curiosity and talent.
        </p>
        <div className={styles.heroDivider} />
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {events.map((event, i) => (
          <EventCard key={event._id} event={event} index={i} />
        ))}
      </div>
    </div>
  );
};

export default Events;
