import logo from "../assets/logo.png";
import { Link, useLocation } from "react-router-dom";
import { Avatar, Tooltip } from 'antd';
import "./Navbar.css";
import { useAuth } from "../Context/auth";
import { useState } from "react";

function Navbar() {
  const location = useLocation();
  const [auth, setAuth] = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const Links = [
    { name: "Home", link: "/" },
    { name: "Utter Your Thoughts", link: "/utter-your-thoughts" },
    { name: "Blogs", link: "/blogs" },
    { name: "Leaderboard", link: "/leaderboard" },
    { name: "Counsellor Support", link: "/appointment-form" },
    { name: "Attendance", link: "/mark-attendance" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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

        {/* User Avatar */}
        <div className="navbar-user">
          {auth?.user && (
            <Tooltip title={auth.user.name} placement="bottom">
              <Avatar src={auth.user.profilePicture} className="user-avatar" />
            </Tooltip>
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
              <Avatar src={auth.user.profilePicture} size={64} />
              <div className="user-details">
                <p className="user-name">{auth.user.name}</p>
                <p className="user-role">{auth.user.role}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;