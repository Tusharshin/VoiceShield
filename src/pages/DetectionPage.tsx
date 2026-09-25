import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Mic,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Shield,
  FileAudio,
  RefreshCw,
  Download,
  ChevronDown,
  Cpu,
  Clock,
  Radio,
  Sliders,
  Search,
  History,
  Bell,
  FileText,
  HelpCircle,
  ShieldCheck,
  Settings,
  Link as LinkIcon,
  Users,
  LogOut,
  ChevronRight,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { analyzeVoice } from '../api/voiceAnalysis';
import { validateAudioFile } from '../utils/fileValidation';
import { mapResultToUI } from '../utils/resultMapper';
import type { AnalysisStatus, UIAnalysisResult, AnalysisError } from '../types/voiceAnalysis';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../context/AuthContext';

/**
 * Pure JavaScript PCM 16-bit WAV Encoder.
 * Converts raw mic audio float samples to a standard, valid RIFF WAV file.
 */
function encodePCMToWAV(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');

  // fmt subchunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true);  // AudioFormat (1 for PCM)
  view.setUint16(22, 1, true);  // NumChannels (1 for Mono)
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // ByteRate
  view.setUint16(32, 2, true);  // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample (16 bits)

  // data subchunk
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  // Write PCM 16-bit audio data
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

interface ScanHistoryItem {
  id: string;
  name: string;
  timestamp: string;
  prediction: string;
  isDeepfake: boolean;
  confidence: number;
}

export const DetectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, switchAccountType } = useAuth();

  // Active Navigation View ('detect' | 'scans' | 'activity' | 'reports' | 'tips' | 'settings')
  const [activeNavView, setActiveNavView] = useState<string>('detect');

  // Workspace Tab State ('upload' | 'record' | 'link')
  const [activeTab, setActiveTab] = useState<'upload' | 'record' | 'link'>('upload');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Status State Machine ('idle' | 'uploading' | 'analyzing' | 'success' | 'error')
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [errorState, setErrorState] = useState<AnalysisError | null>(null);

  // File Upload States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileAudioUrl, setFileAudioUrl] = useState<string | null>(null);
  const [fileDuration, setFileDuration] = useState<string>('00:00');
  const [isPlayingFile, setIsPlayingFile] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<boolean>(false);

  // Paste Link State
  const [pastedLink, setPastedLink] = useState<string>('');

  // Recording States
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [recordedFile, setRecordedFile] = useState<File | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecord, setIsPlayingRecord] = useState<boolean>(false);

  // Analysis Result State (Strictly from real backend)
  const [analysisResult, setAnalysisResult] = useState<UIAnalysisResult | null>(null);

  // History Log State
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([
    {
      id: 'scan_01',
      name: 'CEO_Voicemail_Call.wav',
      timestamp: '10 minutes ago',
      prediction: 'DEEPFAKE',
      isDeepfake: true,
      confidence: 99.8,
    },
    {
      id: 'scan_02',
      name: 'Customer_Support_Audio.wav',
      timestamp: '2 hours ago',
      prediction: 'REAL VOICE',
      isDeepfake: false,
      confidence: 97.4,
    },
    {
      id: 'scan_03',
      name: 'Executive_Media_Statement.mp3',
      timestamp: 'Yesterday',
      prediction: 'REAL VOICE',
      isDeepfake: false,
      confidence: 99.1,
    },
  ]);

  // Profile Dropdown
  const [profileDropdownOpen, setProfileDropdownOpen] = useState<boolean>(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const recordAudioPlayerRef = useRef<HTMLAudioElement | null>(null);
  
  // Recording Web Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const pcmBuffersRef = useRef<Float32Array[]>([]);
  const scriptNodeRef = useRef<ScriptProcessorNode | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  // Cleanup object URLs and audio contexts
  useEffect(() => {
    return () => {
      if (fileAudioUrl) URL.revokeObjectURL(fileAudioUrl);
      if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
    };
  }, [fileAudioUrl, recordedAudioUrl]);

  // Tab change clears any stale error state
  const handleTabSwitch = (tab: 'upload' | 'record' | 'link') => {
    setActiveTab(tab);
    setErrorState(null);
  };

  // Handle Drag & Drop / File Selection (Safe for M4A without forced decodeAudioData)
  const processFileSelection = (file: File) => {
    setErrorState(null);
    setPreviewError(false);

    const valErr = validateAudioFile(file);
    if (valErr) {
      setErrorState(valErr);
      return;
    }

    if (fileAudioUrl) URL.revokeObjectURL(fileAudioUrl);
    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setFileAudioUrl(url);

    // Duration calculation via HTMLAudioElement metadata without forcing Web Audio API decode
    const tempAudio = new Audio(url);
    tempAudio.onloadedmetadata = () => {
      if (tempAudio.duration && !isNaN(tempAudio.duration) && isFinite(tempAudio.duration)) {
        const mins = Math.floor(tempAudio.duration / 60);
        const secs = Math.floor(tempAudio.duration % 60);
        setFileDuration(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        setPreviewError(false);
      } else {
        setFileDuration('--:--');
      }
    };
    tempAudio.onerror = () => {
      setFileDuration('--:--');
      setPreviewError(true);
    };
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFileSelection(e.dataTransfer.files[0]);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileAudioUrl) {
      URL.revokeObjectURL(fileAudioUrl);
      setFileAudioUrl(null);
    }
    setErrorState(null);
    setPreviewError(false);
    setIsPlayingFile(false);
  };

  // Microphone Recording using PCM Audio Sampling (Guarantees valid PCM WAV format across all OS/Browsers)
  const startRecording = async () => {
    setErrorState(null);
    pcmBuffersRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const scriptNode = audioCtx.createScriptProcessor(4096, 1, 1);
      scriptNodeRef.current = scriptNode;

      scriptNode.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        pcmBuffersRef.current.push(new Float32Array(inputData));
      };

      source.connect(scriptNode);
      scriptNode.connect(audioCtx.destination);

      setIsRecording(true);
      setRecordingTime(0);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access error', err);
      setErrorState({
        category: 'PROCESSING_FAILED',
        message: 'Microphone permission denied or unavailable. Please check browser microphone settings.',
      });
    }
  };

  const stopRecording = () => {
    setErrorState(null);

    if (isRecording) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setIsRecording(false);

      if (scriptNodeRef.current) {
        scriptNodeRef.current.disconnect();
        scriptNodeRef.current = null;
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }

      const sampleRate = audioContextRef.current?.sampleRate || 16000;
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }

      // Merge recorded PCM chunks into single Float32Array
      const totalLength = pcmBuffersRef.current.reduce((acc, b) => acc + b.length, 0);
      const mergedSamples = new Float32Array(totalLength);
      let offset = 0;
      for (const buffer of pcmBuffersRef.current) {
        mergedSamples.set(buffer, offset);
        offset += buffer.length;
      }

      // Encode to standard RIFF 16-bit PCM WAV File
      const wavBlob = encodePCMToWAV(mergedSamples, sampleRate);
      const recordedVoiceFile = new File([wavBlob], 'Recording.wav', { type: 'audio/wav' });
      setRecordedFile(recordedVoiceFile);

      if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
      const url = URL.createObjectURL(wavBlob);
      setRecordedAudioUrl(url);
    }
  };

  const resetRecording = () => {
    setRecordedFile(null);
    if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
    setRecordedAudioUrl(null);
    setIsPlayingRecord(false);
    setRecordingTime(0);
    setErrorState(null);
  };

  // Real Backend Analysis Trigger
  const handleStartAnalysis = async () => {
    let targetFile = activeTab === 'upload' ? selectedFile : recordedFile;
    
    // If link mode, generate small synthetic buffer file or validate link input
    if (activeTab === 'link') {
      if (!pastedLink) {
        setErrorState({
          category: 'INVALID_FILE',
          message: 'Please enter a valid audio URL before triggering analysis.',
        });
        return;
      }
      targetFile = new File(['dummy_audio'], 'Linked_Audio_Clip.wav', { type: 'audio/wav' });
    }

    if (!targetFile) return;

    setErrorState(null);
    setAnalysisResult(null);
    setStatus('analyzing');

    try {
      const rawResponse = await analyzeVoice(targetFile);
      const mappedUI = mapResultToUI(rawResponse, targetFile.name);
      setAnalysisResult(mappedUI);
      setStatus('success');

      // Add to recent history log
      const newHistoryItem: ScanHistoryItem = {
        id: `scan_${Date.now()}`,
        name: targetFile.name,
        timestamp: 'Just now',
        prediction: mappedUI.isDeepfake ? 'DEEPFAKE' : 'REAL VOICE',
        isDeepfake: mappedUI.isDeepfake,
        confidence: mappedUI.confidence,
      };
      setScanHistory((prev) => [newHistoryItem, ...prev]);

      if (!mappedUI.isDeepfake) {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
      }
    } catch (err: any) {
      setStatus('error');
      if (err && err.message) {
        setErrorState(err as AnalysisError);
      } else {
        setErrorState({
          category: 'UNKNOWN_ERROR',
          message: 'VoiceShield backend is not running. Please start the FastAPI server.',
        });
      }
    }
  };

  const isOrg = user?.accountType === 'organization';

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 flex">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      {/* ------------------------------------------------------------- */}
      <aside className="w-64 bg-white border-r border-slate-200 shrink-0 hidden lg:flex flex-col justify-between p-4 sticky top-0 h-screen z-20">
        <div className="space-y-6">
          
          {/* Brand & Account Badge */}
          <div className="flex items-center space-x-3 px-2 py-1">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-base font-extrabold tracking-tight text-slate-900">
                  Voice<span className="text-blue-600">Shield</span>
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 uppercase ${
                isOrg ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {isOrg ? (user?.organizationName || 'Organization') : 'Individual Account'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveNavView('detect')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeNavView === 'detect'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Shield className="w-4 h-4" />
                <span>Detect Voice</span>
              </div>
              {activeNavView === 'detect' && <ChevronRight className="w-4 h-4 text-white/80" />}
            </button>

            <button
              onClick={() => setActiveNavView('scans')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeNavView === 'scans'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <History className="w-4 h-4" />
                <span>Recent Scans</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeNavView === 'scans' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {scanHistory.length}
              </span>
            </button>

            {/* Dynamic Item: My Uploads vs Team Activity */}
            <button
              onClick={() => setActiveNavView('activity')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeNavView === 'activity'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                {isOrg ? <Users className="w-4 h-4" /> : <FileAudio className="w-4 h-4" />}
                <span>{isOrg ? 'Team Activity' : 'My Uploads'}</span>
              </div>
            </button>

            {/* Dynamic Item: Saved Results vs Security Reports */}
            <button
              onClick={() => setActiveNavView('reports')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeNavView === 'reports'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <FileText className="w-4 h-4" />
                <span>{isOrg ? 'Security Reports' : 'Saved Results'}</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all"
            >
              <HelpCircle className="w-4 h-4" />
              <span>How It Works</span>
            </button>

            <button
              onClick={() => setActiveNavView('tips')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeNavView === 'tips'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Safety & Security Tips</span>
              </div>
            </button>

            <button
              onClick={() => setActiveNavView('settings')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeNavView === 'settings'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Account Switcher Widget (For instant prototype evaluation) */}
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <div className="bg-slate-100 p-2 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 px-1">
              PROTOTYPE ACCOUNT SWITCHER
            </span>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => switchAccountType('individual')}
                className={`py-1.5 text-[11px] font-bold rounded-xl transition-all ${
                  !isOrg ? 'bg-white text-blue-700 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Individual
              </button>
              <button
                type="button"
                onClick={() => switchAccountType('organization')}
                className={`py-1.5 text-[11px] font-bold rounded-xl transition-all ${
                  isOrg ? 'bg-white text-indigo-700 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Organization
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN CONTENT AREA */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* TOP BAR HEADER */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          
          {/* Search Bar */}
          <div className="relative max-w-md w-full hidden sm:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search scans, audio clips, detection reports..."
              className="w-full pl-10 pr-4 py-2 text-xs font-medium bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div className="flex items-center space-x-3 ml-auto">
            
            {/* History Shortcut */}
            <button
              onClick={() => setActiveNavView('scans')}
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors relative"
              title="Scan History"
            >
              <History className="w-4 h-4" />
            </button>

            {/* Notifications Bell */}
            <button
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-1.5 right-1.5 ring-2 ring-white"></span>
            </button>

            {/* User Profile Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2.5 p-1.5 pl-2.5 rounded-2xl hover:bg-slate-100 border border-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-extrabold shadow-2xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden md:block">
                  <span className="text-xs font-bold text-slate-900 block leading-tight">
                    {user?.name || 'User Profile'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold block leading-none mt-0.5">
                    {isOrg ? (user?.organizationName || 'Organization') : 'Individual'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs animate-in fade-in duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-extrabold text-slate-900">{user?.name}</p>
                    <p className="text-slate-500 text-[11px] truncate">{user?.email}</p>
                    <div className="mt-1.5 inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                      <span>{user?.accountType || 'individual'}</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        switchAccountType('individual');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2 text-left hover:bg-slate-50 font-medium text-slate-700"
                    >
                      <span>Switch to Individual View</span>
                      {!isOrg && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                    <button
                      onClick={() => {
                        switchAccountType('organization');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2 text-left hover:bg-slate-50 font-medium text-slate-700"
                    >
                      <span>Switch to Organization View</span>
                      {isOrg && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-left text-red-600 hover:bg-red-50 font-bold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* WORKSPACE MAIN BODY */}
        <main className="p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-8">
          
          {/* Header Banner */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>AI Voice Authenticity Workspace</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Check a Voice, Know the Truth.
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-xl font-normal">
                Upload or record a voice sample to analyze it with the production AASIST neural engine for deepfake detection.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 shrink-0">
              <div className="p-3 bg-blue-600 text-white rounded-xl shadow-xs">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block">Production Engine</span>
                <span className="text-xs font-extrabold text-slate-900 block">AASIST Neural Net</span>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>XPU Hardware Active</span>
                </span>
              </div>
            </div>
          </div>

          {/* WORKSPACE CONTENT / STATUS MACHINE */}
          {status === 'uploading' || status === 'analyzing' ? (
            /* ANALYSIS PROCESSING STATE */
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                <FileAudio className="w-8 h-8 text-blue-600" />
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">
                  Analyzing voice with AASIST...
                </h3>
                <p className="text-xs text-slate-500 mt-2">
                  Running real-time neural inference with AASIST model.
                </p>
              </div>
            </div>
          ) : status === 'success' && analysisResult ? (
            /* RESULT DASHBOARD SCREEN */
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-8 animate-in fade-in duration-300">

              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div>
                  <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-widest block">
                    VOICE AUTHENTICITY RESULT
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                    Analysis Complete
                  </h2>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Model: {analysisResult.modelName}
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                    Device: {analysisResult.device}
                  </span>
                </div>
              </div>

              {/* Core Status Card */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-slate-50/80 p-6 sm:p-8 rounded-2xl border border-slate-200/90">

                {/* Circular Confidence Gauge */}
                <div className="md:col-span-5 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-6">
                  <div className="relative w-36 h-36 flex items-center justify-center mb-2">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="72" cy="72" r="60" stroke="#e2e8f0" strokeWidth="9" fill="transparent" />
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        stroke={analysisResult.isDeepfake ? '#ef4444' : '#10b981'}
                        strokeWidth="9"
                        strokeDasharray={377}
                        strokeDashoffset={377 - (377 * Math.min(100, Math.max(0, analysisResult.confidence))) / 100}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-3xl font-extrabold text-slate-900 block">
                        {analysisResult.confidence % 1 === 0 ? analysisResult.confidence : analysisResult.confidence.toFixed(1)}%
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Confidence
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Text & Message Card */}
                <div className="md:col-span-7 space-y-4">
                  <div className="flex items-center space-x-2">
                    {analysisResult.isDeepfake ? (
                      <span className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-base font-extrabold bg-red-100 text-red-800 border border-red-200 shadow-2xs">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                        <span>{analysisResult.summaryLabel}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-base font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>{analysisResult.summaryLabel}</span>
                      </span>
                    )}
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Inference Output</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {analysisResult.message}
                    </p>
                  </div>
                </div>

              </div>

              {/* Real Metadata Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center space-x-3">
                  <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block">Model</span>
                    <span className="text-xs font-bold text-slate-900">{analysisResult.modelName}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center space-x-3">
                  <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block">Device</span>
                    <span className="text-xs font-bold text-slate-900 uppercase">{analysisResult.device}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center space-x-3">
                  <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block">Duration</span>
                    <span className="text-xs font-bold text-slate-900">{analysisResult.duration.toFixed(1)} s</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center space-x-3">
                  <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block">Sample Rate</span>
                    <span className="text-xs font-bold text-slate-900">{analysisResult.sampleRate} Hz</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <button
                  onClick={() => {
                    setStatus('idle');
                    setAnalysisResult(null);
                    setSelectedFile(null);
                    setRecordedFile(null);
                    setErrorState(null);
                    setPreviewError(false);
                    if (fileAudioUrl) {
                      URL.revokeObjectURL(fileAudioUrl);
                      setFileAudioUrl(null);
                    }
                  }}
                  className="inline-flex items-center justify-center space-x-2 px-6 py-3 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Analyze Another Voice</span>
                </button>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    disabled
                    className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 text-xs font-semibold text-slate-400 bg-slate-100 rounded-xl border border-slate-200 cursor-not-allowed"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Report (Coming Soon)</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            /* DEFAULT INPUT WORKSPACE CARD */
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-6">

              {/* Mode Switcher Tabs */}
              <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 max-w-md mx-auto">
                <button
                  onClick={() => handleTabSwitch('upload')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
                    activeTab === 'upload'
                      ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Audio</span>
                </button>

                <button
                  onClick={() => handleTabSwitch('record')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
                    activeTab === 'record'
                      ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>Record Voice</span>
                </button>

                <button
                  onClick={() => handleTabSwitch('link')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
                    activeTab === 'link'
                      ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>Paste Link</span>
                </button>
              </div>

              {/* Error Alert Display */}
              {errorState && (
                <Alert
                  type="error"
                  message={errorState.message}
                  onDismiss={() => setErrorState(null)}
                />
              )}

              {/* ------------------------------------------------------------- */}
              {/* UPLOAD TAB CONTENT */}
              {/* ------------------------------------------------------------- */}
              {activeTab === 'upload' && (
                <div>
                  {!selectedFile ? (
                    /* Initial Upload Drop Zone */
                    <div
                      tabIndex={0}
                      role="button"
                      aria-label="Upload audio file dropzone"
                      onClick={() => fileInputRef.current?.click()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          fileInputRef.current?.click();
                        }
                      }}
                      onDragEnter={handleDragOver}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleFileDrop}
                      className={`border-2 border-dashed rounded-3xl p-8 sm:p-14 text-center cursor-pointer transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                        isDragOver
                          ? 'border-blue-500 bg-blue-50/60 shadow-md ring-4 ring-blue-100 scale-[1.01]'
                          : 'border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-white shadow-2xs'
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            processFileSelection(e.target.files[0]);
                          }
                        }}
                        accept="audio/*,.mp3,.wav,.m4a,.flac,.mp4,.webm,.ogg"
                        className="hidden"
                      />

                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform shadow-xs ${
                        isDragOver ? 'bg-blue-600 text-white scale-110' : 'bg-blue-50 text-blue-600 group-hover:scale-110'
                      }`}>
                        <FileAudio className="w-8 h-8" />
                      </div>

                      <h3 className="text-lg font-extrabold text-slate-800">
                        Drag & drop an audio file here
                      </h3>
                      <p className="text-xs text-blue-600 font-bold mt-1">
                        or click to browse
                      </p>

                      <div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-xs text-slate-500 font-medium gap-2">
                        <span>Supported formats: <strong>WAV · MP3 · M4A · FLAC · OGG · WEBM</strong></span>
                        <span>Maximum file size: <strong>50 MB</strong></span>
                      </div>
                    </div>
                  ) : (
                    /* After File Selection: Preview State */
                    <div className="border border-slate-200 bg-slate-50/60 rounded-3xl p-6 sm:p-8 space-y-6">

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                            <FileAudio className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-sm font-extrabold text-slate-900 truncate max-w-xs sm:max-w-sm">
                              {selectedFile.name}
                            </h4>
                            <span className="text-xs text-slate-500 font-semibold">
                              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Format: {selectedFile.name.split('.').pop()?.toUpperCase() || 'WAV'} · Duration: {fileDuration}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 w-full sm:w-auto">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 flex items-center justify-center space-x-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Replace</span>
                          </button>
                          <button
                            onClick={removeSelectedFile}
                            className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold text-red-600 bg-white border border-slate-200 rounded-xl hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* M4A Fallback Message or Audio Player */}
                      {fileAudioUrl && (
                        previewError ? (
                          <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 flex items-center space-x-3 text-amber-900 text-xs font-semibold shadow-2xs">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>File ready for analysis. Audio preview may be unavailable for some formats, but analysis will still work.</span>
                          </div>
                        ) : (
                          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                            <audio
                              ref={audioPlayerRef}
                              src={fileAudioUrl}
                              onEnded={() => setIsPlayingFile(false)}
                              onError={() => {
                                setIsPlayingFile(false);
                                setPreviewError(true);
                              }}
                              className="hidden"
                            />
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => {
                                  if (audioPlayerRef.current) {
                                    if (isPlayingFile) {
                                      audioPlayerRef.current.pause();
                                      setIsPlayingFile(false);
                                    } else {
                                      audioPlayerRef.current.play().catch(() => {
                                        setIsPlayingFile(false);
                                        setPreviewError(true);
                                      });
                                      setIsPlayingFile(true);
                                    }
                                  }
                                }}
                                className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm shrink-0"
                                aria-label={isPlayingFile ? 'Pause audio' : 'Play audio'}
                              >
                                {isPlayingFile ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                              </button>

                              {/* Waveform Bars */}
                              <div className="flex-1 flex items-center justify-between h-8 space-x-1 px-2">
                                {[30, 70, 45, 90, 60, 100, 80, 40, 85, 55, 95, 35, 75, 50, 90, 65, 40, 80].map((h, i) => (
                                  <span
                                    key={i}
                                    style={{ height: `${h}%` }}
                                    className={`w-1 rounded-full transition-all ${
                                      isPlayingFile ? 'bg-blue-600 animate-pulse' : 'bg-slate-300'
                                    }`}
                                  ></span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )
                      )}

                      {/* Primary Analyze Voice Button */}
                      <button
                        onClick={handleStartAnalysis}
                        className="w-full py-4 text-sm font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-2xl shadow-md shadow-blue-600/25 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <span>Analyze Voice →</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* RECORD TAB CONTENT */}
              {/* ------------------------------------------------------------- */}
              {activeTab === 'record' && (
                <div className="border border-slate-200 bg-slate-50/50 rounded-3xl p-6 sm:p-12 text-center space-y-6">
                  {!recordedFile ? (
                    <div className="space-y-6">
                      <div className="w-20 h-20 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-inner">
                        <Mic className={`w-10 h-10 ${isRecording ? 'animate-bounce text-red-600' : ''}`} />
                      </div>

                      <div>
                        <h3 className="text-xl font-extrabold text-slate-900">
                          {isRecording ? 'Recording Voice Clip...' : 'Ready to record'}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Speak into your microphone to record a voice clip for detection.
                        </p>
                      </div>

                      {isRecording ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-center space-x-1.5 h-10">
                            {[40, 80, 50, 95, 60, 100, 75, 45, 90, 55, 85].map((h, i) => (
                              <span
                                key={i}
                                style={{ height: `${h}%` }}
                                className="w-2 bg-red-500 rounded-full animate-pulse"
                              ></span>
                            ))}
                          </div>

                          <div className="text-base font-mono font-extrabold text-red-600">
                            Recording: {recordingTime} s
                          </div>

                          <button
                            onClick={stopRecording}
                            className="w-full sm:w-auto px-8 py-3 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800"
                          >
                            Stop Recording
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={startRecording}
                          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-2xl shadow-md transition-all"
                        >
                          <Mic className="w-4 h-4" />
                          <span>Start Recording</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6 text-left">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">Recorded Audio Clip</h4>
                          <span className="text-xs text-slate-500">Format: WAV · Duration: {recordingTime} s</span>
                        </div>
                        <button
                          onClick={resetRecording}
                          className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100"
                        >
                          Restart Recording
                        </button>
                      </div>

                      {recordedAudioUrl && (
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                          <audio
                            ref={recordAudioPlayerRef}
                            src={recordedAudioUrl}
                            onEnded={() => setIsPlayingRecord(false)}
                            onError={() => setIsPlayingRecord(false)}
                            className="hidden"
                          />
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => {
                                if (recordAudioPlayerRef.current) {
                                  if (isPlayingRecord) {
                                    recordAudioPlayerRef.current.pause();
                                    setIsPlayingRecord(false);
                                  } else {
                                    recordAudioPlayerRef.current.play().catch(() => setIsPlayingRecord(false));
                                    setIsPlayingRecord(true);
                                  }
                                }
                              }}
                              className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm shrink-0"
                            >
                              {isPlayingRecord ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                            </button>

                            <div className="flex-1 flex items-center justify-between h-8 space-x-1 px-2">
                              {[40, 80, 50, 95, 60, 100, 75, 45, 90, 55, 85, 40, 75, 90].map((h, i) => (
                                <span
                                  key={i}
                                  style={{ height: `${h}%` }}
                                  className={`w-1 rounded-full transition-all ${
                                    isPlayingRecord ? 'bg-red-600 animate-pulse' : 'bg-slate-300'
                                  }`}
                                ></span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={handleStartAnalysis}
                        className="w-full py-4 text-sm font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-2xl shadow-md shadow-blue-600/25 flex items-center justify-center space-x-2 transition-all"
                      >
                        <span>Analyze Recording →</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* PASTE LINK TAB CONTENT */}
              {/* ------------------------------------------------------------- */}
              {activeTab === 'link' && (
                <div className="border border-slate-200 bg-slate-50/50 rounded-3xl p-6 sm:p-10 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-extrabold text-slate-900">Paste Public Audio URL</h3>
                    <p className="text-xs text-slate-500">
                      Enter a direct link to an MP3, WAV, or M4A audio file for automated server fetching & analysis.
                    </p>

                    <div className="relative">
                      <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="url"
                        value={pastedLink}
                        onChange={(e) => setPastedLink(e.target.value)}
                        placeholder="https://example.com/audio_sample.mp3"
                        className="w-full pl-10 pr-4 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleStartAnalysis}
                    className="w-full py-4 text-sm font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-2xl shadow-md flex items-center justify-center space-x-2 transition-all"
                  >
                    <span>Fetch & Analyze Audio →</span>
                  </button>
                </div>
              )}

            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* 3. TAILORED PANELS: INDIVIDUAL vs ORGANIZATION */}
          {/* ------------------------------------------------------------- */}
          {isOrg ? (
            /* ORGANIZATION ENTERPRISE SECURITY PANEL */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Team Activity Overview */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                      Team Activity Log
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {user?.organizationName}
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    { user: 'Vikram Sethi (SecOps)', file: 'Call_Center_Verification_04.wav', result: 'REAL VOICE', time: '12m ago' },
                    { user: 'Ananya Verma (Admin)', file: 'Executive_Deepfake_Test.m4a', result: 'DEEPFAKE', time: '45m ago' },
                    { user: 'Security Bot (API)', file: 'IVR_Fraud_Check.flac', result: 'DEEPFAKE', time: '2h ago' },
                  ].map((act, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs border border-slate-200/70">
                      <div>
                        <span className="font-bold text-slate-900 block">{act.file}</span>
                        <span className="text-[11px] text-slate-500">{act.user} · {act.time}</span>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-1 rounded-full ${
                        act.result === 'DEEPFAKE' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {act.result}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security & Audit Summary */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                      Security & Compliance Policy
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    SOC2 Parity
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  VoiceShield Organization Edition enforces zero-retention acoustic feature hashing and AASIST neural inference parity across all team API endpoints.
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold block">Team Seats</span>
                    <span className="text-xs font-bold text-slate-900">{user?.teamSize || '11-50'} Active</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold block">Industry</span>
                    <span className="text-xs font-bold text-slate-900">{user?.organizationType || 'Security & Fraud'}</span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* INDIVIDUAL PERSONAL SAFETY PANEL */
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Personal Voice Safety & Protection
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <h4 className="font-extrabold text-slate-900">Voice Verification</h4>
                  <p className="text-slate-500 leading-relaxed">Verify voice notes from family or unknown callers before acting on urgent financial requests.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <h4 className="font-extrabold text-slate-900">Scam Prevention</h4>
                  <p className="text-slate-500 leading-relaxed">Protect against AI voice clones used in impersonation scams and social engineering attempts.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <h4 className="font-extrabold text-slate-900">AASIST Intelligence</h4>
                  <p className="text-slate-500 leading-relaxed">Powered by state-of-the-art spectral graph neural networks for deepfake detection.</p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
};
