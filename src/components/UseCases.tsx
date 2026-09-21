import React from 'react';
import { ShieldAlert, Building2, Users, Newspaper, ArrowUpRight } from 'lucide-react';

export const UseCases: React.FC = () => {
  const cases = [
    {
      title: 'Scam & Impersonation Prevention',
      category: 'Designed for Consumer Defense',
      description: 'Helping individuals evaluate suspicious voice calls or audio clips impersonating family members, authorities, or service providers.',
      icon: ShieldAlert,
      tag: 'Potential Use Case',
    },
    {
      title: 'Voice Authenticity in Banking & Service Calls',
      category: 'Designed for Financial Services',
      description: 'Potential application for financial institutions seeking an added verification layer during sensitive voice transactions.',
      icon: Building2,
      tag: 'Potential Use Case',
    },
    {
      title: 'Corporate Executive Fraud Protection',
      category: 'Designed for Enterprise Defense',
      description: 'Protecting corporate teams from synthetic voice wire-fraud and executive audio spoofing attempts.',
      icon: Users,
      tag: 'Potential Use Case',
    },
    {
      title: 'Media & Fact-Checking Verification',
      category: 'Designed for News & Integrity',
      description: 'Assisting newsrooms and fact-checking organizations in assessing public speech recordings for potential audio manipulation.',
      icon: Newspaper,
      tag: 'Potential Use Case',
    },
  ];

  return (
    <section id="resources" className="py-20 bg-white border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
            Product Vision
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Potential Use Cases
          </h2>
          <p className="mt-3 text-base text-slate-600 font-normal">
            VoiceShield is designed to serve key scenarios where verifying voice authenticity is critical.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cases.map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={i}
                className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-7 hover:shadow-lg hover:border-blue-300 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/70">
                      {c.tag}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white text-slate-800 flex items-center justify-center shadow-xs border border-slate-200/80 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    {c.category}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {c.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center text-xs font-bold text-blue-600">
                  <span>Explore application scenario</span>
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
