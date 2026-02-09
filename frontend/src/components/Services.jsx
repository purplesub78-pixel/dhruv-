import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { 
  Sparkles, 
  Camera, 
  TrendingUp, 
  Share2, 
  Music, 
  Film, 
  Wand2, 
  Briefcase 
} from 'lucide-react';

const iconMap = {
  Sparkles,
  Camera,
  TrendingUp,
  Share2,
  Music,
  Film,
  Wand2,
  Briefcase
};

const Services = ({ services, onServiceClick }) => {
  return (
    <section className="services-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Our Services</h2>
          <p className="section-description">
            From concept to creation, we deliver premium video production across all formats
          </p>
        </div>
        
        <div className="services-grid">
          {services.map((service) => {
            const Icon = iconMap[service.icon];
            return (
              <Card 
                key={service.id} 
                className="service-card"
                onClick={() => onServiceClick(service)}
              >
                <CardHeader>
                  <div 
                    className="service-icon"
                    style={{ backgroundColor: `${service.color}15` }}
                  >
                    <Icon 
                      className="h-6 w-6" 
                      style={{ color: service.color }}
                    />
                  </div>
                  <CardTitle className="service-card-title">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="service-card-description">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
