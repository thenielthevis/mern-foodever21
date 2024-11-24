import React from 'react';
import { Navigate } from 'react-router-dom';

const RequireAuth = ({ children, allowedRoles }) => {
  const userRole = localStorage.getItem('role');

  if (!userRole) {
    return <Navigate to="/unauthorized" />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default RequireAuth;
