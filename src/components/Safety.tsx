import React from 'react';
import { Lock, EyeOff, ShieldCheck, FileCheck } from 'lucide-react';

export const Safety: React.FC = () => {
  const safetyPillars = [
    {
      title: 'Minimal Data Retention',
      description: 'Audio payloads are processed for feature extraction with minimal storage duration to prioritize user privacy.',
      icon: EyeOff,
    },
    {
      title: 'Secure Data Handling',
      description: 'Standard encryption in transit protects audio data uploaded to the processing service.',
      icon: Lock,
    },
    {
      title: 'Privacy-Focused Processing',
      description: 'Designed from the ground up with user privacy in mind, focusing strictly on acoustic authenticity analysis.',
      icon: ShieldCheck,
    },
    {
      title: 'Designed to Protect Sensitive Audio',
      description: 'Architecture constructed to respect sensitive voice communications and prevent unauthorized access.',
      icon: FileCheck,
    },
  ];

  return (
    <section id="safety" className="py-20 bg-slate-50/50 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
            Security-Conscious Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Designed with Privacy & Security in Mind
          </h2>
          <p className="mt-3 text-base text-slate-600 font-normal">
            VoiceShield is built around privacy-focused principles to analyze voice authenticity while safeguarding user audio data.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {safetyPillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{item.description}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
