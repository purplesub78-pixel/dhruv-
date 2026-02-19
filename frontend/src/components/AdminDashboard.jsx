import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { FolderOpen, Users, DollarSign, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, projectsRes, usersRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/admin/stats`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/projects`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/admin/users`, { withCredentials: true })
      ]);

      setStats(statsRes.data.stats);
      setProjects(projectsRes.data.projects || []);
      setUsers(usersRes.data.users || []);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const updateProjectStatus = async (projectId, newStatus) => {
    try {
      await axios.patch(
        `${BACKEND_URL}/api/projects/${projectId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      toast.success('Project status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h1 className="dashboard-title">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="dashboard-stats">
          <Card className="stat-card">
            <CardContent className="stat-card-content">
              <FolderOpen className="stat-icon" />
              <div>
                <p className="stat-value">{stats?.total_projects || 0}</p>
                <p className="stat-label">Total Projects</p>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="stat-card-content">
              <TrendingUp className="stat-icon" />
              <div>
                <p className="stat-value">{stats?.active_projects || 0}</p>
                <p className="stat-label">Active Projects</p>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="stat-card-content">
              <Users className="stat-icon" />
              <div>
                <p className="stat-value">{stats?.total_clients || 0}</p>
                <p className="stat-label">Total Clients</p>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="stat-card-content">
              <DollarSign className="stat-icon" />
              <div>
                <p className="stat-value">₹{(stats?.total_revenue || 0).toLocaleString('en-IN')}</p>
                <p className="stat-label">Total Revenue</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="projects" className="admin-tabs">
          <TabsList>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>All Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="projects-table">
                  {projects.map((project) => (
                    <Card key={project.project_id} className="project-row">
                      <CardContent className="project-row-content">
                        <div>
                          <h4>{project.client_name}</h4>
                          <p>{project.services.join(', ')}</p>
                        </div>
                        <Badge>{project.status}</Badge>
                        <select
                          value={project.status}
                          onChange={(e) => updateProjectStatus(project.project_id, e.target.value)}
                          className="status-select"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="review">Review</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="users-table">
                  {users.map((u) => (
                    <Card key={u.user_id} className="user-row">
                      <CardContent className="user-row-content">
                        <img src={u.picture || 'https://via.placeholder.com/40'} alt={u.name} />
                        <div>
                          <h4>{u.name}</h4>
                          <p>{u.email}</p>
                        </div>
                        <Badge>{u.role}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
