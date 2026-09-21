import React, { useState, useRef } from 'react';
import {
  Upload,
  Mic,
  Play,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Info,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SampleOption {
  id: string;
  name: string;
  type: 'human' | 'ai' | 'cloned';
  confidence: number;
  verdict: string;
  duration: string;
  language: string;
  source: string;
  pitchVariance: string;
  description: string;
}

export const VoiceCheckerPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'record'>('upload');
  const [selectedSample, setSelectedSample] = useState<string>('ai');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [customResult, setCustomResult] = useState<SampleOption | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);

  const samples: Record<string, SampleOption> = {
    human: {
      id: 'human',
      name: 'Real Human Voice',
      type: 'human',
      confidence: 96,
      verdict: 'Authentic Human Voice',
      duration: '8.6 sec',
      language: 'English (India)',
      source: 'Natural Vocal Sample',
      pitchVariance: 'Natural pitch variation',
      description: 'Human speech sample exhibiting continuous natural pitch and organic vocal characteristics.',
    },
    ai: {
      id: 'ai',
      name: 'AI Generated Voice',
      type: 'ai',
      confidence: 92,
      verdict: 'Likely AI-generated',
      duration: '12.4 sec',
      language: 'Hindi',
      source: 'TTS / Voice Generator',
      pitchVariance: 'Synthetic harmonic patterns',
      description: 'Synthetic voice clip synthesized using text-to-speech engine.',
    },
    cloned: {
      id: 'cloned',
      name: 'Cloned Voice',
      type: 'cloned',
      confidence: 89,
      verdict: 'Voice Clone Detected',
      duration: '15.1 sec',
      language: 'Tamil',
      source: 'Synthetic Voice Model',
      pitchVariance: 'Voice cloning acoustic trace',
      description: 'Audio snippet exhibiting acoustic characteristics consistent with voice cloning models.',
    },
  };

  const activeResult = customResult || samples[selectedSample];

  // Handle File Upload Simulation
  const handleFileUpload = (file: File) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      const isLikelyAI = file.name.toLowerCase().includes('ai') || file.name.toLowerCase().includes('clone');
      setCustomResult({
        id: 'custom',
        name: file.name,
        type: isLikelyAI ? 'ai' : 'human',
        confidence: isLikelyAI ? 92 : 95,
        verdict: isLikelyAI ? 'Likely AI-generated' : 'Authentic Human Voice',
        duration: `${(file.size / (1024 * 100)).toFixed(1)} sec`,
        language: 'Hindi / English (India)',
        source: isLikelyAI ? 'Synthetic Audio Source' : 'Natural Audio Source',
        pitchVariance: isLikelyAI ? 'Synthetic pitch pattern' : 'Natural pitch variation',
        description: `Analyzed clip: ${file.name}. Sample analysis completed for demonstration preview.`,
      });
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
    }, 1000);
  };

  // Recording Simulation
  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = window.setInterval(() => {
      setRecordingTime((prev) => {
        if (prev >= 5) {
          stopRecording();
          return 5;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setCustomResult({
        id: 'recorded',
        name: 'Live Microphone Audio',
        type: 'human',
        confidence: 96,
        verdict: 'Authentic Human Voice',
        duration: `${recordingTime || 5} sec`,
        language: 'Live Recorded Voice',
        source: 'User Microphone',
        pitchVariance: 'Natural pitch variation',
        description: 'Recorded microphone clip analyzed in interactive demo sandbox.',
      });
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    }, 900);
  };

  return (
    <section id="check-voice" className="py-16 bg-white relative border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 mb-3">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>Interactive Demo Preview</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Check a Voice
          </h2>
          <p className="mt-2 text-base text-slate-600 font-normal">
            Upload an audio clip or select a sample below to test the VoiceShield user interface preview.
          </p>
        </div>

        {/* Main Product Card */}
        <div className="bg-slate-50/70 rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 lg:p-10 relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Upload / Record Interface */}
            <div className="lg:col-span-6 space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h3 className="text-xl font-extrabold text-slate-900">Check a Voice</h3>
                
                {/* Tabs */}
                <div className="flex bg-slate-200/80 p-1 rounded-xl">
                  <button
                    onClick={() => {
                      setActiveTab('upload');
                      setCustomResult(null);
                    }}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      activeTab === 'upload'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Audio</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('record');
                      setCustomResult(null);
                    }}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      activeTab === 'record'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Record Voice</span>
                  </button>
                </div>
              </div>

              {/* Upload Tab Area */}
              {activeTab === 'upload' ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 group hover:shadow-md"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                    accept="audio/*,.mp3,.wav,.m4a,.flac"
                    className="hidden"
                  />

                  <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-7 h-7" />
                  </div>

                  <p className="text-base font-extrabold text-slate-800">
                    Drop your audio here
                  </p>
                  <p className="text-xs text-blue-600 font-bold mt-1">
                    or choose a file
                  </p>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Supported formats: <strong>MP3 · WAV · M4A · FLAC</strong></span>
                    <span>Maximum file size: <strong>50 MB</strong></span>
                  </div>
                </div>
              ) : (
                /* Record Tab Area */
                <div className="border border-slate-200 bg-white rounded-2xl p-8 text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-inner">
                    <Mic className={`w-8 h-8 ${isRecording ? 'animate-bounce text-red-600' : ''}`} />
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Record Voice Clip</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Speak into your microphone to generate a sample voice analysis preview.
                    </p>
                  </div>

                  {isRecording ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center space-x-1 h-8">
                        {[40, 80, 50, 90, 60, 100, 70, 40, 85].map((h, i) => (
                          <span
                            key={i}
                            style={{ height: `${h}%` }}
                            className="w-1.5 bg-red-500 rounded-full animate-pulse"
                          ></span>
                        ))}
                      </div>
                      <div className="text-sm font-mono font-bold text-red-600">
                        Recording... 00:0{recordingTime} / 00:05
                      </div>
                      <button
                        onClick={stopRecording}
                        className="px-5 py-2 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800"
                      >
                        Stop Recording
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={startRecording}
                      className="inline-flex items-center space-x-2 px-6 py-3 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-all"
                    >
                      <Mic className="w-4 h-4" />
                      <span>Start Recording</span>
                    </button>
                  )}
                </div>
              )}

              {/* Try a Sample Section */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Try a sample
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Click to view sample result:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {Object.values(samples).map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => {
                        setSelectedSample(sample.id);
                        setCustomResult(null);
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                        selectedSample === sample.id && !customResult
                          ? 'bg-blue-50/80 border-blue-400 text-blue-900 font-bold shadow-xs'
                          : 'bg-slate-50/70 border-slate-200/80 text-slate-700 hover:bg-slate-100 font-medium'
                      }`}
                    >
                      <span className="text-xs truncate flex items-center space-x-1.5">
                        <Play className="w-3 h-3 text-blue-600 fill-blue-600 shrink-0" />
                        <span className="truncate">{sample.name}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Sample Result Panel */}
            <div className="lg:col-span-6 space-y-5">
              
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-6 relative">
                
                {/* Header with explicit DEMO badge requirement */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                      Sample Result
                    </h4>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70">
                    Demo Result
                  </span>
                </div>

                {isAnalyzing ? (
                  <div className="py-16 text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs font-bold text-slate-700">
                      Processing audio analysis preview...
                    </p>
                  </div>
                ) : (
                  <div className="pt-4 space-y-6">
                    
                    {/* Top Confidence Circle & Badge */}
                    <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-50 p-5 rounded-2xl border border-slate-200/80 gap-4">
                      
                      {/* Circular Indicator */}
                      <div className="flex items-center space-x-4">
                        <div className="relative w-20 h-20 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle
                              cx="40"
                              cy="40"
                              r="34"
                              stroke="#e2e8f0"
                              strokeWidth="6"
                              fill="transparent"
                            />
                            <circle
                              cx="40"
                              cy="40"
                              r="34"
                              stroke={activeResult.type === 'human' ? '#10b981' : '#2563eb'}
                              strokeWidth="6"
                              strokeDasharray={213}
                              strokeDashoffset={213 - (213 * activeResult.confidence) / 100}
                              strokeLinecap="round"
                              fill="transparent"
                              className="transition-all duration-1000 ease-out"
                            />
                          </svg>
                          <span className="absolute text-xl font-extrabold text-slate-900">
                            {activeResult.confidence}%
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center space-x-1.5">
                            {activeResult.type === 'human' ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{activeResult.verdict}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                                <AlertTriangle className="w-3.5 h-3.5 text-blue-600" />
                                <span>{activeResult.verdict}</span>
                              </span>
                            )}
                          </div>

                          {/* Mandatory Label from Prompt: "Illustrative sample result" */}
                          <div className="mt-1">
                            <span className="text-[11px] font-bold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded inline-block">
                              Illustrative sample result
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 mt-1.5 max-w-xs leading-relaxed">
                            {activeResult.description}
                          </p>
                        </div>
                      </div>

                    </div>

                    {/* Supporting Information Breakdown (Exact requirement) */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                        <span className="text-[11px] text-slate-500 block font-semibold">Confidence Score</span>
                        <span className="text-sm font-extrabold text-slate-900">{activeResult.confidence}%</span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                        <span className="text-[11px] text-slate-500 block font-semibold">Audio Duration</span>
                        <span className="text-sm font-extrabold text-slate-900">{activeResult.duration}</span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                        <span className="text-[11px] text-slate-500 block font-semibold">Detected Language</span>
                        <span className="text-sm font-extrabold text-slate-900">{activeResult.language}</span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                        <span className="text-[11px] text-slate-500 block font-semibold">Possible Source</span>
                        <span className="text-sm font-extrabold text-blue-700">{activeResult.source}</span>
                      </div>

                    </div>

                    {/* Factual Disclaimer Requirement */}
                    <div className="flex items-start space-x-2 text-[11px] text-slate-500 bg-blue-50/60 p-3 rounded-xl border border-blue-200/60">
                      <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Sample Analysis Notice:</strong> This card demonstrates the VoiceShield interface layout. Scores shown above are sample results for website preview purposes.
                      </span>
                    </div>

                  </div>
                )}

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
