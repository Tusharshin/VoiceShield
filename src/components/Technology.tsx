import React from 'react';
import { Cpu, Languages, Sparkles, Sliders, BarChart3, Layers, FileCheck } from 'lucide-react';

export const Technology: React.FC = () => {
  const languages = [
    { name: 'Hindi', native: 'हिन्दी' },
    { name: 'English (India)', native: 'English' },
    { name: 'Tamil', native: 'தமிழ்' },
    { name: 'Telugu', native: 'తెలుగు' },
    { name: 'Bengali', native: 'বাংলা' },
    { name: 'Marathi', native: 'मराठी' },
    { name: 'Gujarati', native: 'ગુજરાતી' },
    { name: 'Kannada', native: 'ಕನ್ನಡ' },
    { name: 'Malayalam', native: 'മലയാളം' },
    { name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { name: 'Odia', native: 'ଓଡ଼ିଆ' },
    { name: 'Urdu', native: 'اردو' },
  ];

  const techStackPipeline = [
    {
      title: 'Audio Preprocessing',
      desc: 'Normalizes gain, filters ambient background noise, and converts raw audio payloads into consistent acoustic representations.',
      icon: Sliders,
    },
    {
      title: 'Voice Feature Analysis',
      desc: 'Extracts pitch contours, harmonic spectrum features, and temporal voice patterns for deep acoustic evaluation.',
      icon: Layers,
    },
    {
      title: 'AI-Based Classification',
      desc: 'Evaluates vocal patterns against neural models trained to differentiate authentic human speech from synthetic audio.',
      icon: Cpu,
    },
    {
      title: 'Synthetic Speech Detection',
      desc: 'Identifies acoustic artifacts and phase anomalies characteristic of text-to-speech generators and voice clones.',
      icon: Sparkles,
    },
    {
      title: 'Confidence-Based Results',
      desc: 'Generates clear authenticity probability scores and risk indicators to help users evaluate voice credibility.',
      icon: BarChart3,
    },
    {
      title: 'Multilingual Support',
      desc: 'Designed to adapt across diverse accents, regional speech variations, and multilingual voice inputs.',
      icon: Languages,
    },
  ];

  return (
    <section id="technology" className="py-20 bg-white border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/60 mb-3">
            <FileCheck className="w-3.5 h-3.5" />
            <span>Technology in development</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Voice Authenticity Analysis Pipeline
          </h2>
          <p className="mt-3 text-base text-slate-600 font-normal">
            VoiceShield is designed around a multi-stage audio processing and AI classification pipeline focused on detecting synthetic speech.
          </p>
        </div>

        {/* Tech Pipeline 3x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {techStackPipeline.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="bg-slate-50/70 rounded-2xl p-6 border border-slate-200/80 hover:bg-white hover:shadow-md hover:border-blue-200 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4 shadow-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Indian Language Section (Exact prompt requirements) */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-slate-700/80 gap-4">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                  Multilingual Vision
                </span>
                <h3 className="text-2xl font-extrabold text-white mt-1">
                  Designed for India's Multilingual Voice Landscape
                </h3>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full">
                Multilingual Voice Analysis
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
              {languages.map((lang, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 p-3 rounded-xl transition-colors text-center"
                >
                  <span className="text-xs font-bold text-white block">{lang.name}</span>
                  <span className="text-xs text-blue-400 font-medium block mt-0.5">{lang.native}</span>
                </div>
              ))}
            </div>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-400 font-medium">
                More languages can be added as the detection system evolves.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
