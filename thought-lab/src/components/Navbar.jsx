import logo from "../assets/logo.png";
import { Link, useLocation } from "react-router-dom";
import { Avatar, Tooltip } from 'antd';
import "./Navbar.css";
import { useAuth } from "../Context/auth";
import { useState } from "react";
import NotificationBell from './NotificationBell/NotificationBell';

function Navbar() {
  const location = useLocation();
  const [auth, setAuth, logout] = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const Links = [
    { name: "Home", link: "/" },
    // { name: "Utter Your Thoughts", link: "/utter-your-thoughts" },
    { name: "Blogs", link: "/blogs" },
    { name: "Events", link: "/events" },
    { name: "Leaderboard", link: "/leaderboard" },
    // { name: "Counsellor Support", link: "/appointment-form" },
    { name: "Attendance", link: "/mark-attendance" },
    { name: "Tasks", link: "/task-dashboard" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="logo-container">
            <div className="logo-icon">
              <img src={logo} alt="Thought Lab Logo" />
            </div>
            <span className="logo-text">
              Thought<br />Lab
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-menu">
          <ul className="nav-links">
            {Links.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.link}
                  className={`nav-link ${location.pathname === item.link ? 'active' : ''}`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
            {(auth?.user?.role === 'admin' || auth?.user?.role === 'superAdmin') && (
              <li>
                <Link
                  to="/admin"
                  className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
                >
                  Admin
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* User Avatar & Logout */}
        <div className="navbar-user">
          {auth?.user && (
            <>
              <NotificationBell />
              <Tooltip title={auth.user.name} placement="bottom">
                <Avatar src={auth.user.profilePicture} className="user-avatar" />
              </Tooltip>
              <button onClick={handleLogout} className="logout-btn" title="Logout">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

      </div>

      {/* Mobile Navigation */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-content">
          <ul className="mobile-nav-links">
            {Links.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.link}
                  className={`mobile-nav-link ${location.pathname === item.link ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              </li>
            ))}
            {(auth?.user?.role === 'admin' || auth?.user?.role === 'superAdmin') && (
              <li>
                <Link
                  to="/admin"
                  className={`mobile-nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin
                </Link>
              </li>
            )}
          </ul>

          {auth?.user && (
            <div className="mobile-user-info">
              <Avatar src={auth?.user?.profilePicture} size={64} />
              <div className="user-details">
                <p className="user-name">{auth?.user?.name}</p>
                <p className="user-role">{auth?.user?.role}</p>
              </div>
              <button onClick={handleLogout} className="mobile-logout-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;