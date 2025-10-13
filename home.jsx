import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  Hand, 
  Video, 
  BookOpen, 
  Shield, 
  Users, 
  MapPin, 
  BarChart3,
  ArrowRight,
  Play,
  MessageSquare,
  Globe,
  Settings,
  Eye,
  Heart,
  Zap
} from 'lucide-react';
import './home.css';
const GestureBridge = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo */}
          <div className="logo">
            <Hand className="logo-icon" />
            <span className="logo-text">GestureBridge</span>
          </div>

          {/* Desktop Menu */}
          <div className="menu-desktop">
            <a href="#" className="active">Home</a>
            <a href="#">Learn Signs</a>
            <a href="#">Communicate</a>
            <a href="#">Safety</a>
            <a href="http://localhost:5173/signup" 
               style={{ 
               backgroundColor: "blue", 
               color: "white", 
               padding: "10px 20px", 
               borderRadius: "8px", 
               textDecoration: "none" 
          }}> Login/Signup </a>
          </div>

          {/* Mobile menu button */}
          <div className="menu-mobile-toggle">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="menu-mobile">
            <a href="#" className="active">Home</a>
            <a href="#">Learn Signs</a>
            <a href="#">Communicate</a>
            <a href="#">Safety</a>
            <a href="#" className="btn-primary">Login/Signup</a>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <h1>Empowering the Deaf Community Through Technology</h1>
        <p>
          Real-time sign language recognition, learning, and safety in one platform.
        </p>
        <div className="hero-buttons">
          <button className="btn-primary">
            <BookOpen className="btn-icon" />
            Start Learning
          </button>
          <button className="btn-secondary">
            <Video className="btn-icon" />
            Try Interpreter
          </button>
        </div>
      </section>

      {/* Core Features */}
      <section className="features">
        <h2>Core Features</h2>
        <div className="feature-grid">
          {/* Deaf Users */}
          <div className="feature-card blue">
            <Hand className="feature-icon blue" />
            <h3>For Deaf Users</h3>
            <ul>
              <li><MessageSquare /> Real-time sign-to-text translation</li>
              <li><Video /> Video calls with hearing users</li>
              <li><BookOpen /> Learning portal with tutorials</li>
              <li><MapPin /> Location sharing for safety</li>
            </ul>
          </div>

          {/* Normal Users */}
          <div className="feature-card green">
            <Users className="feature-icon green" />
            <h3>For Normal Users</h3>
            <ul>
              <li><Globe /> Text-to-sign translation</li>
              <li><BookOpen /> Learn sign language via tutorials</li>
              <li><Video /> Video calls with deaf users</li>
              <li><Heart /> Bridge communication gaps</li>
            </ul>
          </div>

          {/* Admin */}
          <div className="feature-card purple">
            <Settings className="feature-icon purple" />
            <h3>For Admin</h3>
            <ul>
              <li><BarChart3 /> User dashboard & analytics</li>
              <li><Play /> Upload & manage learning videos</li>
              <li><MapPin /> Track users on live map</li>
              <li><Eye /> Monitor system performance</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-icon blue"><Hand /></div>
            <h3>Sign</h3>
            <p>Deaf user communicates using sign language</p>
          </div>
          <ArrowRight className="arrow" />
          <div className="step">
            <div className="step-icon green"><Zap /></div>
            <h3>AI Interpreter</h3>
            <p>Real-time AI translation and processing</p>
          </div>
          <ArrowRight className="arrow" />
          <div className="step">
            <div className="step-icon purple"><MessageSquare /></div>
            <h3>Text/Video</h3>
            <p>Output delivered to hearing user</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-top">
          <div className="logo">
            <Hand className="logo-icon" />
            <span className="logo-text">GestureBridge</span>
          </div>
          <p>
            Built to bridge communication gaps and ensure safety for the deaf community.
          </p>
        </div>
        <div className="footer-links">
          <a href="#">About Us</a>
          <a href="#">Contact</a>
          <a href="#">Privacy Policy</a>
        </div>
        <div className="footer-bottom">
          © 2024 GestureBridge. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default GestureBridge;
