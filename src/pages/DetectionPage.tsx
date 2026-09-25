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
  Share2,
  ChevronDown,
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { analyzeVoice } from '../api/voiceAnalysis';
import { PROCESSING_STAGES } from '../api/mockService';
import { validateAudioFile } from '../utils/fileValidation';
import { mapResultToUI } from '../utils/resultMapper';
import type { AnalysisStatus, UIAnalysisResult, AnalysisError } from '../types/voiceAnalysis';
import { Alert } from '../components/ui/Alert';

export const DetectionPage: React.FC = () => {
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState<'upload' | 'record'>('upload');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Unified Single Status State Machine
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [errorState, setErrorState] = useState<AnalysisError | null>(null);

  // File Upload States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileAudioUrl, setFileAudioUrl] = useState<string | null>(null);
  const [fileDuration, setFileDuration] = useState<string>('00:00');
  const [isPlayingFile, setIsPlayingFile] = useState<boolean>(false);

  // Recording States
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [recordedFile, setRecordedFile] = useState<File | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecord, setIsPlayingRecord] = useState<boolean>(false);

  // Analysis Result
  const [analysisResult, setAnalysisResult] = useState<UIAnalysisResult | null>(null);

  // Breakdown Accordion Expansion
  const [expandedSection, setExpandedSection] = useState<string | null>('summary');

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const recordAudioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (fileAudioUrl) URL.revokeObjectURL(fileAudioUrl);
      if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [fileAudioUrl, recordedAudioUrl]);

  // Handle Drag & Drop / File Selection
  const processFileSelection = (file: File) => {
    setErrorState(null);
    
    // Centralized File Validation
    const valErr = validateAudioFile(file);
    if (valErr) {
      setErrorState(valErr);
      return;
    }

    if (fileAudioUrl) URL.revokeObjectURL(fileAudioUrl);
    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setFileAudioUrl(url);

    // Calculate duration
    const tempAudio = new Audio(url);
    tempAudio.onloadedmetadata = () => {
      const mins = Math.floor(tempAudio.duration / 60);
      const secs = Math.floor(tempAudio.duration % 60);
      setFileDuration(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
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
    if (fileAudioUrl) URL.revokeObjectURL(fileAudioUrl);
    setFileAudioUrl(null);
    setErrorState(null);
    setIsPlayingFile(false);
  };

  // Recording Architecture (Converts Blob to File for single unified API pipeline)
  const startRecording = async () => {
    setErrorState(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // Convert Blob to File object for unified API consumption
        const fileObj = new File([audioBlob], 'recorded_voice.wav', { type: 'audio/wav' });
        setRecordedFile(fileObj);

        if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone error', err);
      setErrorState({
        category: 'PROCESSING_FAILED',
        message: 'Microphone permission denied or unavailable. Please allow microphone access in browser settings.',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
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

  // Main Unified Analysis Request
  const handleStartAnalysis = async () => {
    const targetFile = activeTab === 'upload' ? selectedFile : recordedFile;
    if (!targetFile) return;

    setStatus('uploading');
    setCurrentStageIndex(0);
    setErrorState(null);
    setAnalysisResult(null);

    try {
      const rawResponse = await analyzeVoice(targetFile, (stageIdx) => {
        setCurrentStageIndex(stageIdx);
        if (stageIdx >= 2) setStatus('processing');
      });

      const mappedUI = mapResultToUI(rawResponse, targetFile.name);
      setAnalysisResult(mappedUI);
      setStatus('success');
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
    } catch (err: any) {
      setStatus('error');
      setErrorState(
        err.message
          ? (err as AnalysisError)
          : { category: 'UNKNOWN_ERROR', message: 'An unexpected error occurred during audio analysis.' }
      );
    }
  };

  // Format Helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 pt-28 pb-20 font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-md"
          >
            <span>← Back to VoiceShield Home</span>
          </button>
        </div>

        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-4 shadow-2xs">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>AI Voice Authenticity Workspace</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Check a Voice
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
            Upload or record a voice sample and analyze it for signs of AI generation, cloning, or synthetic manipulation.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-4 text-xs font-semibold text-slate-600">
            <span className="flex items-center space-x-1 bg-white/80 px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Audio stays under your control</span>
            </span>
            <span className="flex items-center space-x-1 bg-white/80 px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Multiple audio formats supported</span>
            </span>
            <span className="flex items-center space-x-1 bg-white/80 px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>AI-powered analysis</span>
            </span>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* WORKSPACE STATES */}
        {/* ------------------------------------------------------------- */}

        {status === 'uploading' || status === 'processing' ? (
          /* ANALYSIS PROCESSING STATE */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
              <FileAudio className="w-8 h-8 text-blue-600" />
            </div>

            <div>
              <h3 className="text-2xl font-extrabold text-slate-900">Analyzing your voice...</h3>
              <p className="text-xs text-slate-500 mt-1">This may take a few seconds.</p>
            </div>

            {/* Stages Progress Indicator */}
            <div className="space-y-2 max-w-sm mx-auto text-left">
              {PROCESSING_STAGES.map((stageLabel, idx) => (
                <div
                  key={idx}
                  className={`flex items-center space-x-3 p-2.5 rounded-xl text-xs font-semibold transition-all ${
                    idx === currentStageIndex
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : idx < currentStageIndex
                      ? 'text-emerald-700 bg-emerald-50/60'
                      : 'text-slate-400 bg-slate-50'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold">
                    {idx < currentStageIndex ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : idx === currentStageIndex ? (
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </span>
                  <span>{stageLabel}</span>
                </div>
              ))}
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
                  {analysisResult.modelName}
                </span>
                {analysisResult.isDemo && (
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    Sample Analysis
                  </span>
                )}
              </div>
            </div>

            {/* Core Status Card */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-slate-50/80 p-6 sm:p-8 rounded-2xl border border-slate-200/90">
              
              {/* Circular Indicator */}
              <div className="md:col-span-5 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-6">
                <div className="relative w-32 h-32 flex items-center justify-center mb-2">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="54" stroke="#e2e8f0" strokeWidth="8" fill="transparent" />
                    <circle
                      cx="64"
                      cy="64"
                      r="54"
                      stroke={analysisResult.label === 'human' ? '#10b981' : '#2563eb'}
                      strokeWidth="8"
                      strokeDasharray={339}
                      strokeDashoffset={339 - (339 * analysisResult.confidence) / 100}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-3xl font-extrabold text-slate-900 block">
                      {analysisResult.confidence}%
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Confidence
                    </span>
                  </div>
                </div>

                {analysisResult.isDemo && (
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-200/80 px-2.5 py-0.5 rounded mt-1">
                    Illustrative sample result
                  </span>
                )}
              </div>

              {/* Status Text & Explanation Card */}
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center space-x-2">
                  {analysisResult.label === 'human' ? (
                    <span className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{analysisResult.summaryLabel}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
                      <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{analysisResult.summaryLabel}</span>
                    </span>
                  )}
                </div>

                {/* Why this result? Card */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Why this result?</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {analysisResult.explanation}
                  </p>
                </div>
              </div>

            </div>

            {/* Expandable Breakdown Sections */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Detailed Analysis Breakdown
              </h3>

              {/* Section 1: Detection Summary */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'summary' ? null : 'summary')}
                  className="w-full p-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-bold text-xs text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <span>Detection Summary</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedSection === 'summary' ? 'rotate-180' : ''}`} />
                </button>
                {expandedSection === 'summary' && (
                  <div className="p-4 bg-white space-y-2 text-xs border-t border-slate-100">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Classification</span>
                      <strong className="text-slate-900">{analysisResult.summaryLabel}</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Confidence Score</span>
                      <strong className="text-slate-900">{analysisResult.confidence}%</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Audio Information */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'audio' ? null : 'audio')}
                  className="w-full p-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-bold text-xs text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <span>Audio Information</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedSection === 'audio' ? 'rotate-180' : ''}`} />
                </button>
                {expandedSection === 'audio' && (
                  <div className="p-4 bg-white grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs border-t border-slate-100">
                    <div>
                      <span className="text-slate-500 block">Duration</span>
                      <strong className="text-slate-900">{analysisResult.duration} sec</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Format</span>
                      <strong className="text-slate-900">{analysisResult.format}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Sample Rate</span>
                      <strong className="text-slate-900">{analysisResult.sampleRate}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Model Analysis */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'model' ? null : 'model')}
                  className="w-full p-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-bold text-xs text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <span>Model Analysis</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedSection === 'model' ? 'rotate-180' : ''}`} />
                </button>
                {expandedSection === 'model' && (
                  <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {analysisResult.modelDetails}
                  </div>
                )}
              </div>

              {/* Section 4: Limitations */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'limitations' ? null : 'limitations')}
                  className="w-full p-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-bold text-xs text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <span>Limitations</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedSection === 'limitations' ? 'rotate-180' : ''}`} />
                </button>
                {expandedSection === 'limitations' && (
                  <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {analysisResult.limitations}
                  </div>
                )}
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
                  title="PDF report generation will be enabled with production backend"
                  aria-label="Download Report (Coming Soon)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Report (Coming Soon)</span>
                </button>

                <button
                  disabled
                  className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 text-xs font-semibold text-slate-400 bg-slate-100 rounded-xl border border-slate-200 cursor-not-allowed"
                  title="Share result will be enabled with production backend"
                  aria-label="Share Result"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Result</span>
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* DEFAULT INPUT WORKSPACE CARD (idle / error states) */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-6">
            
            {/* Mode Switcher Tabs */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 max-w-md mx-auto">
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-xs font-bold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  activeTab === 'upload'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Upload Audio</span>
              </button>
              <button
                onClick={() => setActiveTab('record')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-xs font-bold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  activeTab === 'record'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>Record Voice</span>
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

            {/* UPLOAD TAB CONTENT */}
            {activeTab === 'upload' && (
              <div>
                {!selectedFile ? (
                  /* Initial Upload Drag & Drop Zone */
                  <div
                    tabIndex={0}
                    role="button"
                    aria-label="Upload audio file dropzone. Press Enter or Space to browse files."
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
                      accept="audio/*,.mp3,.wav,.m4a,.flac"
                      className="hidden"
                    />

                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform shadow-xs ${
                      isDragOver ? 'bg-blue-600 text-white scale-110' : 'bg-blue-50 text-blue-600 group-hover:scale-110'
                    }`}>
                      <FileAudio className="w-8 h-8" />
                    </div>

                    <h3 className="text-lg font-extrabold text-slate-800">
                      {isDragOver ? 'Drop file to upload' : 'Drop your audio here'}
                    </h3>
                    <p className="text-xs text-blue-600 font-bold mt-1">
                      or choose a file
                    </p>

                    <div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-xs text-slate-500 font-medium gap-2">
                      <span>Supported formats: <strong>MP3 · WAV · M4A · FLAC</strong></span>
                      <span>Maximum size: <strong>50 MB</strong></span>
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
                          <span className="text-xs text-slate-500">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Duration: {fileDuration}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center space-x-1 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Replace</span>
                        </button>
                        <button
                          onClick={removeSelectedFile}
                          className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold text-red-600 bg-white border border-slate-200 rounded-xl hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Audio Player & Waveform Visualizer */}
                    {fileAudioUrl && (
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                        <audio
                          ref={audioPlayerRef}
                          src={fileAudioUrl}
                          onEnded={() => setIsPlayingFile(false)}
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
                                  audioPlayerRef.current.play();
                                  setIsPlayingFile(true);
                                }
                              }
                            }}
                            className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                    )}

                    {/* Analyze Voice Primary Button */}
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

            {/* RECORD TAB CONTENT */}
            {activeTab === 'record' && (
              <div className="border border-slate-200 bg-slate-50/50 rounded-3xl p-6 sm:p-12 text-center space-y-6">
                {!recordedFile ? (
                  /* Ready to Record State */
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
                          Recording: {formatTime(recordingTime)}
                        </div>

                        <button
                          onClick={stopRecording}
                          className="w-full sm:w-auto px-8 py-3 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                        >
                          Stop Recording
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={startRecording}
                        className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-2xl shadow-md transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-600"
                      >
                        <Mic className="w-4 h-4" />
                        <span>Start Recording</span>
                      </button>
                    )}
                  </div>
                ) : (
                  /* Recorded Audio Preview State */
                  <div className="space-y-6 text-left">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">Recorded Audio Clip</h4>
                        <span className="text-xs text-slate-500">Duration: {formatTime(recordingTime)}</span>
                      </div>
                      <button
                        onClick={resetRecording}
                        className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                                  recordAudioPlayerRef.current.play();
                                  setIsPlayingRecord(true);
                                }
                              }
                            }}
                            className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm shrink-0 focus:outline-none focus:ring-2 focus:ring-red-600"
                            aria-label={isPlayingRecord ? 'Pause recording' : 'Play recording'}
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
                      className="w-full py-4 text-sm font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-2xl shadow-md shadow-blue-600/25 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <span>Analyze Recording →</span>
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
