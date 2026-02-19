import { useRef, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import "./pages.css";
import "./dashboard.css";
import { Toaster } from "./components/ui/sonner";
import Header from "./components/Header";
import Hero from "./components/Hero";
import HireOptions from "./components/HireOptions";
import Services from "./components/Services";
import ServicesPage from "./components/ServicesPage";
import AboutUs from "./components/AboutUs";
import InfluencerMarketing from "./components/InfluencerMarketing";
import ModelAgency from "./components/ModelAgency";
import ProjectInquiry from "./components/ProjectInquiry";
import Portfolio from "./components/Portfolio";
import About from "./components/About";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Login from "./components/Login";
import AuthCallback from "./components/AuthCallback";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./components/Dashboard";
import ClientOnboarding from "./components/ClientOnboarding";
import PaymentPage from "./components/PaymentPage";
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
  return (
    <BrowserRouter>
      <div className="App">
        <Toaster />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/services" element={<ServicesPageRoute />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<AuthCallback />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoute>
                <ClientOnboarding />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/payment/:projectId" 
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

// HomePage Component with all sections
const HomePage = () => {
  const [currentPage, setCurrentPage] = useState('home');
  
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
    scrollToSection('inquiry');
  };

  const handleHireOptionClick = (route) => {
    scrollToSection(route);
  };

  const handleFindInfluencers = () => {
    scrollToSection('inquiry');
  };

  const handleBookModel = () => {
    scrollToSection('inquiry');
  };

  const handleGetQuote = () => {
    scrollToSection('inquiry');
  };

  return (
    <>
      <Header onNavigate={scrollToSection} currentPage={currentPage} />
      
      <main>
        <div ref={heroRef}>
          <Hero 
            onGetQuote={handleGetQuote}
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
    </>
  );
};

// About Us Page Route
const AboutUsPage = () => {
  return (
    <>
      <AboutUs />
      <Footer />
    </>
  );
};

// Services Page Route
const ServicesPageRoute = () => {
  const handleGetQuote = () => {
    window.location.href = '/#inquiry';
  };

  return (
    <>
      <ServicesPage onGetQuote={handleGetQuote} />
      <Footer />
    </>
  );
};

export default App;
