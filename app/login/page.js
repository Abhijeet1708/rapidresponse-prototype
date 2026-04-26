'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        throw new Error('Invalid credentials.');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] flex items-center justify-center px-4 py-12 premium-transition">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
        <div className="text-center mb-10 space-y-3">
          <div className="inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-white/5 text-white/50 border border-white/10 mb-2">
            Staff Portal
          </div>
          <h1 className="text-4xl font-light tracking-tight">RapidResponse</h1>
          <p className="text-white/40 text-sm">Sign in to the coordination dashboard</p>
        </div>

        <div className="glass-panel-outer">
          <div className="glass-panel-inner p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-wider text-white/50 pl-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 premium-transition"
                    placeholder="Enter demo username"
                    autoComplete="username"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-wider text-white/50 pl-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 premium-transition"
                    placeholder="Enter demo password"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm text-center premium-transition bg-red-500/10 py-2.5 rounded-lg border border-red-500/20">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full bg-white text-black py-3.5 px-6 font-medium flex items-center justify-center premium-transition hover:bg-white/90 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
