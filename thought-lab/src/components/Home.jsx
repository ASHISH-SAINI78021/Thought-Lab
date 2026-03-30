import heroImage from "../assets/calm-women.png";
import styles from "./Home.module.css";
import "../styles/Home.css";
import { Link } from "react-router-dom";
import Features from "./Features";
import About from "./About";
import Testimonials from "./Testimonials";
import Footer from "./Footer/Footer";
import TopPerformers from "./TopPerformers/TopPerformers";

const Home = () => {
  return (
    <>
      <TopPerformers />

      <div className={styles.container}>
        {/* ── Hero ── */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            {/* Image side */}
            <div className={styles.heroImageContainer}>
              <img
                src={heroImage}
                className={styles.heroImage}
                alt="Calm Lady Breathing"
                loading="eager"
              />
            </div>

            {/* Text side */}
            <div className={styles.heroText}>
              <span className={styles.heroEyebrow}>Mental Wellness Platform</span>

              <h1 className={styles.heading}>
                Pause.{" "}
                <span className={styles.accent}>Breathe.</span>{" "}
                Heal.
              </h1>

              <p className={styles.subtitle}>
                Your safe space for mental wellness, growth, and balance. At
                Thought Lab, we support you through life's challenges and
                celebrate every victory — big and small.
              </p>

              <div className={styles.buttonsContainer}>
                <Link to="/register" className={styles.primaryButton}>
                  ✨ Get Started
                </Link>
                <Link to="/all-events" className={styles.secondaryButton}>
                  Events
                </Link>
                <Link to="/quick-response-team" className={styles.secondaryButton}>
                  QRT
                </Link>
                <Link to="/meditation-tracker" className={styles.secondaryButton}>
                  Meditation
                </Link>
                <Link to="/attendance" className={styles.secondaryButton}>
                  Facial ID
                </Link>
                <Link to="/meditation-timer" className={styles.secondaryButton}>
                  Sadhna
                </Link>
                <Link to="/courses" className={styles.secondaryButton}>
                  Courses
                </Link>
                <a
                  href="https://ashish-portfoliov1.netlify.app/"
                  className={styles.secondaryButton}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Developer
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats Strip ── */}
        <div className={styles.statsStrip}>
          <div className={styles.statsInner}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>100+</div>
              <div className={styles.statLabel}>Students</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>50+</div>
              <div className={styles.statLabel}>Events</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>100+</div>
              <div className={styles.statLabel}>Sessions</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>98%</div>
              <div className={styles.statLabel}>Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      <About />
      {/* <Features /> */}
      <Testimonials />

      <div className={styles.footer}>
        <Footer />
      </div>
    </>
  );
};

export default Home;