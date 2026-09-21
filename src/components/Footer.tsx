import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';

interface FooterProps {
  onCheckVoiceClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onCheckVoiceClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleFooterNav = (id: string) => {
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
    <footer className="bg-slate-900 text-white pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-xl font-extrabold text-white">
                Voice<span className="text-blue-400">Shield</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              An AI-powered voice authenticity project focused on helping individuals and organizations detect synthetic speech, cloned voices, and audio manipulations.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>Voice Authenticity Platform</span>
              </span>

              <span className="inline-flex items-center space-x-1 text-[11px] text-slate-400 font-semibold bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
                <span>Built in India 🇮🇳</span>
              </span>
            </div>
          </div>

          {/* Links Grid */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-6">
            
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Product</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><button onClick={onCheckVoiceClick} className="hover:text-white transition-colors">Check a Voice</button></li>
                <li><button onClick={() => handleFooterNav('how-it-works')} className="hover:text-white transition-colors">How It Works</button></li>
                <li><button onClick={() => handleFooterNav('check-voice')} className="hover:text-white transition-colors">Interactive Demo</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Technology</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><button onClick={() => handleFooterNav('technology')} className="hover:text-white transition-colors">Analysis Pipeline</button></li>
                <li><button onClick={() => handleFooterNav('technology')} className="hover:text-white transition-colors">Multilingual Vision</button></li>
                <li><button onClick={() => handleFooterNav('safety')} className="hover:text-white transition-colors">Privacy Features</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Resources</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><button onClick={() => handleFooterNav('resources')} className="hover:text-white transition-colors">Use Cases</button></li>
                <li><button onClick={() => handleFooterNav('resources')} className="hover:text-white transition-colors">Scam Prevention</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Company</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><button onClick={() => handleFooterNav('about')} className="hover:text-white transition-colors">About VoiceShield</button></li>
                <li><button onClick={() => handleFooterNav('safety')} className="hover:text-white transition-colors">Data Security</button></li>
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 VoiceShield. All rights reserved.</p>
          <p className="flex items-center space-x-1">
            <span>Real Voices. Safer Tomorrow.</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
