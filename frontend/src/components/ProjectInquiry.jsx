import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2 
} from 'lucide-react';
import { toast } from 'sonner';

const ProjectInquiry = ({ 
  services, 
  projectGoals, 
  platforms, 
  timelines, 
  budgetRanges 
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    selectedServices: [],
    projectGoal: '',
    platform: '',
    timeline: '',
    budget: '',
    projectDetails: '',
    name: '',
    email: '',
    phone: ''
  });

  const totalSteps = 6;

  const handleServiceToggle = (serviceTitle) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceTitle)
        ? prev.selectedServices.filter(s => s !== serviceTitle)
        : [...prev.selectedServices, serviceTitle]
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Please fill in your contact details');
      return;
    }
    console.log('Project Inquiry Submitted:', formData);
    toast.success('Project inquiry submitted successfully! We\'ll be in touch soon.');
    // Reset form
    setFormData({
      selectedServices: [],
      projectGoal: '',
      platform: '',
      timeline: '',
      budget: '',
      projectDetails: '',
      name: '',
      email: '',
      phone: ''
    });
    setStep(1);
  };

  return (
    <section className="inquiry-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Start Your Project</h2>
          <p className="section-description">
            Tell us about your vision and we'll bring it to life
          </p>
        </div>

        <Card className="inquiry-form-card">
          <CardHeader>
            <div className="progress-bar">
              {[...Array(totalSteps)].map((_, index) => (
                <div
                  key={index}
                  className={`progress-step ${
                    index + 1 <= step ? 'active' : ''
                  }`}
                />
              ))}
            </div>
            <CardTitle className="inquiry-step-title">
              Step {step} of {totalSteps}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit}>
              {/* Step 1: Select Services */}
              {step === 1 && (
                <div className="form-step">
                  <h3 className="step-heading">Select Video Services</h3>
                  <p className="step-description">Choose one or more services you're interested in</p>
                  <div className="checkbox-grid">
                    {services.map((service) => (
                      <div key={service.id} className="checkbox-item">
                        <Checkbox
                          id={`service-${service.id}`}
                          checked={formData.selectedServices.includes(service.title)}
                          onCheckedChange={() => handleServiceToggle(service.title)}
                        />
                        <Label 
                          htmlFor={`service-${service.id}`}
                          className="checkbox-label"
                        >
                          {service.title}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Project Goal */}
              {step === 2 && (
                <div className="form-step">
                  <h3 className="step-heading">What's Your Project Goal?</h3>
                  <p className="step-description">Help us understand what you want to achieve</p>
                  <div className="radio-grid">
                    {projectGoals.map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        className={`radio-button ${
                          formData.projectGoal === goal ? 'selected' : ''
                        }`}
                        onClick={() => setFormData({ ...formData, projectGoal: goal })}
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
                  <h3 className="step-heading">Where Will This Be Published?</h3>
                  <p className="step-description">Select your primary platform</p>
                  <div className="radio-grid">
                    {platforms.map((platform) => (
                      <button
                        key={platform}
                        type="button"
                        className={`radio-button ${
                          formData.platform === platform ? 'selected' : ''
                        }`}
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
                  <h3 className="step-heading">What's Your Timeline?</h3>
                  <p className="step-description">When do you need the final video?</p>
                  <div className="radio-grid">
                    {timelines.map((timeline) => (
                      <button
                        key={timeline}
                        type="button"
                        className={`radio-button ${
                          formData.timeline === timeline ? 'selected' : ''
                        }`}
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
                  <h3 className="step-heading">What's Your Budget Range?</h3>
                  <p className="step-description">Select the range that fits your project</p>
                  <div className="radio-grid">
                    {budgetRanges.map((budget) => (
                      <button
                        key={budget}
                        type="button"
                        className={`radio-button ${
                          formData.budget === budget ? 'selected' : ''
                        }`}
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
                  <h3 className="step-heading">Final Details</h3>
                  <p className="step-description">Tell us more about your project and how to reach you</p>
                  <div className="form-fields">
                    <div className="form-field">
                      <Label htmlFor="projectDetails">Project Details</Label>
                      <Textarea
                        id="projectDetails"
                        placeholder="Describe your vision, specific requirements, or any references..."
                        rows={4}
                        value={formData.projectDetails}
                        onChange={(e) => setFormData({ ...formData, projectDetails: e.target.value })}
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
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="form-navigation">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrev}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                )}
                
                {step < totalSteps ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="ml-auto"
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="ml-auto cta-primary"
                  >
                    Submit Project
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ProjectInquiry;
