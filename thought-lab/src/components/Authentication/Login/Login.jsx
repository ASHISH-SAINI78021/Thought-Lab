import React, { useState } from "react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../Context/auth";

import styles from "./Login.module.css";

import { url } from "../../../url";

const Login = () => {
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [errorMsg, setErrorMsg] = useState("");

  const [successMsg, setSuccessMsg] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [auth, setAuth] = useAuth();

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMsg("");

    setSuccessMsg("");

    setIsLoading(true);

    if (!email || !password) {
      setErrorMsg("Please enter both email and password");

      setIsLoading(false);

      return;
    }

    try {
      const res = await fetch(`${url}/login`, {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();

        if (data?.success) {
          setSuccessMsg("Logged in successfully");

          setAuth(data?.user);

          localStorage.setItem("auth", JSON.stringify(data));

          navigate("/");
        } else {
          setErrorMsg(data?.message || "Login failed");
        }
      } else {
        setErrorMsg("Login failed. Please check your credentials");
      }
    } catch (err) {
      setErrorMsg("Server error. Please try again later");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <div className={styles.logoContainer}>
            <svg className={styles.logo} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="#4f46e5" />

              <path
                d="M35,35 L65,65 M65,35 L35,65"
                stroke="white"
                strokeWidth="8"
              />
            </svg>
          </div>

          <h1 className={styles.loginTitle}>Welcome Back</h1>

          <p className={styles.loginSubtitle}>
            Sign in to continue your journey
          </p>
        </div>

        {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}

        {successMsg && (
          <div className={styles.successMessage}>{successMsg}</div>
        )}

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.inputLabel}>
              Email Address
            </label>

            <div className={styles.inputContainer}>
              <svg className={styles.inputIcon} viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z" />
              </svg>

              <input
                id="email"
                type="email"
                value={email}
                placeholder="you@example.com"
                onChange={(e) => setEmail(e.target.value)}
                className={styles.inputField}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.inputLabel}>
              Password
            </label>

            <div className={styles.inputContainer}>
              <svg className={styles.inputIcon} viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
              </svg>

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                className={styles.inputField}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.passwordToggle}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className={styles.eyeIcon} viewBox="0 0 24 24">
                    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                  </svg>
                ) : (
                  <svg className={styles.eyeIcon} viewBox="0 0 24 24">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
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
              "Sign In"
            )}
          </button>

          <div className={styles.footerLinks}>
            <a href="/forgot-password" className={styles.footerLink}>
              Forgot password?
            </a>

            <span className={styles.footerDivider}>•</span>

            <a href="/register" className={styles.footerLink}>
              Create account
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
