'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { supabase } from '@/lib/supabase';

// Helper component for live ticking timer
function TimeCounter({ createdAt, status }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const start = new Date(createdAt).getTime();
    
    const updateTime = () => {
      const now = Date.now();
      setSeconds(Math.floor((now - start) / 1000));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const isUrgent = status === 'reported' && seconds > 60;
  
  const formatTime = (totalSeconds) => {
    if (totalSeconds < 60) return `${totalSeconds}s`;
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <span className={`font-mono text-sm tracking-widest ${isUrgent ? 'text-red-500 animate-pulse' : 'text-white/50'}`}>
      {formatTime(seconds)}
    </span>
  );
}

export default function ClientDashboard({ initialIncidents, reportUrl }) {
  const router = useRouter();
  const [incidents, setIncidents] = useState(initialIncidents);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    // Generate QR Code
    QRCode.toDataURL(reportUrl, {
      width: 150,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    }).then(url => setQrCodeDataUrl(url)).catch(err => console.error(err));

    // Supabase Realtime Subscription
    const channel = supabase
      .channel('dashboard-incidents')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'incidents' },
        (payload) => {
          setIncidents(prev => [payload.new, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'incidents' },
        (payload) => {
          setIncidents(prev => prev.map(inc => inc.id === payload.new.id ? payload.new : inc));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [reportUrl]);

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const statusColors = {
    reported: 'bg-amber-500',
    acknowledged: 'bg-blue-500',
    responding: 'bg-orange-500',
    escalated: 'bg-red-500',
    resolved: 'bg-green-500'
  };

  const getEmoji = (category) => {
    const map = {
      'Medical Emergency': '🚑',
      'Fire': '🔥',
      'Security Threat': '🚨',
      'Assault': '⚠️',
      'Flood': '💧',
      'Other': 'ℹ️'
    };
    return map[category] || 'ℹ️';
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#050505]">
      {/* Navbar */}
      <nav className="w-full bg-[#0B1F3A]/40 backdrop-blur-3xl border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl md:text-2xl font-light tracking-tight">RapidResponse</h1>
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-green-400 font-medium">System Online</span>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            {qrCodeDataUrl && (
              <div className="hidden sm:flex items-center space-x-3 bg-white/5 rounded-2xl p-2 border border-white/5">
                <img src={qrCodeDataUrl} alt="Report QR Code" className="w-10 h-10 rounded-lg" />
                <div className="pr-2">
                  <p className="text-[10px] uppercase tracking-wider text-white/50">Scan to</p>
                  <p className="text-xs font-medium text-white/80">Report</p>
                </div>
              </div>
            )}
            <button 
              onClick={handleSignOut}
              className="text-sm font-medium text-white/70 hover:text-white premium-transition bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-full"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Feed */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 md:py-24">
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between">
          <div>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-2">Live Feed</h2>
            <p className="text-white/40">Monitoring active incidents across the property</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-mono">
              Total Active: {incidents.filter(i => i.status !== 'resolved').length}
            </div>
          </div>
        </div>

        {incidents.length === 0 ? (
          <div className="glass-panel-outer w-full py-24 mt-12 animate-in fade-in zoom-in duration-700">
            <div className="glass-panel-inner flex flex-col items-center justify-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                <span className="text-4xl">✅</span>
              </div>
              <h3 className="text-xl font-light">No active incidents — all clear.</h3>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {incidents.map((incident) => {
              const isExpanded = expandedId === incident.id;
              
              return (
                <div 
                  key={incident.id} 
                  className={`glass-panel-outer cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isExpanded ? 'ring-white/20 shadow-2xl scale-[1.01]' : 'hover:ring-white/20 active:scale-[0.99]'}`}
                  onClick={() => setExpandedId(isExpanded ? null : incident.id)}
                >
                  <div className={`glass-panel-inner p-6 transition-all duration-500 ${isExpanded ? 'bg-black/60' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: Basic Info */}
                      <div className="flex items-start space-x-4">
                        <div className="text-4xl pt-1">{getEmoji(incident.category)}</div>
                        <div>
                          <div className="flex items-center space-x-3 mb-1">
                            <span className="font-mono text-sm tracking-wider text-white/50">{incident.reference_code}</span>
                            <span className="text-white/30">•</span>
                            <span className="text-lg font-medium">{incident.category}</span>
                          </div>
                          <p className="text-white/70">{incident.location}</p>
                        </div>
                      </div>

                      {/* Right: Status & Time */}
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${statusColors[incident.status] || 'bg-gray-500'} ${incident.status === 'reported' ? 'animate-pulse' : ''}`}></div>
                          <span className="text-xs uppercase tracking-widest font-medium text-white/80">{incident.status}</span>
                        </div>
                        {incident.status !== 'resolved' && (
                          <TimeCounter createdAt={incident.created_at} status={incident.status} />
                        )}
                      </div>
                    </div>

                    {/* Expanding Detail Panel - Skeleton for Phase 5 */}
                    <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-8 pt-6 border-t border-white/10' : 'grid-rows-[0fr] opacity-0 mt-0 pt-0 border-transparent'}`}>
                      <div className="overflow-hidden">
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-xs uppercase tracking-wider text-white/40 mb-2">Guest Note</h4>
                            <p className="text-white/80 bg-white/5 p-4 rounded-xl border border-white/5">{incident.note || 'No additional details provided.'}</p>
                          </div>
                          <div className="flex items-center justify-between text-xs text-white/40 font-mono">
                            <span>Reported: {new Date(incident.created_at).toLocaleString()}</span>
                            {/* Controls will be added here in Phase 6 */}
                            <span className="text-white/20 italic">Controls placeholder</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
