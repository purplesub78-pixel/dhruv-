import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Ruler, Briefcase, Mail } from 'lucide-react';

const ModelAgency = ({ models, onBookModel }) => {
  const [filter, setFilter] = useState('All');
  const [selectedModel, setSelectedModel] = useState(null);

  const categories = ['All', ...new Set(models.map(m => m.category))];

  const filteredModels = filter === 'All' 
    ? models 
    : models.filter(m => m.category === filter);

  return (
    <section className="model-agency-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Model Agency</h2>
          <p className="section-description">
            Showcase professional models for fashion, commercials, music videos, and brand shoots. 
            Our diverse roster of talent brings your creative vision to life.
          </p>
        </div>

        {/* Category Filters */}
        <div className="model-filters">
          {categories.map((category) => (
            <Button
              key={category}
              variant={filter === category ? 'default' : 'outline'}
              onClick={() => setFilter(category)}
              className="filter-button"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Model Grid */}
        <div className="model-grid">
          {filteredModels.map((model) => (
            <Card 
              key={model.id} 
              className="model-card"
              onClick={() => setSelectedModel(model)}
            >
              <div className="model-image-wrapper">
                <img 
                  src={model.image} 
                  alt={model.name}
                  className="model-image"
                />
                <div className="model-overlay">
                  <Button className="view-profile-button">
                    View Profile
                  </Button>
                </div>
                <Badge className="model-badge">{model.category}</Badge>
              </div>
              <CardContent className="model-content">
                <h3 className="model-name">{model.name}</h3>
                <div className="model-details">
                  <span className="model-detail">
                    <Ruler className="h-4 w-4" />
                    {model.height}
                  </span>
                  <span className="model-detail">
                    <Briefcase className="h-4 w-4" />
                    {model.experience}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="model-cta">
          <Button 
            size="lg" 
            className="cta-primary"
            onClick={onBookModel}
          >
            Book a Model
          </Button>
        </div>
      </div>

      {/* Model Detail Modal */}
      <Dialog open={!!selectedModel} onOpenChange={() => setSelectedModel(null)}>
        <DialogContent className="model-modal">
          <DialogHeader>
            <DialogTitle>{selectedModel?.name}</DialogTitle>
          </DialogHeader>
          <div className="model-modal-content">
            <img 
              src={selectedModel?.image} 
              alt={selectedModel?.name}
              className="model-modal-image"
            />
            <div className="model-modal-details">
              <Badge className="mb-3">{selectedModel?.category}</Badge>
              <div className="model-info-grid">
                <div className="model-info-item">
                  <Ruler className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="model-info-label">Height</p>
                    <p className="model-info-value">{selectedModel?.height}</p>
                  </div>
                </div>
                <div className="model-info-item">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="model-info-label">Experience</p>
                    <p className="model-info-value">{selectedModel?.experience}</p>
                  </div>
                </div>
              </div>
              <Button 
                className="w-full mt-6 cta-primary"
                onClick={() => {
                  onBookModel();
                  setSelectedModel(null);
                }}
              >
                <Mail className="mr-2 h-4 w-4" />
                Book {selectedModel?.name}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ModelAgency;
