'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { supabase } from '@/lib/supabase';

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

function IncidentControls({ incident }) {
  const [notes, setNotes] = useState(incident.staff_notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const statuses = ['reported', 'acknowledged', 'responding', 'escalated', 'resolved'];
  const currentIndex = statuses.indexOf(incident.status);

  const updateStatus = async (newStatus) => {
    setIsUpdatingStatus(true);
    try {
      await fetch('/api/incidents/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: incident.id, status: newStatus }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const saveNotes = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/incidents/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: incident.id, staff_notes: notes }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8" onClick={(e) => e.stopPropagation()}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/40 mb-3">Guest Note</h4>
            <p className="text-white/80 bg-white/5 p-4 rounded-2xl border border-white/5 leading-relaxed">
              {incident.note || <span className="text-white/30 italic">No additional details provided.</span>}
            </p>
          </div>
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/40 mb-3">Timeline</h4>
            <div className="space-y-2 text-xs font-mono text-white/50">
              <div className="flex justify-between">
                <span>Created</span>
                <span className="text-white/80">{new Date(incident.created_at).toLocaleString()}</span>
              </div>
              {incident.acknowledged_at && (
                <div className="flex justify-between">
                  <span>Acknowledged</span>
                  <span className="text-white/80">{new Date(incident.acknowledged_at).toLocaleString()}</span>
                </div>
              )}
              {incident.resolved_at && (
                <div className="flex justify-between">
                  <span>Resolved</span>
                  <span className="text-white/80">{new Date(incident.resolved_at).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/40 mb-3">Staff Notes</h4>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal responder notes..."
              rows={3}
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 premium-transition resize-none"
            />
            <div className="mt-3 flex justify-end">
              <button 
                onClick={saveNotes}
                disabled={isSaving || notes === (incident.staff_notes || '')}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-4 py-2 rounded-full premium-transition active:scale-[0.98] disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-white/10">
        <h4 className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/40 mb-4">Action Controls</h4>
        <div className="flex flex-wrap gap-3">
          <button
            disabled={currentIndex >= 1 || isUpdatingStatus}
            onClick={() => updateStatus('acknowledged')}
            className={`flex-1 min-w-[120px] rounded-full py-3 px-4 text-xs font-medium premium-transition active:scale-[0.98] ${
              currentIndex >= 1 
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 opacity-50 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg'
            }`}
          >
            Acknowledge
          </button>
          
          <button
            disabled={currentIndex >= 2 || isUpdatingStatus}
            onClick={() => updateStatus('responding')}
            className={`flex-1 min-w-[120px] rounded-full py-3 px-4 text-xs font-medium premium-transition active:scale-[0.98] ${
              currentIndex >= 2 
                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 opacity-50 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-500 shadow-lg'
            }`}
          >
            Responding
          </button>

          <button
            disabled={currentIndex >= 3 || isUpdatingStatus}
            onClick={() => updateStatus('escalated')}
            className={`flex-1 min-w-[120px] rounded-full py-3 px-4 text-xs font-medium premium-transition active:scale-[0.98] ${
              currentIndex >= 3 
                ? 'bg-red-500/10 text-red-400 border border-red-500/20 opacity-50 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-500 shadow-lg'
            }`}
          >
            Escalate
          </button>

          <button
            disabled={currentIndex >= 4 || isUpdatingStatus}
            onClick={() => updateStatus('resolved')}
            className={`flex-1 min-w-[120px] rounded-full py-3 px-4 text-xs font-medium premium-transition active:scale-[0.98] ${
              currentIndex >= 4 
                ? 'bg-green-500/10 text-green-400 border border-green-500/20 opacity-50 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-500 shadow-lg'
            }`}
          >
            Resolve
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClientDashboard({ initialIncidents, reportUrl }) {
  const router = useRouter();
  const [incidents, setIncidents] = useState(initialIncidents);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  
  // Polish & Hardening States
  const [toast, setToast] = useState(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(reportUrl, {
      width: 150,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' }
    }).then(url => setQrCodeDataUrl(url)).catch(err => console.error(err));

    let reconnectTimer;

    const channel = supabase
      .channel('dashboard-incidents')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'incidents' },
        (payload) => {
          setIncidents(prev => [payload.new, ...prev]);
          showToast(`New incident reported: ${payload.new.reference_code}`);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'incidents' },
        (payload) => setIncidents(prev => prev.map(inc => inc.id === payload.new.id ? payload.new : inc))
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsReconnecting(false);
          clearTimeout(reconnectTimer);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsReconnecting(true);
          // Supabase Realtime auto-reconnects, but we'll show UI and try manual re-fetch after 5s
          reconnectTimer = setTimeout(() => {
            handleRefresh();
          }, 5000);
        }
      });

    return () => {
      supabase.removeChannel(channel);
      clearTimeout(reconnectTimer);
    };
  }, [reportUrl]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 5000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const { data } = await supabase.from('incidents').select('*').order('created_at', { ascending: false });
      if (data) setIncidents(data);
    } catch (err) {
      console.error('Refresh error', err);
    } finally {
      setIsRefreshing(false);
    }
  };

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
    <div className="min-h-[100dvh] flex flex-col bg-[#050505] relative">
      
      {/* Toast Notification */}
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 premium-transition ${toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="bg-amber-500/90 text-black px-6 py-3 rounded-full shadow-2xl backdrop-blur-md flex items-center space-x-3 font-medium">
          <span className="text-xl">🚨</span>
          <span>{toast}</span>
        </div>
      </div>

      {/* Error Boundary / Reconnecting Overlay */}
      {isReconnecting && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-red-500/90 text-white px-6 py-3 rounded-full shadow-2xl backdrop-blur-md flex items-center space-x-3 font-medium text-sm">
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Connection lost. Reconnecting...</span>
          </div>
        </div>
      )}

      <nav className="w-full bg-[#0B1F3A]/40 backdrop-blur-3xl border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl md:text-2xl font-light tracking-tight">RapidResponse</h1>
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-green-400 font-medium">System Online</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 md:space-x-6">
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-white/50 hover:text-white premium-transition p-2 bg-white/5 hover:bg-white/10 rounded-full"
              title="Manual Refresh"
            >
              <svg className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
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

                    <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-8 pt-8 border-t border-white/10' : 'grid-rows-[0fr] opacity-0 mt-0 pt-0 border-transparent'}`}>
                      <div className="overflow-hidden">
                        <IncidentControls incident={incident} />
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
