// Footer.jsx
import React from "react";
import styles from "./Footer.module.css";
import {
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
  FaUserCircle,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className={`${styles.footer} sticky`}>
      <div className={styles.container}>
        <div className={styles.footerGrid}>
          {/* Column 1: About Us */}
          <div className={styles.footerColumn}>
            <h3>About Thought Lab</h3>
            <p>
              A creative space for innovation, collaboration, and turning ideas
              into reality. Join us to build the future, one thought at a time.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className={styles.footerColumn}>
            <h3>Quick Links</h3>
            <ul>
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/about">About Us</a>
              </li>
              <li>
                <a href="/events">Events</a>
              </li>
              <li>
                <a href="/contact">Contact</a>
              </li>
              <li>
                <a href="/faq">FAQ</a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className={styles.footerColumn}>
            <h3>Contact Us</h3>
            <p>NIT Kurukshetra, Haryana, India</p>
            <p>
              Email:{" "}
              <a href="mailto:12213075@nitkkr.ac.in">12213075@nitkkr.ac.in</a>
            </p>
            <p>Phone: +91 9416540289</p>
          </div>

          {/* Column 4: Social Media */}
          <div className={styles.footerColumn}>
            <h3>Follow Us</h3>
            <div className={styles.socialIcons}>
              <a
                href="https://github.com/ASHISH-SAINI78021"
                aria-label="GitHub"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaGithub />
              </a>
              <a
                href="https://ashish-saini-portfolio.netlify.app/"
                aria-label="Portfolio"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaUserCircle />
              </a>
              <a
                href="https://instagram.com"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram />
              </a>
              <a
                href="https://www.linkedin.com/in/ashish-saini-a641902b3/"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaLinkedinIn />
              </a>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>
            &copy; {new Date().getFullYear()} Thought Lab. All Rights Reserved.
          </p>
          <div className={styles.footerLinks}>
            <a href="/privacy-policy">Privacy Policy</a>
            <span>|</span>
            <a href="/terms-of-service">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
