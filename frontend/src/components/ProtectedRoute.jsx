import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking, true = authenticated, false = not authenticated
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // If user data passed from AuthCallback, skip auth check
    if (location.state?.user) {
      setIsAuthenticated(true);
      setUser(location.state.user);
      return;
    }

    // Check authentication via server
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
          withCredentials: true // Send cookies
        });

        if (response.data && response.data.user_id) {
          setIsAuthenticated(true);
          setUser(response.data);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [location.state]);

  // Still checking
  if (isAuthenticated === null) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>Verifying authentication...</p>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (isAuthenticated === false) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated - render children with user context
  return React.cloneElement(children, { user });
};

export default ProtectedRoute;
