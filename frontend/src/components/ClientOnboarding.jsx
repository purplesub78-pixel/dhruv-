import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { ArrowRight, ArrowLeft, CheckCircle2, Upload, X, FileVideo, FileImage, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ClientOnboarding = ({ user }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    selectedServices: [],
    goal: '',
    platform: '',
    timeline: '',
    budget: '',
    details: '',
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    termsAccepted: false
  });

  const totalSteps = 6;

  const services = [
    "Brand / Promo Video",
    "Event Coverage",
    "Commercial / Advertisement",
    "Social Media Content",
    "Music Video",
    "Documentary / Interview",
    "Animation / Motion Graphics",
    "Photography Services"
  ];

  const projectGoals = [
    "Increase Brand Awareness",
    "Drive Sales & Conversions",
    "Launch New Product/Service",
    "Event Documentation",
    "Social Media Engagement",
    "Educational/Training Content",
    "Other"
  ];

  const platforms = [
    "YouTube",
    "Instagram",
    "TikTok",
    "Facebook",
    "LinkedIn",
    "Website",
    "TV/Cinema",
    "Multiple Platforms"
  ];

  const timelines = [
    "Rush (1-2 weeks)",
    "Standard (3-4 weeks)",
    "Flexible (1-2 months)",
    "Long-term (2+ months)"
  ];

  const budgetRanges = [
    "Under ₹50,000",
    "₹50,000 - ₹1,00,000",
    "₹1,00,000 - ₹2,50,000",
    "₹2,50,000 - ₹5,00,000",
    "₹5,00,000+"
  ];

  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(service)
        ? prev.selectedServices.filter(s => s !== service)
        : [...prev.selectedServices, service]
    }));
  };

  const handleNext = () => {
    if (step === 1 && formData.selectedServices.length === 0) {
      toast.error('Please select at least one service');
      return;
    }
    if (step < totalSteps) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error('Please fill in your contact details');
      return;
    }

    if (!formData.termsAccepted) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/projects`,
        {
          services: formData.selectedServices,
          goal: formData.goal,
          platform: formData.platform,
          timeline: formData.timeline,
          budget: formData.budget,
          details: formData.details,
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        {
          withCredentials: true
        }
      );

      if (response.data.success) {
        toast.success('Project submitted successfully!');
        const projectId = response.data.project_id;
        
        // Navigate to payment page
        navigate(`/payment/${projectId}`);
      }
    } catch (error) {
      console.error('Project submission error:', error);
      toast.error('Failed to submit project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-page">
      <div className="container">
        <div className="onboarding-header">
          <h1 className="onboarding-title">Start Your Project</h1>
          <p className="onboarding-subtitle">
            Tell us about your vision and we'll bring it to life
          </p>
        </div>

        <Card className="onboarding-card">
          <CardHeader>
            <div className="progress-bar">
              {[...Array(totalSteps)].map((_, index) => (
                <div
                  key={index}
                  className={`progress-step ${index + 1 <= step ? 'active' : ''}`}
                />
              ))}
            </div>
            <CardTitle className="onboarding-step-title">
              Step {step} of {totalSteps}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit}>
              {/* Step 1: Services */}
              {step === 1 && (
                <div className="form-step">
                  <h3 className="step-heading">Select Services</h3>
                  <p className="step-description">Choose one or more services you need</p>
                  <div className="checkbox-grid">
                    {services.map((service) => (
                      <div key={service} className="checkbox-item">
                        <Checkbox
                          id={`service-${service}`}
                          checked={formData.selectedServices.includes(service)}
                          onCheckedChange={() => handleServiceToggle(service)}
                        />
                        <Label htmlFor={`service-${service}`} className="checkbox-label">
                          {service}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Goal */}
              {step === 2 && (
                <div className="form-step">
                  <h3 className="step-heading">Project Goal</h3>
                  <p className="step-description">What do you want to achieve?</p>
                  <div className="radio-grid">
                    {projectGoals.map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        className={`radio-button ${formData.goal === goal ? 'selected' : ''}`}
                        onClick={() => setFormData({ ...formData, goal })}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Platform */}
              {step === 3 && (
                <div className="form-step">
                  <h3 className="step-heading">Target Platform</h3>
                  <p className="step-description">Where will this be published?</p>
                  <div className="radio-grid">
                    {platforms.map((platform) => (
                      <button
                        key={platform}
                        type="button"
                        className={`radio-button ${formData.platform === platform ? 'selected' : ''}`}
                        onClick={() => setFormData({ ...formData, platform })}
                      >
                        {platform}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Timeline */}
              {step === 4 && (
                <div className="form-step">
                  <h3 className="step-heading">Timeline</h3>
                  <p className="step-description">When do you need this completed?</p>
                  <div className="radio-grid">
                    {timelines.map((timeline) => (
                      <button
                        key={timeline}
                        type="button"
                        className={`radio-button ${formData.timeline === timeline ? 'selected' : ''}`}
                        onClick={() => setFormData({ ...formData, timeline })}
                      >
                        {timeline}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Budget */}
              {step === 5 && (
                <div className="form-step">
                  <h3 className="step-heading">Budget Range</h3>
                  <p className="step-description">Select your budget range</p>
                  <div className="radio-grid">
                    {budgetRanges.map((budget) => (
                      <button
                        key={budget}
                        type="button"
                        className={`radio-button ${formData.budget === budget ? 'selected' : ''}`}
                        onClick={() => setFormData({ ...formData, budget })}
                      >
                        {budget}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 6: Details & Contact */}
              {step === 6 && (
                <div className="form-step">
                  <h3 className="step-heading">Project Details & Contact</h3>
                  <p className="step-description">Final information we need</p>
                  <div className="form-fields">
                    <div className="form-field">
                      <Label htmlFor="details">Project Description</Label>
                      <Textarea
                        id="details"
                        placeholder="Tell us about your project, vision, and any specific requirements..."
                        rows={4}
                        value={formData.details}
                        onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                      />
                    </div>
                    <div className="form-field">
                      <Label htmlFor="name">Your Name *</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-field">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-field">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="form-field checkbox-field">
                      <Checkbox
                        id="terms"
                        checked={formData.termsAccepted}
                        onCheckedChange={(checked) => setFormData({ ...formData, termsAccepted: checked })}
                      />
                      <Label htmlFor="terms" className="terms-label">
                        I agree to the terms and conditions and privacy policy *
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="form-navigation">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={handlePrev}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                )}
                
                {step < totalSteps ? (
                  <Button type="button" onClick={handleNext} className="ml-auto">
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="ml-auto cta-primary"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit Project'}
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientOnboarding;
