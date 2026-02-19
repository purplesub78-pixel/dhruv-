import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientDashboard from './ClientDashboard';
import AdminDashboard from './AdminDashboard';
import TalentDashboard from './TalentDashboard';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Dashboard = ({ user: initialUser }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(initialUser);

  const handleLogout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, {
        withCredentials: true
      });
      
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const renderDashboard = () => {
    if (!user) return null;

    switch (user.role) {
      case 'client':
        return <ClientDashboard user={user} />;
      case 'admin':
        return <AdminDashboard user={user} />;
      case 'talent':
        return <TalentDashboard user={user} />;
      default:
        return <div>Unknown role</div>;
    }
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-container">
          <div className="dashboard-logo" onClick={() => navigate('/')}>
            Purple Aster Studio
          </div>
          <div className="dashboard-header-right">
            <div className="user-info">
              <img 
                src={user?.picture || 'https://via.placeholder.com/40'} 
                alt={user?.name}
                className="user-avatar"
              />
              <div className="user-details">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">{user?.role}</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="logout-button"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="dashboard-main">
        {renderDashboard()}
      </main>
    </div>
  );
};

export default Dashboard;
