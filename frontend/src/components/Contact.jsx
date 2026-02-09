import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'sonner';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    console.log('Contact Form Submitted:', formData);
    toast.success('Message sent! We\'ll get back to you within 24 hours.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <section className="contact-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Let's Work Together</h2>
          <p className="section-description">
            Ready to bring your vision to life? Drop us a message and let's create something extraordinary.
          </p>
        </div>

        <div className="contact-grid">
          {/* Contact Form */}
          <Card className="contact-form-card">
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-field">
                  <Label htmlFor="contact-name">Your Name *</Label>
                  <Input
                    id="contact-name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <Label htmlFor="contact-email">Email Address *</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <Label htmlFor="contact-phone">Phone Number</Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <Label htmlFor="contact-message">Your Message *</Label>
                  <Textarea
                    id="contact-message"
                    placeholder="Tell us about your project..."
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full cta-primary">
                  Send Message
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="contact-info">
            <Card className="contact-info-card">
              <CardContent className="contact-info-content">
                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="contact-info-title">Email</h4>
                    <p className="contact-info-text">hello@purpleasterstudio.com</p>
                  </div>
                </div>
                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="contact-info-title">Phone</h4>
                    <p className="contact-info-text">+91 98765 43210</p>
                  </div>
                </div>
                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="contact-info-title">Location</h4>
                    <p className="contact-info-text">Mumbai, Maharashtra, India</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="contact-cta">
              <h3 className="contact-cta-title">Prefer a call?</h3>
              <p className="contact-cta-text">
                Book a free 30-minute consultation to discuss your project
              </p>
              <Button variant="outline" className="w-full">
                Schedule a Call
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
