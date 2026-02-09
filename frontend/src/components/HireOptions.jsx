import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Film, Users, Star, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

const iconMap = {
  Film,
  Users,
  Star
};

const HireOptions = ({ options, onOptionClick }) => {
  return (
    <section className="hire-options-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">What Do You Need?</h2>
          <p className="section-description">
            Choose the service that fits your creative vision
          </p>
        </div>

        <div className="hire-options-grid">
          {options.map((option) => {
            const Icon = iconMap[option.icon];
            return (
              <Card 
                key={option.id} 
                className="hire-option-card"
                onClick={() => onOptionClick(option.route)}
                style={{ 
                  borderTop: `4px solid ${option.color}`,
                  cursor: 'pointer'
                }}
              >
                <CardHeader>
                  <div 
                    className="hire-option-icon"
                    style={{ 
                      backgroundColor: `${option.color}15`,
                      color: option.color
                    }}
                  >
                    <Icon className="h-10 w-10" />
                  </div>
                  <CardTitle className="hire-option-title">
                    {option.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="hire-option-services">
                    {option.services.map((service, index) => (
                      <li key={index} className="hire-option-service-item">
                        {service}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="hire-option-button w-full mt-6"
                    style={{ backgroundColor: option.color }}
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HireOptions;
