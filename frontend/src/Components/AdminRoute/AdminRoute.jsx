// components/AdminRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../Context/auth';

const AdminRoute = ({ children }) => {
  const [auth, setAuth] = useAuth();

  if (!auth?.token || auth.token === '' || auth.token === 'undefined') return <Navigate to="/login" replace />;
  if (auth?.user?.role !== 'admin') return <Navigate to="/unauthorized" replace />;

  return children;
};

export default AdminRoute;
