import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  User,
  Building2,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  Mail,
  Lock,
  Phone,
  Building,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { AccountType, OrganizationType, TeamSize } from '../types/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const { login, signupIndividual, signupOrganization } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode === 'login' ? 'signin' : initialMode);
  
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode === 'login' ? 'signin' : initialMode);
      setSignupStep('select-type');
      setErrorMessage(null);
    }
  }, [isOpen, initialMode]);
  const [signupStep, setSignupStep] = useState<'select-type' | 'fill-form'>('select-type');
  const [selectedAccountType, setSelectedAccountType] = useState<AccountType>('individual');

  // Common Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Individual Form State
  const [indivName, setIndivName] = useState('');
  const [indivEmail, setIndivEmail] = useState('');
  const [indivPassword, setIndivPassword] = useState('');
  const [indivConfirmPassword, setIndivConfirmPassword] = useState('');
  const [indivPhone, setIndivPhone] = useState('');

  // Organization Form State
  const [orgName, setOrgName] = useState('');
  const [orgWorkEmail, setOrgWorkEmail] = useState('');
  const [orgPassword, setOrgPassword] = useState('');
  const [orgConfirmPassword, setOrgConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [organizationType, setOrganizationType] = useState<OrganizationType>('Security & Fraud');
  const [teamSize, setTeamSize] = useState<TeamSize>('11-50');

  // Status & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSwitchToSignup = () => {
    setMode('signup');
    setSignupStep('select-type');
    setErrorMessage(null);
  };

  const handleSwitchToSignin = () => {
    setMode('signin');
    setErrorMessage(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await login(loginEmail, loginPassword);
      setSuccessMessage('Successfully signed in to VoiceShield!');
      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessMessage(null);
        onClose();
      }, 1000);
    } catch {
      setIsSubmitting(false);
      setErrorMessage('Invalid credentials. Please try again.');
    }
  };

  const handleIndividualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (indivPassword && indivConfirmPassword && indivPassword !== indivConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await signupIndividual({
        name: indivName,
        email: indivEmail,
        password: indivPassword,
        phoneNumber: indivPhone,
      });

      setSuccessMessage('Individual account created successfully!');
      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessMessage(null);
        onClose();
      }, 1200);
    } catch {
      setIsSubmitting(false);
      setErrorMessage('Failed to create account. Please try again.');
    }
  };

  const handleOrganizationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orgPassword && orgConfirmPassword && orgPassword !== orgConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await signupOrganization({
        name: orgName,
        email: orgWorkEmail,
        password: orgPassword,
        organizationName: companyName,
        organizationType,
        teamSize,
      });

      setSuccessMessage(`Organization account created for ${companyName}!`);
      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessMessage(null);
        onClose();
      }, 1200);
    } catch {
      setIsSubmitting(false);
      setErrorMessage('Failed to create organization account. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 sm:p-8 relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center space-x-2.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Voice<span className="text-blue-600">Shield</span>
            </span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 ml-2">
              WORKSPACE
            </span>
          </div>
        </div>

        {/* Success Message Banner */}
        {successMessage ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-extrabold text-slate-900">{successMessage}</h4>
            <p className="text-xs text-slate-500">Loading your VoiceShield dashboard environment...</p>
          </div>
        ) : (
          <div>
            
            {/* Mode Toggle Pills (Sign In / Sign Up) */}
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 mb-6 max-w-xs mx-auto">
              <button
                type="button"
                onClick={handleSwitchToSignin}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  mode === 'signin'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={handleSwitchToSignup}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center space-x-2">
                <X className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* 1. COMMON LOGIN FORM */}
            {/* ------------------------------------------------------------- */}
            {mode === 'signin' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Sign in to access your VoiceShield detection workspace & scan history.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="name@organization.com or personal email"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Password</label>
                    <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[11px] font-semibold text-blue-600 hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <span>{isSubmitting ? 'Signing In...' : 'Sign In to Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[11px] text-center text-slate-400 mt-4">
                  VoiceShield Zero-Trust Authentication Standard
                </p>
              </form>
            )}

            {/* ------------------------------------------------------------- */}
            {/* 2. SIGNUP FLOW */}
            {/* ------------------------------------------------------------- */}
            {mode === 'signup' && (
              <div>
                {/* STEP 1: Account Type Selection */}
                {signupStep === 'select-type' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        How will you use VoiceShield?
                      </h3>
                      <p className="text-xs text-slate-500 mt-1.5">
                        Choose the account type that best fits your needs.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      
                      {/* CARD 1: INDIVIDUAL */}
                      <div
                        onClick={() => setSelectedAccountType('individual')}
                        className={`p-5 rounded-2xl border-2 text-left cursor-pointer transition-all duration-200 relative group ${
                          selectedAccountType === 'individual'
                            ? 'border-blue-600 bg-blue-50/60 shadow-md ring-4 ring-blue-100'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                              selectedAccountType === 'individual' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white'
                            }`}>
                              <User className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="text-base font-extrabold text-slate-900">Individual</h4>
                              <span className="text-[10px] font-bold text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-200">
                                Personal Account
                              </span>
                            </div>
                          </div>

                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            selectedAccountType === 'individual'
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}>
                            {selectedAccountType === 'individual' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 mt-3 font-normal leading-relaxed">
                          For personal use, protecting yourself from AI-generated and cloned voices.
                        </p>

                        <div className="mt-3 pt-3 border-t border-slate-200/60 text-[11px] font-semibold text-slate-500">
                          Personal safety • Voice verification • Scam protection
                        </div>
                      </div>

                      {/* CARD 2: ORGANIZATION */}
                      <div
                        onClick={() => setSelectedAccountType('organization')}
                        className={`p-5 rounded-2xl border-2 text-left cursor-pointer transition-all duration-200 relative group ${
                          selectedAccountType === 'organization'
                            ? 'border-blue-600 bg-blue-50/60 shadow-md ring-4 ring-blue-100'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                              selectedAccountType === 'organization' ? 'bg-blue-600 text-white' : 'bg-indigo-100 text-indigo-700 group-hover:bg-blue-600 group-hover:text-white'
                            }`}>
                              <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="text-base font-extrabold text-slate-900">Organization</h4>
                              <span className="text-[10px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded border border-indigo-200">
                                Business & Teams
                              </span>
                            </div>
                          </div>

                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            selectedAccountType === 'organization'
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}>
                            {selectedAccountType === 'organization' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 mt-3 font-normal leading-relaxed">
                          For companies and teams that need voice authenticity and deepfake detection.
                        </p>

                        <div className="mt-3 pt-3 border-t border-slate-200/60 text-[11px] font-semibold text-slate-500">
                          Security teams • Media • Finance • Customer support
                        </div>
                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={() => setSignupStep('fill-form')}
                      className="w-full py-3.5 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <span>Continue to {selectedAccountType === 'individual' ? 'Individual' : 'Organization'} Signup</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* STEP 2: Registration Form */}
                {signupStep === 'fill-form' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <button
                        type="button"
                        onClick={() => setSignupStep('select-type')}
                        className="inline-flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Change Account Type</span>
                      </button>

                      <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                        selectedAccountType === 'individual'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}>
                        {selectedAccountType}
                      </span>
                    </div>

                    {/* INDIVIDUAL FORM */}
                    {selectedAccountType === 'individual' && (
                      <form onSubmit={handleIndividualSubmit} className="space-y-3 text-left">
                        <div className="mb-2">
                          <h3 className="text-xl font-extrabold text-slate-900">Create Individual Account</h3>
                          <p className="text-xs text-slate-500">Protect your personal voice interactions.</p>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name</label>
                          <div className="relative">
                            <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                              type="text"
                              required
                              value={indivName}
                              onChange={(e) => setIndivName(e.target.value)}
                              placeholder="e.g. Rahul Sharma"
                              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">Email Address</label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                              type="email"
                              required
                              value={indivEmail}
                              onChange={(e) => setIndivEmail(e.target.value)}
                              placeholder="rahul@example.com"
                              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">Password</label>
                            <input
                              type="password"
                              required
                              value={indivPassword}
                              onChange={(e) => setIndivPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">Confirm Password</label>
                            <input
                              type="password"
                              required
                              value={indivConfirmPassword}
                              onChange={(e) => setIndivConfirmPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">Phone Number (Optional)</label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                              type="tel"
                              value={indivPhone}
                              onChange={(e) => setIndivPhone(e.target.value)}
                              placeholder="+91 98765 43210"
                              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-3 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center space-x-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 mt-2"
                        >
                          <span>{isSubmitting ? 'Creating Account...' : 'Create Account'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </form>
                    )}

                    {/* ORGANIZATION FORM */}
                    {selectedAccountType === 'organization' && (
                      <form onSubmit={handleOrganizationSubmit} className="space-y-3 text-left">
                        <div className="mb-2">
                          <h3 className="text-xl font-extrabold text-slate-900">Create Organization Account</h3>
                          <p className="text-xs text-slate-500">Deploy voice authenticity tools for your company.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name</label>
                            <input
                              type="text"
                              required
                              value={orgName}
                              onChange={(e) => setOrgName(e.target.value)}
                              placeholder="Ananya Verma"
                              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">Work Email</label>
                            <input
                              type="email"
                              required
                              value={orgWorkEmail}
                              onChange={(e) => setOrgWorkEmail(e.target.value)}
                              placeholder="ananya@company.com"
                              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">Organization / Company Name</label>
                          <div className="relative">
                            <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                              type="text"
                              required
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              placeholder="Acme Security Technologies"
                              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">Organization Type</label>
                            <select
                              value={organizationType}
                              onChange={(e) => setOrganizationType(e.target.value as OrganizationType)}
                              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 bg-white"
                            >
                              <option value="Security & Fraud">Security & Fraud</option>
                              <option value="Media & Journalism">Media & Journalism</option>
                              <option value="Finance & Banking">Finance & Banking</option>
                              <option value="Customer Support">Customer Support</option>
                              <option value="Healthcare">Healthcare</option>
                              <option value="Technology">Technology</option>
                              <option value="Other Enterprise">Other Enterprise</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">Team Size</label>
                            <select
                              value={teamSize}
                              onChange={(e) => setTeamSize(e.target.value as TeamSize)}
                              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 bg-white"
                            >
                              <option value="1-10">1-10 employees</option>
                              <option value="11-50">11-50 employees</option>
                              <option value="51-200">51-200 employees</option>
                              <option value="201-500">201-500 employees</option>
                              <option value="500+">500+ employees</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">Password</label>
                            <input
                              type="password"
                              required
                              value={orgPassword}
                              onChange={(e) => setOrgPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">Confirm Password</label>
                            <input
                              type="password"
                              required
                              value={orgConfirmPassword}
                              onChange={(e) => setOrgConfirmPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-3 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center space-x-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 mt-2"
                        >
                          <span>{isSubmitting ? 'Creating Organization Account...' : 'Create Organization Account'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </form>
                    )}
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
