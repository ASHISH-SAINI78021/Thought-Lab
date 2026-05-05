// Footer.jsx
import React from "react";
import "./Footer.css";
import {
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
  FaUserCircle,
  FaHeart,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      {/* Wave transition from cream background */}
      <div className="footer-wave">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="shape-fill"
          />
        </svg>
      </div>

      <div className="container">
        {/* ── Brand row with inline newsletter ── */}
        <div className="footer-brand-row">
          <a href="/" className="footer-logo">
            <div className="footer-logo-icon">🧠</div>
            <div>
              <div className="footer-logo-text">
                Thought <span>Lab</span>
              </div>
              <div className="footer-tagline">Mental Wellness Platform</div>
            </div>
          </a>

          <div className="newsletter-inline">
            <input type="email" placeholder="Subscribe to our newsletter…" />
            <button type="submit">Subscribe ✈</button>
          </div>
        </div>

        {/* ── Four column grid ── */}
        <div className="footer-grid">
          {/* Column 1: About */}
          <div className="footer-column">
            <h3>About Us</h3>
            <p>
              A creative space for innovation, collaboration, and turning ideas
              into reality. We're here to support your mental wellness journey —
              one thought at a time.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-column none">
            <h3>Quick Links</h3>
            <ul>
              <li>
                <a href="/">
                  <span className="link-arrow">→</span> Home
                </a>
              </li>
              <li>
                <a href="/all-events">
                  <span className="link-arrow">→</span> Events
                </a>
              </li>
              <li>
                <a href="/blog">
                  <span className="link-arrow">→</span> Blog
                </a>
              </li>
              <li>
                <a href="/courses">
                  <span className="link-arrow">→</span> Courses
                </a>
              </li>
              <li>
                <a href="/meditation-timer">
                  <span className="link-arrow">→</span> Sadhna
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="footer-column">
            <h3>Contact</h3>
            <div className="contact-item">
              <i className="icon-location"></i>
              <p>RTU, Kota, Rajasthan – 324010, India</p>
            </div>
            <div className="contact-item">
              <i className="icon-email"></i>
              <p>
                <a href="mailto:thoughtlab@rtu.ac.in">thoughtlab@rtu.ac.in</a>
              </p>
            </div>
            <div className="contact-item">
              <i className="icon-phone"></i>
              <p>+91 8708645252</p>
            </div>
            <div className="contact-item">
              <i className="icon-location"></i>
              <p>
                <a href="https://www.rtu.ac.in" target="_blank" rel="noopener noreferrer">www.rtu.ac.in</a>
              </p>
            </div>
          </div>

          {/* Column 4: Social */}
          <div className="footer-column">
            <h3>Follow Us</h3>
            <div className="social-icons">
              <a
                href="https://github.com/Gurbajsingh1"
                aria-label="GitHub"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <FaGithub />
                <span>GitHub</span>
              </a>
              <a
                href="https://gurbaj-portfolio.netlify.app/"
                aria-label="Portfolio"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <FaUserCircle />
                <span>Portfolio</span>
              </a>
              <a
                href="https://instagram.com"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <FaInstagram />
                <span>Instagram</span>
              </a>
              <a
                href="https://www.linkedin.com/in/gurbaj-singh-b71b81205"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <FaLinkedinIn />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Gradient divider line */}
      <div className="footer-divider" />

      {/* Bottom bar */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Thought Lab. All Rights Reserved.</p>

        <div className="footer-links">
          <a href="/privacy-policy">Privacy Policy</a>
          <span>|</span>
          <a href="/terms-of-service">Terms of Service</a>
        </div>

        <div className="made-with">
          <p>
            Made with <FaHeart className="heart-icon" /> by Thought Lab Team
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;