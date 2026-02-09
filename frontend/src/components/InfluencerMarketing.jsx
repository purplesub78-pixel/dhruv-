import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  Target, 
  Handshake, 
  Megaphone, 
  Video,
  TrendingUp
} from 'lucide-react';

const iconMap = {
  Target,
  Handshake,
  Megaphone,
  Video
};

const InfluencerMarketing = ({ services, onFindInfluencers }) => {
  return (
    <section className="influencer-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Influencer Marketing</h2>
          <p className="section-description">
            Connect your brand with the right creators who resonate with your audience. 
            We facilitate authentic partnerships that drive engagement and deliver measurable results.
          </p>
        </div>

        <div className="influencer-services-grid">
          {services.map((service) => {
            const Icon = iconMap[service.icon];
            return (
              <Card 
                key={service.id} 
                className="influencer-service-card"
              >
                <CardHeader>
                  <div className="influencer-service-icon">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="influencer-service-title">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="influencer-service-description">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="influencer-stats">
          <div className="stat-card">
            <TrendingUp className="stat-icon" />
            <h3 className="stat-value">2000+</h3>
            <p className="stat-label">Verified Influencers</p>
          </div>
          <div className="stat-card">
            <TrendingUp className="stat-icon" />
            <h3 className="stat-value">50M+</h3>
            <p className="stat-label">Combined Reach</p>
          </div>
          <div className="stat-card">
            <TrendingUp className="stat-icon" />
            <h3 className="stat-value">300+</h3>
            <p className="stat-label">Successful Campaigns</p>
          </div>
        </div>

        <div className="influencer-cta">
          <Button 
            size="lg" 
            className="cta-primary"
            onClick={onFindInfluencers}
          >
            Find Influencers
          </Button>
        </div>
      </div>
    </section>
  );
};

export default InfluencerMarketing;
