// components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../Context/auth';

const PrivateRoute = ({ children }) => {
    const [auth] = useAuth();
  
    if (!auth?.token || auth.token === '' || auth.token === 'undefined') {
      return <Navigate to="/login" replace />;
    }
  
    return children;
  };
  

export default PrivateRoute;
