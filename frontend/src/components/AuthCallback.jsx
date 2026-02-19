import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing (React StrictMode)
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        // Extract session_id from URL fragment
        const hash = location.hash;
        const params = new URLSearchParams(hash.substring(1));
        const sessionId = params.get('session_id');

        if (!sessionId) {
          console.error('No session_id found in URL');
          navigate('/login');
          return;
        }

        // Get selected role from sessionStorage
        const selectedRole = sessionStorage.getItem('selected_role') || 'client';
        sessionStorage.removeItem('selected_role');

        // Exchange session_id for session_token
        // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
        const response = await axios.post(
          `${BACKEND_URL}/api/auth/session`,
          {
            session_id: sessionId,
            role: selectedRole
          },
          {
            withCredentials: true // Important for cookies
          }
        );

        if (response.data.success) {
          const user = response.data.user;
          
          // Navigate to dashboard with user data
          navigate('/dashboard', { 
            state: { user },
            replace: true 
          });
        } else {
          throw new Error('Session exchange failed');
        }

      } catch (error) {
        console.error('Auth callback error:', error);
        alert('Authentication failed. Please try again.');
        navigate('/login');
      }
    };

    processAuth();
  }, [location, navigate]);

  return (
    <div className="auth-callback-page">
      <div className="auth-callback-container">
        <div className="auth-callback-content">
          <div className="loading-spinner"></div>
          <h2 className="auth-callback-title">Completing sign in...</h2>
          <p className="auth-callback-text">Please wait while we verify your credentials</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
