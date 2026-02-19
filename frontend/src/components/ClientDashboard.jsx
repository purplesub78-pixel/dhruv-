import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  FolderOpen, 
  CreditCard, 
  FileVideo, 
  Plus,
  Calendar,
  DollarSign
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ClientDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [deliverables, setDeliverables] = useState([]);
  const [payments, setPayments] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchProjectDetails(selectedProject.project_id);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/projects`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setProjects(response.data.projects);
        if (response.data.projects.length > 0) {
          setSelectedProject(response.data.projects[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectDetails = async (projectId) => {
    try {
      const [deliverablesRes, paymentsRes, updatesRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/deliverables/${projectId}`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/payments/${projectId}`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/updates/${projectId}`, { withCredentials: true })
      ]);

      setDeliverables(deliverablesRes.data.deliverables || []);
      setPayments(paymentsRes.data.payments || []);
      setUpdates(updatesRes.data.updates || []);
    } catch (error) {
      console.error('Failed to fetch project details:', error);
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

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="client-dashboard">
      <div className="container">
        {/* Welcome Section */}
        <div className="dashboard-welcome">
          <h1 className="dashboard-title">Welcome back, {user.name}!</h1>
          <p className="dashboard-subtitle">
            Here's an overview of your projects
          </p>
          <Button 
            className="cta-primary"
            onClick={() => navigate('/onboarding')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Start New Project
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-stats">
          <Card className="stat-card">
            <CardContent className="stat-card-content">
              <FolderOpen className="stat-icon" />
              <div>
                <p className="stat-value">{projects.length}</p>
                <p className="stat-label">Total Projects</p>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="stat-card-content">
              <FileVideo className="stat-icon" />
              <div>
                <p className="stat-value">{deliverables.length}</p>
                <p className="stat-label">Deliverables</p>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="stat-card-content">
              <CreditCard className="stat-icon" />
              <div>
                <p className="stat-value">{payments.length}</p>
                <p className="stat-label">Payments</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Section */}
        {projects.length === 0 ? (
          <Card className="empty-state">
            <CardContent className="empty-state-content">
              <FolderOpen className="empty-icon" />
              <h3>No projects yet</h3>
              <p>Start your first project with Purple Aster Studio</p>
              <Button onClick={() => navigate('/onboarding')}>
                Create Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="projects-section">
            {/* Project Selector */}
            <div className="project-list">
              {projects.map((project) => (
                <Card
                  key={project.project_id}
                  className={`project-item ${
                    selectedProject?.project_id === project.project_id ? 'selected' : ''
                  }`}
                  onClick={() => setSelectedProject(project)}
                >
                  <CardContent className="project-item-content">
                    <div className="project-item-header">
                      <h4 className="project-item-title">
                        {project.services.join(', ')}
                      </h4>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="project-item-budget">{project.budget}</p>
                    <div className="project-item-meta">
                      <span><Calendar className="h-3 w-3" /> {project.timeline}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Project Details */}
            {selectedProject && (
              <Card className="project-details">
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview" className="project-tabs">
                    <TabsList>
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
                      <TabsTrigger value="payments">Payments</TabsTrigger>
                      <TabsTrigger value="updates">Updates</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                      <div className="overview-section">
                        <div className="detail-item">
                          <span className="detail-label">Services:</span>
                          <span className="detail-value">{selectedProject.services.join(', ')}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Goal:</span>
                          <span className="detail-value">{selectedProject.goal}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Platform:</span>
                          <span className="detail-value">{selectedProject.platform}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Timeline:</span>
                          <span className="detail-value">{selectedProject.timeline}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Budget:</span>
                          <span className="detail-value">{selectedProject.budget}</span>
                        </div>
                        {selectedProject.details && (
                          <div className="detail-item full">
                            <span className="detail-label">Description:</span>
                            <span className="detail-value">{selectedProject.details}</span>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="deliverables">
                      <div className="deliverables-list">
                        {deliverables.length === 0 ? (
                          <p className="empty-message">No deliverables yet</p>
                        ) : (
                          deliverables.map((item) => (
                            <Card key={item.deliverable_id} className="deliverable-item">
                              <CardContent className="deliverable-content">
                                <FileVideo className="deliverable-icon" />
                                <div>
                                  <h4 className="deliverable-title">{item.title}</h4>
                                  <p className="deliverable-description">{item.description}</p>
                                  <Badge className="deliverable-badge">{item.deliverable_type}</Badge>
                                </div>
                                <Button variant="outline" size="sm">View</Button>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="payments">
                      <div className="payments-list">
                        {payments.length === 0 ? (
                          <div className="empty-message">
                            <p>No payments yet</p>
                            <Button 
                              onClick={() => navigate(`/payment/${selectedProject.project_id}`)}
                            >
                              Make Payment
                            </Button>
                          </div>
                        ) : (
                          payments.map((payment) => (
                            <Card key={payment.payment_id} className="payment-item">
                              <CardContent className="payment-content">
                                <DollarSign className="payment-icon" />
                                <div>
                                  <h4 className="payment-amount">
                                    ₹{payment.amount.toLocaleString('en-IN')}
                                  </h4>
                                  <p className="payment-method">{payment.payment_method}</p>
                                </div>
                                <Badge className={
                                  payment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }>
                                  {payment.status}
                                </Badge>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="updates">
                      <div className="updates-list">
                        {updates.length === 0 ? (
                          <p className="empty-message">No updates yet</p>
                        ) : (
                          updates.map((update) => (
                            <Card key={update.update_id} className="update-item">
                              <CardContent className="update-content">
                                <p className="update-message">{update.message}</p>
                                <p className="update-date">
                                  {new Date(update.created_at).toLocaleDateString()}
                                </p>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
