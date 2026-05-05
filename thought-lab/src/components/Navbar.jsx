import logo from "../assets/calm-women.png";
import { Link, useLocation } from "react-router-dom";
import { Tooltip } from 'antd';
import "./Navbar.css";
import { useAuth } from "../Context/auth";
import { useState } from "react";
import NotificationBell from './NotificationBell/NotificationBell';
import { url } from "../url";

const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';

function Navbar() {
  const location = useLocation();
  const [auth, setAuth, logout] = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  console.log("🛠️ [Navbar] Current Auth State:", auth);
  console.log("🖼️ [Navbar] Profile Picture:", auth?.user?.profilePicture);

  const Links = [
    { name: "Home", link: "/" },
    // { name: "Utter Your Thoughts", link: "/utter-your-thoughts" },
    { name: "Blogs", link: "/blogs" },
    // { name: "Events", link: "/events" },
    { name: "Devices", link: "/devices" },
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

  const isDarkTheme = location.pathname.startsWith('/student');

  const getProfileImage = (path) => {
    if (!path) return FALLBACK_AVATAR;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${url}/${cleanPath}`;
  };

  return (
    <nav className={`navbar ${isDarkTheme ? 'navbar-dark' : ''}`}>
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
            {auth?.user?.role === 'mentor' && (
              <li>
                <Link to="/mentor" className={`nav-link ${location.pathname.startsWith('/mentor') ? 'active' : ''}`}>
                  Mentor Panel
                </Link>
              </li>
            )}
            {(auth?.user?.role === 'student' || auth?.user?.role === 'user' || auth?.user?.role === 'admin' || auth?.user?.role === 'superAdmin' || auth?.user?.role === 'mentor') && (
              <li>
                <Link to="/student" className={`nav-link ${location.pathname.startsWith('/student') ? 'active' : ''}`}>
                  Student Portal
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
                <Link to={`/profile/${auth.user.id || auth.user._id}`} className="avatar-link">
                  <div className="user-avatar-wrapper">
                    <img
                      src={getProfileImage(auth.user.profilePicture)}
                      alt={auth.user.name}
                      className="user-avatar-img"
                      key={auth.user.profilePicture}
                      onError={(e) => {
                        console.error("Navbar Avatar failed to load:", e.target.src);
                        e.target.src = FALLBACK_AVATAR;
                      }}
                    />
                  </div>
                </Link>
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
            <li>
              <Link
                to={`/profile/${auth?.user?.id}`}
                className={`mobile-nav-link ${location.pathname.startsWith('/profile') ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile
              </Link>
            </li>
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
            {auth?.user?.role === 'mentor' && (
              <li>
                <Link
                  to="/mentor"
                  className={`mobile-nav-link ${location.pathname.startsWith('/mentor') ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Mentor Panel
                </Link>
              </li>
            )}
            {(auth?.user?.role === 'student' || auth?.user?.role === 'user' || auth?.user?.role === 'admin' || auth?.user?.role === 'superAdmin' || auth?.user?.role === 'mentor') && (
              <li>
                <Link
                  to="/student"
                  className={`mobile-nav-link ${location.pathname.startsWith('/student') ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Student Portal
                </Link>
              </li>
            )}
          </ul>

          {auth?.user && (
            <div className="mobile-user-info">
              <Link to={`/profile/${auth?.user?.id || auth?.user?._id}`} onClick={() => setIsMobileMenuOpen(false)}>
                <div className="mobile-avatar-wrapper">
                  <img
                    src={getProfileImage(auth?.user?.profilePicture)}
                    alt="User"
                    className="mobile-avatar-img"
                    onError={(e) => { e.target.src = FALLBACK_AVATAR; }}
                  />
                </div>
              </Link>
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