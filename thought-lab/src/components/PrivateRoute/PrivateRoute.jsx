// components/PrivateRoute.js
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../Context/auth";

const spinnerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
};

const PrivateRoute = ({ children }) => {
  const [auth] = useAuth();
  const [loading, setLoading] = useState(true);

  // Stop loading after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div style={spinnerStyle}>
        <div className="spinner"></div>
        <style>
          {`
            .spinner {
              border: 4px solid rgba(0, 0, 0, 0.1);
              width: 40px;
              height: 40px;
              border-radius: 50%;
              border-left-color: #09f;
              animation: spin 1s ease infinite;
            }

            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // After loading ends, check auth token
  if (!auth?.token || auth.token === "" || auth.token === "undefined") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
