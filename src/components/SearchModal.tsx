import React, { useState } from 'react';
import { Search, X, Shield, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTopic: (id: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectTopic }) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const topics = [
    { title: 'Detect AI Voice Clone', id: 'check-voice', category: 'Product' },
    { title: 'Hindi & Regional Language Support', id: 'technology', category: 'Technology' },
    { title: 'Digital Arrest Scam Prevention', id: 'resources', category: 'Security' },
    { title: 'API & Telephony Integration', id: 'how-it-works', category: 'Developers' },
    { title: 'Zero Data Retention & Privacy', id: 'safety', category: 'Compliance' },
  ];

  const filtered = topics.filter(t => t.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-slate-100 flex items-center space-x-3">
          <Search className="w-5 h-5 text-blue-600" />
          <input
            type="text"
            placeholder="Search VoiceShield features, languages, APIs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm font-medium text-slate-800 focus:outline-none placeholder:text-slate-400"
            autoFocus
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-80 overflow-y-auto space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-2">
            Suggested Topics
          </span>
          {filtered.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                onSelectTopic(item.id);
                onClose();
              }}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-50/80 cursor-pointer group transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Shield className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800">{item.title}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {item.category}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
