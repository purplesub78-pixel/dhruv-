import React from 'react';
import { Card, CardContent } from './ui/card';
import { Award, Target, Zap } from 'lucide-react';

const AboutUs = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Arjun Mehta",
      role: "Creative Director",
      description: "Vision & Strategy",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80"
    },
    {
      id: 2,
      name: "Priya Sharma",
      role: "Lead Producer",
      description: "Project Management",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80"
    },
    {
      id: 3,
      name: "Kabir Singh",
      role: "Director of Photography",
      description: "Cinematography & Lighting",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=80"
    },
    {
      id: 4,
      name: "Ananya Desai",
      role: "Lead Editor",
      description: "Post-Production",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80"
    },
    {
      id: 5,
      name: "Rohan Kapoor",
      role: "Brand Strategist",
      description: "Marketing & Campaigns",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&q=80"
    },
    {
      id: 6,
      name: "Zara Ahmed",
      role: "Motion Graphics Artist",
      description: "Animation & VFX",
      image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500&q=80"
    },
    {
      id: 7,
      name: "Vikram Reddy",
      role: "Sound Designer",
      description: "Audio & Music",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&q=80"
    },
    {
      id: 8,
      name: "Aisha Nair",
      role: "Talent Manager",
      description: "Models & Influencers",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&q=80"
    },
    {
      id: 9,
      name: "Rahul Malhotra",
      role: "Operations Head",
      description: "Logistics & Coordination",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&q=80"
    },
    {
      id: 10,
      name: "Isha Patel",
      role: "Client Success Manager",
      description: "Client Relations",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&q=80"
    }
  ];

  const values = [
    {
      icon: Target,
      title: "Vision-Driven",
      description: "Every frame tells a story. We craft visual narratives that resonate with your audience and drive measurable results."
    },
    {
      icon: Award,
      title: "Excellence First",
      description: "From concept to final cut, we obsess over quality. Premium production is not an option—it's our standard."
    },
    {
      icon: Zap,
      title: "Creative Innovation",
      description: "We blend cutting-edge techniques with timeless storytelling to create content that stands out in a crowded digital landscape."
    }
  ];

  return (
    <div className="about-us-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-content">
            <h1 className="about-hero-title">
              Where Stories
              <span className="about-hero-accent">Come to Life</span>
            </h1>
            <p className="about-hero-subtitle">
              Purple Aster Studio is a creative production house where vision meets execution. 
              We partner with brands, artists, and visionaries to craft cinematic experiences 
              that captivate audiences and deliver results.
            </p>
          </div>
        </div>
      </section>

      {/* Studio Story */}
      <section className="about-story">
        <div className="container">
          <div className="about-story-grid">
            <div className="about-story-content">
              <h2 className="about-section-title">Our Story</h2>
              <p className="about-paragraph">
                Founded with a passion for visual storytelling, Purple Aster Studio has evolved 
                into a full-service creative production house that serves brands, artists, and 
                organizations across industries. We don't just create content—we craft narratives 
                that resonate emotionally and drive tangible outcomes.
              </p>
              <p className="about-paragraph">
                Our approach combines technical excellence with artistic vision. Whether it's a 
                15-second social reel or a feature-length brand film, we bring the same level of 
                dedication, innovation, and cinematic quality to every project.
              </p>
              <p className="about-paragraph">
                From video production and influencer collaborations to model management and 
                comprehensive brand campaigns, we offer end-to-end creative solutions that scale 
                with your ambitions.
              </p>
            </div>
            <div className="about-story-image">
              <img 
                src="https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=800&q=80" 
                alt="Studio workspace"
                className="about-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-values">
        <div className="container">
          <h2 className="about-section-title-center">What Drives Us</h2>
          <div className="about-values-grid">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="value-card">
                  <CardContent className="value-card-content">
                    <div className="value-icon-wrapper">
                      <Icon className="value-icon" />
                    </div>
                    <h3 className="value-title">{value.title}</h3>
                    <p className="value-description">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-team">
        <div className="container">
          <div className="about-team-header">
            <h2 className="about-section-title-center">Meet Our Team</h2>
            <p className="about-team-subtitle">
              The creative minds behind every frame, every story, every moment
            </p>
          </div>
          <div className="team-grid">
            {teamMembers.map((member) => (
              <div key={member.id} className="team-card">
                <div className="team-image-wrapper">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="team-image"
                  />
                  <div className="team-overlay">
                    <p className="team-description">{member.description}</p>
                  </div>
                </div>
                <div className="team-info">
                  <h3 className="team-name">{member.name}</h3>
                  <p className="team-role">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="about-mission">
        <div className="container">
          <div className="mission-grid">
            <Card className="mission-card">
              <CardContent className="mission-content">
                <h3 className="mission-title">Our Mission</h3>
                <p className="mission-text">
                  To empower brands and creators with premium visual storytelling that drives 
                  engagement, builds trust, and delivers measurable results. We bridge the gap 
                  between creative vision and business objectives.
                </p>
              </CardContent>
            </Card>
            <Card className="mission-card">
              <CardContent className="mission-content">
                <h3 className="mission-title">Our Vision</h3>
                <p className="mission-text">
                  To become the leading creative production house known for cinematic excellence, 
                  innovative storytelling, and long-term partnerships that scale with our clients' 
                  growth and ambitions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
