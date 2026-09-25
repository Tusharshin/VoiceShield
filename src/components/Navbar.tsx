import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Globe, Menu, X, ArrowRight, Shield, ChevronDown } from 'lucide-react';

interface NavbarProps {
  onCheckVoiceClick: () => void;
  onSearchOpen: () => void;
  onSignInOpen: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onCheckVoiceClick, onSearchOpen, onSignInOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState({ code: 'EN', name: 'English (India)' });
  const [activeSection, setActiveSection] = useState<string>('');

  const indianLanguages = [
    { code: 'EN', name: 'English (India)', native: 'English' },
    { code: 'HI', name: 'Hindi', native: 'हिन्दी' },
    { code: 'TA', name: 'Tamil', native: 'தமிழ்' },
    { code: 'TE', name: 'Telugu', native: 'తెలుగు' },
    { code: 'BN', name: 'Bengali', native: 'বাংলা' },
    { code: 'MR', name: 'Marathi', native: 'मराठी' },
    { code: 'GU', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'KN', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ML', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'PA', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'OR', name: 'Odia', native: 'ଓଡ଼ିଆ' },
    { code: 'UR', name: 'Urdu', native: 'اردو' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);

      if (location.pathname === '/detect') {
        setActiveSection('detect');
        return;
      }

      const sections = ['product', 'how-it-works', 'technology', 'safety', 'resources', 'about'];
      const scrollPosition = window.scrollY + 120;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);

    if (id === 'detect') {
      onCheckVoiceClick();
      return;
    }

    if (location.pathname !== '/') {
      navigate('/', { replace: false });
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          const yOffset = -80;
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) {
        const yOffset = -80;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200/90 py-3'
          : 'bg-white/85 backdrop-blur-sm border-b border-slate-200/60 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Left: Brand Logo & Wordmark */}
          <div
            tabIndex={0}
            role="button"
            aria-label="VoiceShield Home"
            className="flex items-center space-x-3 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-xl"
            onClick={() => {
              if (location.pathname !== '/') {
                navigate('/');
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                if (location.pathname !== '/') navigate('/');
                else window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 group hover:bg-blue-700 transition-colors">
              <Shield className="w-5 h-5 absolute text-white/40" />
              <div className="relative z-10 flex items-center space-x-0.5">
                <span className="w-0.5 h-3.5 bg-white rounded-full animate-wave-1"></span>
                <span className="w-0.5 h-4.5 bg-white rounded-full animate-wave-3"></span>
                <span className="w-0.5 h-2.5 bg-white rounded-full animate-wave-2"></span>
                <span className="w-0.5 h-4 bg-white rounded-full animate-wave-4"></span>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
                  Voice<span className="text-blue-600">Shield</span>
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/70">
                  AI
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 tracking-tight leading-none hidden sm:block">
                Real Voices. Safer Tomorrow.
              </p>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-100/70 p-1 rounded-full border border-slate-200/80">
            {[
              { id: 'product', label: 'Product' },
              { id: 'how-it-works', label: 'How It Works' },
              { id: 'technology', label: 'Technology' },
              { id: 'safety', label: 'Safety' },
              { id: 'resources', label: 'Use Cases' },
              { id: 'about', label: 'About' },
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  activeSection === link.id && location.pathname === '/'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Controls */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Search Icon */}
            <button
              onClick={onSearchOpen}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              title="Search VoiceShield"
              aria-label="Search topics and features"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                aria-label="Select language"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>{selectedLang.code}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs max-h-72 overflow-y-auto">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Language
                  </div>
                  {indianLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLang({ code: lang.code, name: lang.name });
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-blue-50 transition-colors ${
                        selectedLang.code === lang.code ? 'text-blue-700 font-semibold bg-blue-50/60' : 'text-slate-700'
                      }`}
                    >
                      <span>{lang.name}</span>
                      <span className="text-[11px] text-slate-400">{lang.native}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sign In */}
            <button
              onClick={onSignInOpen}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg"
            >
              Sign In
            </button>

            {/* Primary CTA */}
            <button
              onClick={onCheckVoiceClick}
              className="group inline-flex items-center justify-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm shadow-blue-600/20 transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <span>Check a Voice</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={onCheckVoiceClick}
              className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg shadow-xs"
            >
              Check
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-label={mobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
            {[
              { id: 'product', label: 'Product' },
              { id: 'how-it-works', label: 'How It Works' },
              { id: 'technology', label: 'Technology' },
              { id: 'safety', label: 'Safety' },
              { id: 'resources', label: 'Use Cases' },
              { id: 'about', label: 'About' },
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className="text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                {link.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col space-y-2 pt-1">
            <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-600">
              <span className="flex items-center space-x-1">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>Language: {selectedLang.name}</span>
              </span>
              <span className="font-bold text-blue-600">{selectedLang.code}</span>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onSignInOpen();
              }}
              className="w-full py-2.5 text-center text-xs font-semibold text-slate-800 bg-slate-100 rounded-lg"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onCheckVoiceClick();
              }}
              className="w-full py-2.5 text-center text-xs font-bold text-white bg-blue-600 rounded-lg shadow-sm"
            >
              Check a Voice →
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
