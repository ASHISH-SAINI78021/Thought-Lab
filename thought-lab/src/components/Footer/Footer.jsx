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
      <div className="footer-wave">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
        </svg>
      </div>
      
      <div className="container">
        <div className="footer-grid">
          {/* Column 1: About Us */}
          <div className="footer-column">
            <div className="footer-brand">
              <h3>Thought Lab</h3>
              <div className="accent-line"></div>
            </div>
            <p>
              A creative space for innovation, collaboration, and turning ideas
              into reality. Join us to build the future, one thought at a time.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-column none">
            <h3>Quick Links</h3>
            <div className="accent-line"></div>
            <ul>
              <li>
                <a href="/">
                  <span className="link-arrow">→</span> Home
                </a>
              </li>
              <li>
                <a href="/about">
                  <span className="link-arrow">→</span> About Us
                </a>
              </li>
              <li>
                <a href="/events">
                  <span className="link-arrow">→</span> Events
                </a>
              </li>
              <li>
                <a href="/contact">
                  <span className="link-arrow">→</span> Contact
                </a>
              </li>
              <li>
                <a href="/faq">
                  <span className="link-arrow">→</span> FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className="footer-column">
            <h3>Contact Us</h3>
            <div className="accent-line"></div>
            <div className="contact-item">
              <i className="icon-location"></i>
              <p>NIT Kurukshetra, Haryana, India</p>
            </div>
            <div className="contact-item">
              <i className="icon-email"></i>
              <p>
                <a href="mailto:12213075@nitkkr.ac.in">12213075@nitkkr.ac.in</a>
              </p>
            </div>
            <div className="contact-item">
              <i className="icon-phone"></i>
              <p>+91 9416540289</p>
            </div>
          </div>

          {/* Column 4: Social Media */}
          <div className="footer-column">
            <h3>Follow Us</h3>
            <div className="accent-line"></div>
            <p className="social-text">Stay connected with us on social media</p>
            <div className="social-icons">
              <a
                href="https://github.com/ASHISH-SAINI78021"
                aria-label="GitHub"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <FaGithub />
                <span>GitHub</span>
              </a>
              <a
                href="https://ashish-saini-portfolio.netlify.app/"
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
                href="https://www.linkedin.com/in/ashish-saini-a641902b3/"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <FaLinkedinIn />
                <span>LinkedIn</span>
              </a>
            </div>
            
            <div className="newsletter">
              <h4>Subscribe to our newsletter</h4>
              <div className="newsletter-form">
                <input type="email" placeholder="Your email address" />
                <button type="submit">Subscribe</button>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} Thought Lab. All Rights Reserved.
          </p>
          <div className="footer-links">
            <a href="/privacy-policy">Privacy Policy</a>
            <span>|</span>
            <a href="/terms-of-service">Terms of Service</a>
          </div>
          <div className="made-with">
            <p>Made with <FaHeart className="heart-icon" /> by Thought Lab Team</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;