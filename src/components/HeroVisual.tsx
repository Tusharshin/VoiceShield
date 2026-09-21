import React, { useState } from 'react';
import { User, Cpu, Volume2, ShieldAlert, CheckCircle, Activity } from 'lucide-react';

export const HeroVisual: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'human' | 'ai'>('ai');
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative w-full max-w-lg mx-auto lg:max-w-none">
      {/* Soft Background Accent Glow */}
      <div className="absolute -top-6 -left-6 w-72 h-72 bg-blue-100/60 rounded-full blur-3xl -z-10"></div>
      <div className="absolute -bottom-6 -right-6 w-72 h-72 bg-indigo-100/50 rounded-full blur-3xl -z-10"></div>

      {/* Main Visual Container Card */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl p-6 relative overflow-hidden transition-all duration-300 hover:border-blue-200">
        
        {/* Top Concept Banner */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center space-x-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
            </span>
            <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">
              Voice Authenticity Matrix
            </span>
          </div>

          {/* Interactive Toggle for Comparison */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/70">
            <button
              onClick={() => setActiveTab('human')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                activeTab === 'human'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Real Human
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                activeTab === 'ai'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              AI Generated
            </button>
          </div>
        </div>

        {/* Core Visual Comparison Grid */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-2">
          
          {/* Node 1: Real Human Profile */}
          <div
            onClick={() => setActiveTab('human')}
            className={`cursor-pointer flex flex-col items-center p-3.5 rounded-xl border transition-all duration-200 ${
              activeTab === 'human'
                ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-400/20'
                : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/80'
            }`}
          >
            <div className="relative w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white mb-2 shadow-sm overflow-hidden">
              <User className="w-6 h-6 text-slate-200" />
              {activeTab === 'human' && (
                <div className="absolute inset-0 border-2 border-emerald-400 rounded-full animate-pulse"></div>
              )}
            </div>
            <span className="text-xs font-extrabold text-slate-900">REAL HUMAN</span>
            <span className="text-[10px] font-medium text-slate-500 mt-0.5">Natural Voice Clip</span>
            <div className="mt-2 inline-flex items-center space-x-1 text-[10px] text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full font-semibold">
              <CheckCircle className="w-3 h-3" />
              <span>Authentic</span>
            </div>
          </div>

          {/* Center Connector: Voice Waveform Spectrum */}
          <div className="flex flex-col items-center justify-center px-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
              VS
            </span>
            <div className="w-16 sm:w-20 h-0.5 bg-gradient-to-r from-emerald-400 via-blue-500 to-indigo-500 rounded-full"></div>
            
            {/* Waveform Micro Visualizer */}
            <div className="flex items-center justify-center space-x-0.5 my-2 h-7">
              {[40, 75, 95, 30, 85, 60, 100, 45, 90, 50, 70].map((h, i) => (
                <span
                  key={i}
                  style={{
                    height: isPlaying ? `${h}%` : `${activeTab === 'ai' ? h * 0.8 : h * 0.5}%`,
                  }}
                  className={`w-1 rounded-full transition-all duration-300 ${
                    activeTab === 'human' ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`}
                ></span>
              ))}
            </div>
            <span className="text-[10px] font-semibold text-slate-500">
              {activeTab === 'human' ? 'Natural Frequency' : 'Synthetic Pattern'}
            </span>
          </div>

          {/* Node 2: AI Generated Voice Visualization */}
          <div
            onClick={() => setActiveTab('ai')}
            className={`cursor-pointer flex flex-col items-center p-3.5 rounded-xl border transition-all duration-200 ${
              activeTab === 'ai'
                ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-400/20'
                : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/80'
            }`}
          >
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mb-2 shadow-sm">
              <Cpu className="w-6 h-6 text-white" />
              {activeTab === 'ai' && (
                <div className="absolute inset-0 border-2 border-blue-400 rounded-full animate-pulse"></div>
              )}
            </div>
            <span className="text-xs font-extrabold text-slate-900">AI GENERATED</span>
            <span className="text-[10px] font-medium text-slate-500 mt-0.5">Synthetic Voice</span>
            <div className="mt-2 inline-flex items-center space-x-1 text-[10px] text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded-full font-semibold">
              <ShieldAlert className="w-3 h-3 text-blue-600" />
              <span>92% Sample</span>
            </div>
          </div>
        </div>

        {/* Handwritten Microcopy Requirement */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-full bg-slate-900 text-white hover:bg-blue-600 transition-colors"
              title={isPlaying ? 'Pause preview' : 'Play audio comparison'}
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] text-slate-600 font-medium">
              Concept: <strong className="text-slate-900 font-semibold">Same voice. Different reality?</strong>
            </span>
          </div>

          <div className="text-right">
            <span className="font-handwriting text-lg text-blue-700 tracking-wide font-bold select-none">
              Listen. Verify. Stay safe.
            </span>
          </div>
        </div>

        {/* Small Technical Specs Badge */}
        <div className="mt-3 bg-slate-50 rounded-xl p-3 border border-slate-200/70 flex items-center justify-between text-[11px]">
          <div className="flex items-center space-x-1.5 text-slate-600">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>Acoustic Evaluation Concept:</span>
          </div>
          <span className="font-mono text-[10px] font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
            {activeTab === 'human' ? 'Natural Vocal Profile' : 'Synthetic Audio Characteristics'}
          </span>
        </div>
      </div>
    </div>
  );
};
