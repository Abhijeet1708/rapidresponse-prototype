'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const CATEGORIES = [
  { id: 'Medical Emergency', label: 'Medical Emergency', emoji: '🚑' },
  { id: 'Fire', label: 'Fire', emoji: '🔥' },
  { id: 'Security Threat', label: 'Security Threat', emoji: '🚨' },
  { id: 'Assault', label: 'Assault', emoji: '⚠️' },
  { id: 'Flood', label: 'Flood', emoji: '💧' },
  { id: 'Other', label: 'Other', emoji: 'ℹ️' },
];

export default function ReportPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Confirmation state
  const [incidentId, setIncidentId] = useState(null);
  const [referenceCode, setReferenceCode] = useState('');
  const [status, setStatus] = useState('reported');

  useEffect(() => {
    if (!incidentId) return;

    // Set up Supabase Realtime subscription
    const channel = supabase
      .channel(`incident-${incidentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'incidents',
          filter: `id=eq.${incidentId}`,
        },
        (payload) => {
          if (payload.new && payload.new.status) {
            setStatus(payload.new.status);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [incidentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedCategory || !location.trim()) {
      setError('Please select a category and provide your location.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/incidents/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          location: location.trim(),
          note: note.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit report');
      }

      setIncidentId(data.id);
      setReferenceCode(data.reference_code);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatus = () => {
    const statusMap = {
      reported: { text: 'Reported — waiting for staff acknowledgement', color: 'bg-amber-500' },
      acknowledged: { text: 'Acknowledged — staff is reviewing', color: 'bg-blue-500' },
      responding: { text: 'Responding — help is on the way', color: 'bg-orange-500' },
      escalated: { text: 'Escalated — additional authorities notified', color: 'bg-red-500' },
      resolved: { text: 'Resolved — incident closed', color: 'bg-green-500' },
    };

    const currentStatus = statusMap[status] || statusMap.reported;

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in zoom-in duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
        <div className="text-center space-y-4">
          <div className="inline-block rounded-full px-4 py-1.5 text-[12px] uppercase tracking-[0.2em] font-medium bg-white/5 border border-white/10 text-white/70">
            Emergency Reported
          </div>
          <h2 className="text-5xl font-light tracking-tight">{referenceCode}</h2>
          <p className="text-white/50 text-sm">Please keep this page open for live updates.</p>
        </div>

        <div className="glass-panel-outer w-full max-w-sm mx-auto">
          <div className="glass-panel-inner p-6 flex flex-col items-center space-y-6">
            <div className="relative">
              <div className={`absolute -inset-2 rounded-full blur-md opacity-40 ${currentStatus.color}`}></div>
              <div className={`relative w-6 h-6 rounded-full shadow-lg ${currentStatus.color} animate-pulse`}></div>
            </div>
            <p className="text-center font-medium text-lg leading-snug">
              {currentStatus.text}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (incidentId) {
    return (
      <main className="min-h-[100dvh] px-4 py-8 max-w-lg mx-auto flex flex-col">
        <nav className="mb-12 text-center">
          <h1 className="text-sm tracking-[0.2em] uppercase text-white/50 font-medium">Grand Horizon Hotel</h1>
        </nav>
        {renderStatus()}
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] px-4 py-8 max-w-lg mx-auto flex flex-col premium-transition">
      <nav className="mb-8 text-center">
        <h1 className="text-sm tracking-[0.2em] uppercase text-white/50 font-medium">Grand Horizon Hotel</h1>
      </nav>

      <div className="mb-10 text-center space-y-2">
        <div className="inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-red-500/10 text-red-400 border border-red-500/20 mb-2">
          Emergency Protocol
        </div>
        <h2 className="text-3xl font-light tracking-tight">Report an Emergency</h2>
        <p className="text-white/50 text-sm">Select a category and provide your location.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 space-y-8">
        <div className="grid grid-cols-2 gap-4">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`premium-transition flex flex-col items-center justify-center p-6 rounded-2xl border ${
                  isSelected 
                    ? 'border-[#0B1F3A] bg-[#0B1F3A]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' 
                    : 'border-white/5 bg-white/5 hover:bg-white/10'
                } group active:scale-[0.98]`}
              >
                <span className="text-3xl mb-3 group-hover:scale-110 premium-transition">{cat.emoji}</span>
                <span className="text-sm font-medium text-center leading-tight">{cat.label}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-6">
          <div className="glass-panel-outer">
            <div className="glass-panel-inner p-4 space-y-2">
              <label htmlFor="location" className="block text-xs uppercase tracking-wider text-white/50 pl-1">
                Location <span className="text-red-400">*</span>
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Room number, floor, or describe where you are"
                className="w-full bg-transparent border-none text-white placeholder-white/30 focus:outline-none focus:ring-0 text-base"
              />
            </div>
          </div>

          <div className="glass-panel-outer">
            <div className="glass-panel-inner p-4 space-y-2">
              <label htmlFor="note" className="block text-xs uppercase tracking-wider text-white/50 pl-1">
                Additional Details (Optional)
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Any other relevant information..."
                rows={3}
                className="w-full bg-transparent border-none text-white placeholder-white/30 focus:outline-none focus:ring-0 text-base resize-none"
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center premium-transition bg-red-500/10 py-3 rounded-xl border border-red-500/20">
            {error}
          </p>
        )}

        <div className="mt-auto pt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className="group w-full rounded-full bg-[#0B1F3A] border border-[#16355F] text-white py-4 px-6 text-lg font-medium flex items-center justify-center premium-transition hover:bg-[#0D2444] active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 shadow-lg relative overflow-hidden"
          >
            {isSubmitting ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Submitting...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-3 w-full justify-center">
                <span>Submit Emergency</span>
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105 premium-transition ml-2">
                  ↗
                </span>
              </span>
            )}
          </button>
        </div>
      </form>
    </main>
  );
}
