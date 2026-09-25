import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { VoiceCheckerPreview } from './components/VoiceCheckerPreview';
import { HowItWorks } from './components/HowItWorks';
import { Technology } from './components/Technology';
import { Safety } from './components/Safety';
import { UseCases } from './components/UseCases';
import { AboutSection } from './components/AboutSection';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { AuthModal } from './components/AuthModal';
import { DetectionPage } from './pages/DetectionPage';
import { AuthProvider } from './context/AuthContext';

function LandingPage({
  onSearchOpen,
  onSignInOpen,
  onSignUpOpen,
}: {
  onSearchOpen: () => void;
  onSignInOpen: () => void;
  onSignUpOpen: () => void;
}) {
  const navigate = useNavigate();

  const handleCheckVoiceNav = () => {
    navigate('/detect');
  };

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Navbar
        onCheckVoiceClick={handleCheckVoiceNav}
        onSearchOpen={onSearchOpen}
        onSignInOpen={onSignInOpen}
        onSignUpOpen={onSignUpOpen}
      />
      <main className="flex-grow">
        <Hero
          onCheckVoiceClick={handleCheckVoiceNav}
          onSeeHowItWorksClick={scrollToHowItWorks}
        />
        <VoiceCheckerPreview />
        <HowItWorks />
        <Technology />
        <Safety />
        <UseCases />
        <AboutSection />
        <FAQ />
      </main>
      <Footer onCheckVoiceClick={handleCheckVoiceNav} />
    </>
  );
}

function DetectRouteWrapper() {
  const navigate = useNavigate();

  return (
    <>
      <main className="flex-grow">
        <DetectionPage />
      </main>
      <Footer onCheckVoiceClick={() => navigate('/detect')} />
    </>
  );
}

export function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50/40 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
          <Routes>
            <Route
              path="/"
              element={
                <LandingPage
                  onSearchOpen={() => setIsSearchOpen(true)}
                  onSignInOpen={() => {
                    setAuthMode('login');
                    setIsAuthOpen(true);
                  }}
                  onSignUpOpen={() => {
                    setAuthMode('signup');
                    setIsAuthOpen(true);
                  }}
                />
              }
            />
            <Route
              path="/detect"
              element={<DetectRouteWrapper />}
            />
            <Route
              path="/dashboard"
              element={<DetectRouteWrapper />}
            />
          </Routes>

          {/* Modals */}
          <SearchModal
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            onSelectTopic={(id) => {
              const el = document.getElementById(id);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          <AuthModal
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            initialMode={authMode}
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
