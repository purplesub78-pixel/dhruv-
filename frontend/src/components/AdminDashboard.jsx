import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { FolderOpen, Users, DollarSign, TrendingUp, UserPlus, ChevronDown, ChevronUp, Mail, Phone, Calendar } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedProject, setExpandedProject] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTalents, setSelectedTalents] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, projectsRes, usersRes, talentsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/admin/stats`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/projects`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/admin/users`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/admin/talents`, { withCredentials: true }).catch(() => ({ data: { talents: [] } }))
      ]);

      setStats(statsRes.data.stats);
      setProjects(projectsRes.data.projects || []);
      setUsers(usersRes.data.users || []);
      setTalents(talentsRes.data.talents || []);
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

  const openAssignModal = (project) => {
    setSelectedProject(project);
    setSelectedTalents(project.assigned_talents || []);
    setAssignModalOpen(true);
  };

  const handleTalentToggle = (talentId) => {
    setSelectedTalents(prev => 
      prev.includes(talentId)
        ? prev.filter(id => id !== talentId)
        : [...prev, talentId]
    );
  };

  const handleAssignTalents = async () => {
    if (!selectedProject) return;
    
    setAssignLoading(true);
    try {
      await axios.patch(
        `${BACKEND_URL}/api/projects/${selectedProject.project_id}/assign`,
        { talent_ids: selectedTalents },
        { withCredentials: true }
      );
      toast.success('Talents assigned successfully');
      setAssignModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Assign error:', error);
      toast.error('Failed to assign talents');
    } finally {
      setAssignLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      review: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getRoleColor = (role) => {
    const colors = {
      client: 'bg-blue-100 text-blue-800',
      admin: 'bg-purple-100 text-purple-800',
      talent: 'bg-green-100 text-green-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard" data-testid="admin-dashboard">
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
            <TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
            <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
            <TabsTrigger value="talents">Talents ({talents.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>All Projects</CardTitle>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="empty-state-content">
                    <FolderOpen className="empty-icon" />
                    <p>No projects yet</p>
                  </div>
                ) : (
                  <div className="projects-table">
                    {projects.map((project) => (
                      <Card key={project.project_id} className="project-row" data-testid={`project-${project.project_id}`}>
                        <CardContent className="project-row-content">
                          <div className="project-main-info" onClick={() => setExpandedProject(expandedProject === project.project_id ? null : project.project_id)}>
                            <div className="project-header-row">
                              <div className="project-client-info">
                                <h4>{project.client_name}</h4>
                                <p className="project-services">{project.services.join(', ')}</p>
                              </div>
                              <Badge className={getStatusColor(project.status)}>{project.status.replace('_', ' ')}</Badge>
                              {expandedProject === project.project_id ? <ChevronUp className="expand-icon" /> : <ChevronDown className="expand-icon" />}
                            </div>
                          </div>
                          
                          {expandedProject === project.project_id && (
                            <div className="project-expanded">
                              <div className="project-details-grid">
                                <div className="detail-item">
                                  <Mail className="detail-icon" />
                                  <span>{project.client_email}</span>
                                </div>
                                {project.client_phone && (
                                  <div className="detail-item">
                                    <Phone className="detail-icon" />
                                    <span>{project.client_phone}</span>
                                  </div>
                                )}
                                <div className="detail-item">
                                  <Calendar className="detail-icon" />
                                  <span>{formatDate(project.created_at)}</span>
                                </div>
                              </div>
                              
                              <div className="project-meta">
                                <p><strong>Goal:</strong> {project.goal}</p>
                                <p><strong>Platform:</strong> {project.platform}</p>
                                <p><strong>Timeline:</strong> {project.timeline}</p>
                                <p><strong>Budget:</strong> {project.budget}</p>
                              </div>
                              
                              {project.details && (
                                <div className="project-description">
                                  <strong>Details:</strong>
                                  <p>{project.details}</p>
                                </div>
                              )}
                              
                              <div className="project-talents">
                                <strong>Assigned Talents:</strong>
                                {project.assigned_talents && project.assigned_talents.length > 0 ? (
                                  <div className="assigned-talents-list">
                                    {project.assigned_talents.map(talentId => {
                                      const talent = talents.find(t => t.user_id === talentId);
                                      return talent ? (
                                        <Badge key={talentId} className="talent-badge">
                                          {talent.name}
                                        </Badge>
                                      ) : null;
                                    })}
                                  </div>
                                ) : (
                                  <span className="no-talents">None assigned</span>
                                )}
                              </div>
                              
                              <div className="project-actions">
                                <select
                                  value={project.status}
                                  onChange={(e) => updateProjectStatus(project.project_id, e.target.value)}
                                  className="status-select"
                                  data-testid={`status-select-${project.project_id}`}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="review">Review</option>
                                  <option value="completed">Completed</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                                
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openAssignModal(project)}
                                  data-testid={`assign-btn-${project.project_id}`}
                                >
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  Assign Talents
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <div className="empty-state-content">
                    <Users className="empty-icon" />
                    <p>No users yet</p>
                  </div>
                ) : (
                  <div className="users-table">
                    {users.map((u) => (
                      <Card key={u.user_id} className="user-row" data-testid={`user-${u.user_id}`}>
                        <CardContent className="user-row-content">
                          <img src={u.picture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(u.name)} alt={u.name} className="user-avatar" />
                          <div className="user-info">
                            <h4>{u.name}</h4>
                            <p>{u.email}</p>
                          </div>
                          <Badge className={getRoleColor(u.role)}>{u.role}</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="talents">
            <Card>
              <CardHeader>
                <CardTitle>Talent Pool</CardTitle>
              </CardHeader>
              <CardContent>
                {talents.length === 0 ? (
                  <div className="empty-state-content">
                    <Users className="empty-icon" />
                    <p>No talents registered yet. Talents can sign up with the "Talent" role.</p>
                  </div>
                ) : (
                  <div className="talents-grid">
                    {talents.map((talent) => (
                      <Card key={talent.user_id} className="talent-card" data-testid={`talent-${talent.user_id}`}>
                        <CardContent className="talent-card-content">
                          <img 
                            src={talent.picture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(talent.name)} 
                            alt={talent.name} 
                            className="talent-avatar" 
                          />
                          <h4>{talent.name}</h4>
                          <p className="talent-email">{talent.email}</p>
                          <Badge className="bg-green-100 text-green-800">Available</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Assign Talents Modal */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="assign-modal">
          <DialogHeader>
            <DialogTitle>Assign Talents to Project</DialogTitle>
          </DialogHeader>
          
          {selectedProject && (
            <div className="assign-modal-content">
              <div className="project-summary">
                <p><strong>Project:</strong> {selectedProject.services.join(', ')}</p>
                <p><strong>Client:</strong> {selectedProject.client_name}</p>
              </div>
              
              <div className="talents-selection">
                <p className="selection-label">Select talents to assign:</p>
                {talents.length === 0 ? (
                  <p className="no-talents-message">No talents available. Talents need to register first.</p>
                ) : (
                  <div className="talents-checkbox-list">
                    {talents.map((talent) => (
                      <div key={talent.user_id} className="talent-checkbox-item">
                        <Checkbox
                          id={`talent-${talent.user_id}`}
                          checked={selectedTalents.includes(talent.user_id)}
                          onCheckedChange={() => handleTalentToggle(talent.user_id)}
                          data-testid={`checkbox-talent-${talent.user_id}`}
                        />
                        <Label htmlFor={`talent-${talent.user_id}`} className="talent-checkbox-label">
                          <img 
                            src={talent.picture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(talent.name)} 
                            alt={talent.name}
                            className="talent-mini-avatar"
                          />
                          <div>
                            <span className="talent-name">{talent.name}</span>
                            <span className="talent-email-small">{talent.email}</span>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignTalents} 
              disabled={assignLoading}
              data-testid="confirm-assign-btn"
            >
              {assignLoading ? 'Assigning...' : 'Assign Selected'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
