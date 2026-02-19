import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { FolderOpen, Calendar } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const TalentDashboard = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/projects`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        // Filter projects assigned to this talent
        const assignedProjects = response.data.projects.filter(
          p => p.assigned_talents && p.assigned_talents.includes(user.user_id)
        );
        setProjects(assignedProjects);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="talent-dashboard">
      <div className="container">
        <h1 className="dashboard-title">Talent Dashboard</h1>
        <p className="dashboard-subtitle">Your assigned projects</p>

        {/* Stats */}
        <div className="dashboard-stats">
          <Card className="stat-card">
            <CardContent className="stat-card-content">
              <FolderOpen className="stat-icon" />
              <div>
                <p className="stat-value">{projects.length}</p>
                <p className="stat-label">Assigned Projects</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects List */}
        {projects.length === 0 ? (
          <Card className="empty-state">
            <CardContent className="empty-state-content">
              <FolderOpen className="empty-icon" />
              <h3>No projects assigned yet</h3>
              <p>Check back later for new assignments</p>
            </CardContent>
          </Card>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <Card key={project.project_id} className="project-card">
                <CardHeader>
                  <CardTitle>{project.services.join(', ')}</CardTitle>
                  <Badge>{project.status}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="project-detail">
                    <span className="detail-label">Client:</span>
                    <span>{project.client_name}</span>
                  </div>
                  <div className="project-detail">
                    <span className="detail-label">Timeline:</span>
                    <span><Calendar className="h-3 w-3 inline" /> {project.timeline}</span>
                  </div>
                  <div className="project-detail">
                    <span className="detail-label">Platform:</span>
                    <span>{project.platform}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TalentDashboard;
