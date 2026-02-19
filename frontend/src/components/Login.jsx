import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LogIn, Users, Star, Video } from 'lucide-react';

const Login = () => {
  const handleLogin = (role) => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/dashboard';
    
    // Store selected role in sessionStorage for after auth
    sessionStorage.setItem('selected_role', role);
    
    // Redirect to Emergent Auth
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-content">
          {/* Logo/Brand */}
          <div className="login-header">
            <h1 className="login-logo">Purple Aster Studio</h1>
            <p className="login-tagline">Client Management Portal</p>
          </div>

          {/* Login Options */}
          <div className="login-cards">
            <Card className="login-card" onClick={() => handleLogin('client')}>
              <CardHeader>
                <div className="login-card-icon client">
                  <Users className="h-8 w-8" />
                </div>
                <CardTitle>Client Login</CardTitle>
                <CardDescription>
                  Access your projects, deliverables, and communicate with our team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="default">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login as Client
                </Button>
              </CardContent>
            </Card>

            <Card className="login-card" onClick={() => handleLogin('admin')}>
              <CardHeader>
                <div className="login-card-icon admin">
                  <Video className="h-8 w-8" />
                </div>
                <CardTitle>Admin Login</CardTitle>
                <CardDescription>
                  Manage projects, clients, and studio operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="default">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login as Admin
                </Button>
              </CardContent>
            </Card>

            <Card className="login-card" onClick={() => handleLogin('talent')}>
              <CardHeader>
                <div className="login-card-icon talent">
                  <Star className="h-8 w-8" />
                </div>
                <CardTitle>Talent Login</CardTitle>
                <CardDescription>
                  Access your assignments and upload content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="default">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login as Talent
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <p className="login-footer">
            Secure authentication powered by Emergent
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
