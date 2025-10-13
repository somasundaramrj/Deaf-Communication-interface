import React, { useState } from 'react';
import { AlertTriangle, Phone, MessageSquare, Eye, Users, Home, Car, Flame, Zap, Bell, Video, Shield } from 'lucide-react';
import './safety.css';

export default function DeafSafetyPage() {
  const [activeSection, setActiveSection] = useState('emergency');

  const emergencyContacts = [
    { service: 'Emergency (Text)', number: '911 (Text-to-911)', icon: MessageSquare },
    { service: 'National Relay Service', number: '711', icon: Phone },
    { service: 'Video Relay Service', number: 'VRS Provider', icon: Video }
  ];

  const homeSafety = [
    {
      title: 'Visual Smoke Alarms',
      description: 'Install smoke detectors with strobe lights that flash to alert you of fire. Place them in bedrooms, hallways, and common areas.',
      icon: Flame,
      tips: ['Test monthly', 'Replace batteries yearly', 'Install flashing lights']
    },
    {
      title: 'Vibrating Alert Systems',
      description: 'Use vibrating devices under pillows or mattresses that activate when alarms sound.',
      icon: Bell,
      tips: ['Connects to smoke alarms', 'Doorbell notifications', 'Baby cry alerts']
    },
    {
      title: 'Visual Doorbell',
      description: 'Install doorbell systems with flashing lights throughout your home.',
      icon: Home,
      tips: ['Multiple light locations', 'Wireless options available', 'Video doorbell recommended']
    },
    {
      title: 'Carbon Monoxide Detector',
      description: 'Use CO detectors with visual and vibrating alerts for this odorless, invisible gas.',
      icon: AlertTriangle,
      tips: ['Place near bedrooms', 'Test regularly', 'Visual display essential']
    }
  ];

  const publicSafety = [
    {
      title: 'Emergency Communication Card',
      description: 'Carry a card stating "I am Deaf/Hard of Hearing" with emergency contact information.',
      icon: MessageSquare,
      tips: ['Keep in wallet', 'Include preferred communication', 'List emergency contacts']
    },
    {
      title: 'Vehicle Safety',
      description: 'Use wide-angle mirrors and be extra vigilant. Consider dashboard cameras.',
      icon: Car,
      tips: ['Extra mirrors for blind spots', 'Dashboard camera for evidence', 'Visual alert for engine issues']
    },
    {
      title: 'Workplace Safety',
      description: 'Ensure your workplace has visual fire alarms and emergency notification systems.',
      icon: Shield,
      tips: ['Request visual alarms', 'Inform security of needs', 'Know evacuation routes']
    },
    {
      title: 'Public Awareness',
      description: 'In crowded places, stay aware of visual emergency signals and exit signs.',
      icon: Eye,
      tips: ['Note exit locations', 'Watch for crowd movements', 'Stay near visual displays']
    }
  ];

  const emergencyPrep = [
    {
      title: 'Emergency Kit Essentials',
      items: [
        'Flashlight with extra batteries',
        'Notepad and pens for communication',
        'List of emergency contacts',
        'Copy of important documents',
        'Charged portable battery pack',
        'Emergency communication cards',
        'Whistle (for attracting attention)',
        'Battery-powered weather radio with text display'
      ]
    },
    {
      title: 'Communication Plan',
      items: [
        'Register for local emergency text alerts',
        'Share your communication needs with neighbors',
        'Establish a buddy system',
        'Keep family contact list updated',
        'Download emergency apps with visual alerts',
        'Know location of nearest hospitals',
        'Save VRS contact information',
        'Create a family meeting point'
      ]
    }
  ];

  return (
    <div className="deaf-safety-container">
      <header className="deaf-safety-header">
        <div className="header-content">
          <Shield className="header-icon" size={48} />
          <div>
            <h1>Safety Information for the Deaf Community</h1>
            <p>Essential safety guidelines and resources designed for deaf and hard of hearing individuals</p>
          </div>
        </div>
      </header>

      <nav className="deaf-safety-nav">
        <button 
          className={activeSection === 'emergency' ? 'active' : ''}
          onClick={() => setActiveSection('emergency')}
        >
          <AlertTriangle size={20} />
          Emergency Contacts
        </button>
        <button 
          className={activeSection === 'home' ? 'active' : ''}
          onClick={() => setActiveSection('home')}
        >
          <Home size={20} />
          Home Safety
        </button>
        <button 
          className={activeSection === 'public' ? 'active' : ''}
          onClick={() => setActiveSection('public')}
        >
          <Users size={20} />
          Public Safety
        </button>
        <button 
          className={activeSection === 'prep' ? 'active' : ''}
          onClick={() => setActiveSection('prep')}
        >
          <Shield size={20} />
          Emergency Prep
        </button>
      </nav>

      <main className="deaf-safety-main">
        {activeSection === 'emergency' && (
          <section className="content-section">
            <h2>Emergency Contact Information</h2>
            <div className="emergency-alert">
              <AlertTriangle size={32} />
              <div>
                <strong>TEXT-TO-911 is available in most areas!</strong>
                <p>If you cannot make a voice call, you can text 911 in an emergency. Simply send a text message to 911 with your location and emergency details.</p>
              </div>
            </div>

            <div className="cards-grid">
              {emergencyContacts.map((contact, idx) => (
                <div key={idx} className="emergency-card">
                  <contact.icon size={40} className="card-icon" />
                  <h3>{contact.service}</h3>
                  <p className="contact-number">{contact.number}</p>
                </div>
              ))}
            </div>

            <div className="info-box">
              <h3>How to Use Text-to-911</h3>
              <ol>
                <li>Enter 911 in the "To" field</li>
                <li>Include your exact location (address, cross streets, landmarks)</li>
                <li>Briefly describe the emergency</li>
                <li>Keep messages short and simple</li>
                <li>Do not use abbreviations or slang</li>
                <li>Keep your phone nearby to receive return messages</li>
              </ol>
            </div>

            <div className="info-box warning-box">
              <h3>Important: Register for Local Emergency Alerts</h3>
              <p>Contact your local emergency services to register for text-based emergency notifications. Many areas offer special alert systems for deaf residents.</p>
            </div>
          </section>
        )}

        {activeSection === 'home' && (
          <section className="content-section">
            <h2>Home Safety Equipment & Guidelines</h2>
            <p className="section-intro">Essential safety devices and practices for a secure home environment</p>

            <div className="safety-items-grid">
              {homeSafety.map((item, idx) => (
                <div key={idx} className="safety-item-card">
                  <div className="card-header-icon">
                    <item.icon size={36} />
                  </div>
                  <h3>{item.title}</h3>
                  <p className="item-description">{item.description}</p>
                  <div className="tips-section">
                    <strong>Key Points:</strong>
                    <ul>
                      {item.tips.map((tip, tipIdx) => (
                        <li key={tipIdx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            <div className="important-notice">
              <Zap size={28} />
              <div>
                <h3>ADA Requirements</h3>
                <p>Under the Americans with Disabilities Act, landlords must allow you to install visual alert systems. Many local fire departments offer free or discounted visual smoke alarms for deaf residents.</p>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'public' && (
          <section className="content-section">
            <h2>Public Safety & Awareness</h2>
            <p className="section-intro">Stay safe when you're away from home with these important guidelines</p>

            <div className="safety-items-grid">
              {publicSafety.map((item, idx) => (
                <div key={idx} className="safety-item-card">
                  <div className="card-header-icon">
                    <item.icon size={36} />
                  </div>
                  <h3>{item.title}</h3>
                  <p className="item-description">{item.description}</p>
                  <div className="tips-section">
                    <strong>Best Practices:</strong>
                    <ul>
                      {item.tips.map((tip, tipIdx) => (
                        <li key={tipIdx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            <div className="info-box">
              <h3>Interacting with Law Enforcement</h3>
              <p><strong>Keep your hands visible</strong> when approached by police. You can:</p>
              <ul>
                <li>Point to your ears and mouth to indicate you are deaf</li>
                <li>Show your emergency communication card</li>
                <li>Request an interpreter</li>
                <li>Use your phone to type and communicate</li>
                <li>Ask for written instructions</li>
              </ul>
            </div>
          </section>
        )}

        {activeSection === 'prep' && (
          <section className="content-section">
            <h2>Emergency Preparedness</h2>
            <p className="section-intro">Be ready for any emergency with proper planning and supplies</p>

            {emergencyPrep.map((section, idx) => (
              <div key={idx} className="prep-section">
                <h3>{section.title}</h3>
                <div className="checklist">
                  {section.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="checklist-item">
                      <input type="checkbox" id={`item-${idx}-${itemIdx}`} />
                      <label htmlFor={`item-${idx}-${itemIdx}`}>{item}</label>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="resources-section">
              <h3>Additional Resources</h3>
              <div className="resource-links">
                <div className="resource-card">
                  <h4>National Association of the Deaf</h4>
                  <p>Advocacy, resources, and emergency preparedness information</p>
                </div>
                <div className="resource-card">
                  <h4>Local Fire Department</h4>
                  <p>Free home safety inspections and visual alarm programs</p>
                </div>
                <div className="resource-card">
                  <h4>FEMA Disability Resources</h4>
                  <p>Emergency planning specifically for people with disabilities</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="deaf-safety-footer">
        <p><strong>Remember:</strong> Your safety is a priority. Don't hesitate to advocate for your communication needs in any situation.</p>
        <p className="footer-note">Keep this information accessible and share it with family, friends, and neighbors.</p>
      </footer>
    </div>
  );
}