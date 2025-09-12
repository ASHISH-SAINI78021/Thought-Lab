import heroImage from "../assets/calm-women.png";
import styles from "./Home.module.css";
import "../styles/Home.css"
import { Link } from "react-router-dom";
import Features from "./Features";
import About from "./About";
import Testimonials from "./Testimonials";
import Footer from "./Footer/Footer";

const Home = () => {
  return (
    <>
      <div className={styles.container}>
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={styles.heroImageContainer}>
              <img
                src={heroImage}
                className={styles.heroImage}
                alt="Calm-Lady-Breathing"
                loading="lazy"
              />
            </div>
            <div className={styles.heroText}>
              <h1 className={styles.heading}>
                Pause. Breathe. Heal.
              </h1>
              <p className={styles.subtitle}>
                Your safe space for mental wellness, growth, and balance. At
                Thought Lab, we're here to support you through life's
                challenges and celebrate your victories.
              </p>
              <div className={styles.buttonsContainer}>
                <Link
                  to="/register"
                  className={styles.secondaryButton}
                >
                  Register
                </Link>
                <Link
                  to="/all-events"
                  className={styles.secondaryButton}
                >
                  Events
                </Link>
                <Link
                  to="/quick-response-team"
                  className={styles.secondaryButton}
                >
                  QRT
                </Link>
                <Link
                  to="/developer"
                  className={styles.secondaryButton}
                >
                  Developer
                </Link>
                <Link
                  to="/meditation-tracker"
                  className={styles.secondaryButton}
                >
                  Meditation Tracker
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <About />
      <Testimonials />
      <div className={styles.footer}>
        <Footer />
      </div>
    </>
  );
};

export default Home;