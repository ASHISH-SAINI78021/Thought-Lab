import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../Context/auth';
import styles from './Login.module.css';
import url from '../../../url';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${url}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.success) {
          setSuccessMsg("Logged in successfully");
          setAuth(data?.user);
          localStorage.setItem('auth', JSON.stringify(data));
          navigate("/");
        } else {
          setErrorMsg(data?.message || 'Login failed');
        }
      } else {
        setErrorMsg('Login failed. Please check your credentials');
      }
    } catch (err) {
      setErrorMsg('Server error. Please try again later');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h1 className={styles.loginTitle}>Welcome Back</h1>
          <p className={styles.loginSubtitle}>Sign in to continue your journey</p>
        </div>

        {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}
        {successMsg && <div className={styles.successMessage}>{successMsg}</div>}

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.inputLabel}>Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
              className={styles.inputField}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.inputLabel}>Password</label>
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                className={styles.inputField}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.passwordToggle}
              >
                {showPassword ? (
                  <svg className={styles.eyeIcon} viewBox="0 0 24 24">
                    <path d="M12 6a9.77 9.77 0 018.82 5.5 9.77 9.77 0 01-8.82 5.5 9.77 9.77 0 01-8.82-5.5A9.77 9.77 0 0112 6zm0-2C7 4 2.73 7.11 1 11.5 2.73 15.89 7 19 12 19s9.27-3.11 11-7.5C21.27 7.11 17 4 12 4zm0 5a2.5 2.5 0 010 5 2.5 2.5 0 010-5z" />
                  </svg>
                ) : (
                  <svg className={styles.eyeIcon} viewBox="0 0 24 24">
                    <path d="M12 6a9.77 9.77 0 018.82 5.5 9.77 9.77 0 01-8.82 5.5 9.77 9.77 0 01-8.82-5.5A9.77 9.77 0 0112 6zm0-2C7 4 2.73 7.11 1 11.5 2.73 15.89 7 19 12 19s9.27-3.11 11-7.5C21.27 7.11 17 4 12 4zm0 5a2.5 2.5 0 010 5 2.5 2.5 0 010-5z" />
                    <path d="M0 0h24v24H0z" fill="none" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.loginButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className={styles.spinner}></span>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <div className={styles.footerLinks}>
            <a href="/forgot-password" className={styles.footerLink}>Forgot password?</a>
            <span className={styles.footerDivider}>•</span>
            <a href="/register" className={styles.footerLink}>Create account</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;