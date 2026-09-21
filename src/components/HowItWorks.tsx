import React from 'react';
import { Upload, Cpu, ShieldCheck, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Input Audio Payload',
      description: 'Upload an audio file (MP3, WAV, M4A, FLAC) or record a voice clip directly in your browser.',
      icon: Upload,
      accent: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      number: '02',
      title: 'AI Feature Analysis',
      description: 'The detection engine processes acoustic characteristics, pitch variations, and spectral patterns.',
      icon: Cpu,
      accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      number: '03',
      title: 'Authenticity Verdict',
      description: 'Receive a clear confidence score and diagnostic breakdown detailing whether the clip exhibits synthetic characteristics.',
      icon: ShieldCheck,
      accent: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-slate-50/50 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
            Process Overview
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            How VoiceShield Evaluates Audio
          </h2>
          <p className="mt-3 text-base text-slate-600 font-normal">
            A straightforward process to analyze voice clips and evaluate authenticity.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 relative group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${step.accent}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-extrabold text-slate-200 group-hover:text-blue-200 transition-colors">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                  <span>View workflow details</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
