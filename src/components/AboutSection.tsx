import React from 'react';
import { MapPin } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-white border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
          <div className="max-w-3xl relative z-10 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
              <MapPin className="w-3.5 h-3.5" />
              <span>Built in India 🇮🇳</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Helping People Verify Voice Authenticity in the AI Era
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              VoiceShield is an AI-powered voice authenticity project focused on helping people identify synthetic and cloned speech. As artificial intelligence voice generators advance rapidly, our goal is to build accessible tools that allow users to evaluate audio clips and answer one essential question: <strong>"Can You Trust This Voice?"</strong>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-800">
              <div>
                <span className="text-lg font-extrabold text-white block">AI-Powered Analysis</span>
                <span className="text-xs text-slate-400 font-medium">Synthetic Voice Detection</span>
              </div>
              <div>
                <span className="text-lg font-extrabold text-white block">Multilingual Vision</span>
                <span className="text-xs text-slate-400 font-medium">Adapted for Regional Accents</span>
              </div>
              <div>
                <span className="text-lg font-extrabold text-white block">Privacy-First</span>
                <span className="text-xs text-slate-400 font-medium">Secure Audio Processing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
