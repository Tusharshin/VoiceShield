import React from 'react';
import { ArrowRight, Play, ShieldCheck } from 'lucide-react';
import { TrustIndicators } from './TrustIndicators';
import { HeroVisual } from './HeroVisual';

interface HeroProps {
  onCheckVoiceClick: () => void;
  onSeeHowItWorksClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onCheckVoiceClick, onSeeHowItWorksClick }) => {
  return (
    <section id="product" className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/50 border-b border-slate-200/60">
      
      {/* Background Decorative Mesh grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline, Copy, CTAs, Trust Indicators */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Top Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>AI-Powered Voice Authenticity Platform</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Can You Trust{' '}
              <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 bg-clip-text text-transparent">
                This Voice?
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-lg sm:text-xl font-semibold text-slate-700 leading-snug">
              Detect AI-generated, cloned, and manipulated voices before they deceive you.
            </p>

            {/* Smaller Supporting Line */}
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-2xl">
              VoiceShield uses advanced AI to analyze voice patterns and help you verify what you're hearing.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onCheckVoiceClick}
                className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 text-sm font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md shadow-blue-600/25 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <span>Check a Voice</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onSeeHowItWorksClick}
                className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300/90 rounded-xl shadow-2xs transition-all duration-200"
              >
                <Play className="w-3.5 h-3.5 fill-slate-700 text-slate-700" />
                <span>See How It Works</span>
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-2">
              <TrustIndicators />
            </div>

          </div>

          {/* Right Column: Hero Visual Component */}
          <div className="lg:col-span-5">
            <HeroVisual />
          </div>

        </div>
      </div>
    </section>
  );
};
