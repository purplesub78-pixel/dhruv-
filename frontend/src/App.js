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
  const hireOptionsRef = useRef(null);
  const servicesRef = useRef(null);
  const influencersRef = useRef(null);
  const modelsRef = useRef(null);
  const inquiryRef = useRef(null);
  const portfolioRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

  const scrollToSection = (target) => {
    const refs = {
      home: heroRef,
      hireOptions: hireOptionsRef,
      services: servicesRef,
      influencers: influencersRef,
      models: modelsRef,
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

  const handleHireOptionClick = (route) => {
    console.log('Hire option clicked:', route);
    scrollToSection(route);
  };

  const handleFindInfluencers = () => {
    console.log('Find influencers clicked');
    scrollToSection('inquiry');
  };

  const handleBookModel = () => {
    console.log('Book model clicked');
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

        <div ref={hireOptionsRef}>
          <HireOptions 
            options={hireOptions}
            onOptionClick={handleHireOptionClick}
          />
        </div>
        
        <div ref={servicesRef}>
          <Services 
            services={services}
            onServiceClick={handleServiceClick}
          />
        </div>

        <div ref={influencersRef}>
          <InfluencerMarketing 
            services={influencerServices}
            onFindInfluencers={handleFindInfluencers}
          />
        </div>

        <div ref={modelsRef}>
          <ModelAgency 
            models={models}
            onBookModel={handleBookModel}
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
