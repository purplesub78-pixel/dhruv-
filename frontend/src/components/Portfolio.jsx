import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Play, X } from 'lucide-react';

const Portfolio = ({ videos }) => {
  const [filter, setFilter] = useState('All');
  const [selectedVideo, setSelectedVideo] = useState(null);

  const categories = ['All', ...new Set(videos.map(v => v.category))];

  const filteredVideos = filter === 'All' 
    ? videos 
    : videos.filter(v => v.category === filter);

  return (
    <section className="portfolio-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Our Work</h2>
          <p className="section-description">
            A showcase of stories we've brought to life
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="portfolio-filters">
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

        {/* Video Grid */}
        <div className="portfolio-grid">
          {filteredVideos.map((video) => (
            <Card 
              key={video.id} 
              className="portfolio-card"
              onClick={() => setSelectedVideo(video)}
            >
              <div className="portfolio-thumbnail">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="portfolio-image"
                />
                <div className="portfolio-overlay">
                  <Play className="play-icon" />
                </div>
                <Badge className="portfolio-badge">{video.category}</Badge>
              </div>
              <CardContent className="portfolio-content">
                <h3 className="portfolio-title">{video.title}</h3>
                <p className="portfolio-description">{video.description}</p>
                <div className="portfolio-meta">
                  <span className="portfolio-client">{video.client}</span>
                  <span className="portfolio-duration">{video.duration}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="video-modal">
          <DialogHeader>
            <DialogTitle>{selectedVideo?.title}</DialogTitle>
          </DialogHeader>
          <div className="video-container">
            <iframe
              width="100%"
              height="400"
              src={selectedVideo?.videoUrl}
              title={selectedVideo?.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="video-details">
            <p>{selectedVideo?.description}</p>
            <div className="video-meta">
              <Badge>{selectedVideo?.category}</Badge>
              <span>Client: {selectedVideo?.client}</span>
              <span>Duration: {selectedVideo?.duration}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Portfolio;
