import { useRef } from "react";
import "./App.css";
import { Toaster } from "./components/ui/sonner";
import Header from "./components/Header";
import Hero from "./components/Hero";
import HireOptions from "./components/HireOptions";
import Services from "./components/Services";
import InfluencerMarketing from "./components/InfluencerMarketing";
import ModelAgency from "./components/ModelAgency";
import ProjectInquiry from "./components/ProjectInquiry";
import Portfolio from "./components/Portfolio";
import About from "./components/About";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import { 
  services, 
  portfolioVideos, 
  projectGoals, 
  platforms, 
  timelines, 
  budgetRanges,
  hireOptions,
  influencerServices,
  models
} from "./mock";

function App() {
  const heroRef = useRef(null);
  const servicesRef = useRef(null);
  const inquiryRef = useRef(null);
  const portfolioRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

  const scrollToSection = (target) => {
    const refs = {
      home: heroRef,
      services: servicesRef,
      inquiry: inquiryRef,
      portfolio: portfolioRef,
      about: aboutRef,
      contact: contactRef
    };

    const ref = refs[target];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleServiceClick = (service) => {
    console.log('Service clicked:', service);
    scrollToSection('inquiry');
  };

  return (
    <div className="App">
      <Header onNavigate={scrollToSection} />
      
      <main>
        <div ref={heroRef}>
          <Hero 
            onGetQuote={() => scrollToSection('inquiry')}
            onViewWork={() => scrollToSection('portfolio')}
          />
        </div>
        
        <div ref={servicesRef}>
          <Services 
            services={services}
            onServiceClick={handleServiceClick}
          />
        </div>
        
        <div ref={inquiryRef}>
          <ProjectInquiry
            services={services}
            projectGoals={projectGoals}
            platforms={platforms}
            timelines={timelines}
            budgetRanges={budgetRanges}
          />
        </div>
        
        <div ref={portfolioRef}>
          <Portfolio videos={portfolioVideos} />
        </div>
        
        <div ref={aboutRef}>
          <About />
        </div>
        
        <div ref={contactRef}>
          <Contact />
        </div>
      </main>
      
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;
