import React, { useState } from 'react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { 
  Film, 
  Smartphone, 
  Users, 
  Calendar, 
  Scissors, 
  Camera,
  Briefcase,
  ShoppingBag,
  User,
  Megaphone,
  PartyPopper,
  Clapperboard,
  Music,
  ImageIcon,
  Palette,
  BarChart3
} from 'lucide-react';

const ServicesPage = ({ onGetQuote }) => {
  const [activeCategory, setActiveCategory] = useState(null);

  const services = [
    {
      id: 1,
      category: "Brand & Commercial Videos",
      icon: Film,
      color: "#7C3AED",
      services: [
        "Brand Films & Corporate Profile Videos",
        "Product Showcase Videos",
        "Digital Ad Films & Commercials",
        "Testimonial & Case Study Videos"
      ]
    },
    {
      id: 2,
      category: "Content Marketing Videos",
      icon: Smartphone,
      color: "#EC4899",
      services: [
        "Instagram Reels & Short-Form Content",
        "YouTube Videos & Series",
        "Story-Based Content for Social Media",
        "Educational & Tutorial Videos"
      ]
    },
    {
      id: 3,
      category: "Influencer Marketing Production",
      icon: Users,
      color: "#F59E0B",
      services: [
        "Influencer Shoot Coordination",
        "Content Direction & Creative Strategy",
        "High-Quality Reels & Shorts",
        "Campaign-Based Video Production"
      ]
    },
    {
      id: 4,
      category: "Event Video Production",
      icon: Calendar,
      color: "#10B981",
      services: [
        "Event Coverage & Documentation",
        "Aftermovies & Highlight Reels",
        "Launch Events & Conferences",
        "Corporate Events & Seminars"
      ]
    },
    {
      id: 5,
      category: "Post-Production Services",
      icon: Scissors,
      color: "#8B5CF6",
      services: [
        "Video Editing & Assembly",
        "Color Correction & Grading",
        "Sound Design & Audio Mixing",
        "Motion Graphics & Subtitles"
      ]
    },
    {
      id: 6,
      category: "Photography Services",
      icon: Camera,
      color: "#EF4444",
      services: [
        "Brand & Product Photography",
        "Event Photography & Coverage",
        "BTS (Behind-the-Scenes) Content",
        "Lifestyle & Editorial Shoots"
      ]
    },
    {
      id: 7,
      category: "Brand Photography",
      icon: Briefcase,
      color: "#3B82F6",
      services: [
        "Office & Workspace Photography",
        "Team Portraits & Headshots",
        "Corporate Culture & Lifestyle Shots",
        "Company Profile Photography"
      ]
    },
    {
      id: 8,
      category: "Product & E-commerce Photography",
      icon: ShoppingBag,
      color: "#06B6D4",
      services: [
        "Clean Product Images with White Background",
        "Lifestyle Product Photography",
        "Detail & Macro Shots",
        "Creative & Styled Product Setups"
      ]
    },
    {
      id: 9,
      category: "Personal Branding Photography",
      icon: User,
      color: "#F97316",
      services: [
        "Founder & Entrepreneur Portraits",
        "Influencer Content Photography",
        "Social-Media-Ready Images",
        "Editorial-Style Personal Shoots"
      ]
    },
    {
      id: 10,
      category: "Commercial & Marketing Photography",
      icon: Megaphone,
      color: "#14B8A6",
      services: [
        "Campaign Photography for Ads",
        "Website Hero Images & Banners",
        "Social Media Creatives",
        "Marketing & Promotional Visuals"
      ]
    },
    {
      id: 11,
      category: "Event & BTS Photography",
      icon: PartyPopper,
      color: "#A855F7",
      services: [
        "Corporate Event Coverage",
        "Launch Events & Product Reveals",
        "Behind-the-Scenes Content",
        "Candid & Moment Captures"
      ]
    },
    {
      id: 12,
      category: "Film BTS (Behind-the-Scenes) Shoot",
      icon: Clapperboard,
      color: "#84CC16",
      services: [
        "On-Set BTS Photography & Video",
        "BTS Reels & Short Content",
        "Crew & Cast Moments",
        "Production Process Documentation"
      ]
    },
    {
      id: 13,
      category: "Music Video Production",
      icon: Music,
      color: "#F43F5E",
      services: [
        "Concept Development & Visual Planning",
        "Cinematic Video Shoot with Pro Lighting",
        "Multi-Camera Setup & Direction",
        "Editing, Color Grading & Final Delivery"
      ],
      deliverables: [
        "Full HD Music Video",
        "Reels & Teaser Cuts",
        "YouTube & Social Media Exports"
      ]
    },
    {
      id: 14,
      category: "Film Poster Shoot",
      icon: ImageIcon,
      color: "#6366F1",
      services: [
        "Creative Concept & Moodboard",
        "Studio or Location Photography",
        "Professional Lighting Setup",
        "Poster-Ready Retouching & Design"
      ]
    },
    {
      id: 15,
      category: "Graphic Design Services",
      icon: Palette,
      color: "#EC4899",
      services: [
        "Brand Identity Design (Logo, Colors, Fonts)",
        "Marketing & Promotional Creatives",
        "Film & Music Posters",
        "Social Media Graphics & Feed Design",
        "Content Marketing Graphics"
      ]
    },
    {
      id: 16,
      category: "Meta Ads Services",
      icon: BarChart3,
      color: "#8B5CF6",
      services: [
        "Strategy & Audience Research",
        "Ad Creative Production (Video & Static)",
        "Campaign Setup & Management",
        "Performance Tracking & Optimization"
      ],
      deliverables: [
        "Live Ad Campaigns",
        "Video & Design Creatives",
        "Performance Reports",
        "Lead & Sales Tracking"
      ]
    }
  ];

  return (
    <div className="services-page">
      {/* Hero Section */}
      <section className="services-hero">
        <div className="container">
          <div className="services-hero-content">
            <h1 className="services-hero-title">
              Full-Service
              <span className="services-hero-accent">Creative Production</span>
            </h1>
            <p className="services-hero-subtitle">
              From concept to execution, we deliver premium video production, photography, 
              design, and marketing services that elevate your brand and drive results.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="services-main">
        <div className="container">
          <div className="services-intro">
            <h2 className="services-section-title">What We Do</h2>
            <p className="services-section-description">
              Our comprehensive suite of creative services is designed to meet every need of 
              modern brands, artists, and businesses. Choose your service or let us craft a 
              custom solution for you.
            </p>
          </div>

          <div className="services-accordion-wrapper">
            <Accordion type="single" collapsible className="services-accordion">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <AccordionItem 
                    key={service.id} 
                    value={`service-${service.id}`}
                    className="service-accordion-item"
                  >
                    <AccordionTrigger className="service-accordion-trigger">
                      <div className="service-trigger-content">
                        <div 
                          className="service-trigger-icon"
                          style={{ 
                            backgroundColor: `${service.color}15`,
                            color: service.color 
                          }}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="service-trigger-text">
                          <h3 className="service-trigger-title">{service.category}</h3>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="service-accordion-content">
                      <div className="service-details">
                        <ul className="service-list">
                          {service.services.map((item, index) => (
                            <li key={index} className="service-list-item">
                              {item}
                            </li>
                          ))}
                        </ul>
                        {service.deliverables && (
                          <div className="service-deliverables">
                            <h4 className="deliverables-title">Deliverables:</h4>
                            <ul className="deliverables-list">
                              {service.deliverables.map((deliverable, index) => (
                                <li key={index} className="deliverable-item">
                                  {deliverable}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <Button 
                          className="service-cta"
                          style={{ backgroundColor: service.color }}
                          onClick={onGetQuote}
                        >
                          Get a Quote
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Quick Service Cards */}
      <section className="services-quick">
        <div className="container">
          <h2 className="services-section-title-center">Popular Services</h2>
          <div className="services-quick-grid">
            {services.slice(0, 6).map((service) => {
              const Icon = service.icon;
              return (
                <Card 
                  key={service.id}
                  className="quick-service-card"
                  style={{ borderTop: `3px solid ${service.color}` }}
                >
                  <CardContent className="quick-service-content">
                    <div 
                      className="quick-service-icon"
                      style={{ 
                        backgroundColor: `${service.color}15`,
                        color: service.color 
                      }}
                    >
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="quick-service-title">{service.category}</h3>
                    <p className="quick-service-count">
                      {service.services.length} services
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="services-cta">
        <div className="container">
          <div className="services-cta-content">
            <h2 className="services-cta-title">Ready to Start Your Project?</h2>
            <p className="services-cta-description">
              Let's discuss your vision and create something extraordinary together.
            </p>
            <div className="services-cta-buttons">
              <Button 
                size="lg" 
                className="cta-primary"
                onClick={onGetQuote}
              >
                Get a Free Quote
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="cta-secondary"
              >
                View Our Work
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
