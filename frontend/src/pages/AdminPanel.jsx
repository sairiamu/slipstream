import React, { useState, useEffect } from 'react';
import { Lock, Upload, Play, CheckCircle2, AlertCircle, Loader2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function AdminPanel() {
  const [token, setToken] = useState(sessionStorage.getItem('admin_token') || '');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [stats, setStats] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [indexing, setIndexing] = useState(false);
  const [indexProgress, setIndexProgress] = useState(null);

  useEffect(() => {
    if (token) {
      validateToken();
    }
  }, []);

  async function validateToken() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setIsAuthorized(true);
        sessionStorage.setItem('admin_token', token);
        const data = await res.json();
        setStats(data);
      } else {
        setError('Invalid admin token');
      }
    } catch (err) {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  }

  const handleLogin = (e) => {
    e.preventDefault();
    validateToken();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/api/upload`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setUploadProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      setUploading(false);
      if (xhr.status === 200) {
        alert('Upload successful');
        setUploadProgress(0);
      } else {
        alert('Upload failed');
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      alert('Upload error');
    };

    xhr.send(formData);
  };

  const triggerIndexing = async () => {
    setIndexing(true);
    try {
      const res = await fetch(`${API_BASE}/api/index`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const eventSource = new EventSource(`${API_BASE}/api/index/progress`);
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setIndexProgress(data);
          if (data.status === 'completed' || data.status.startsWith('failed')) {
            eventSource.close();
            setIndexing(false);
            validateToken(); // Refresh stats
          }
        };
      }
    } catch (err) {
      setIndexing(false);
      alert('Failed to start indexing');
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel w-full max-w-md p-8"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center border border-accent/20">
              <Lock className="w-8 h-8 text-accent" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">Admin Access</h2>
          <p className="text-milk-dim text-center mb-8">Enter your token to manage timetables</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                className="glass-input w-full"
                placeholder="Admin Token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-danger text-sm text-center">{error}</p>}
            <button
              disabled={loading}
              className="btn-primary w-full py-4 flex items-center justify-center"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Unlock Dashboard'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 pt-12 pb-24">
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-3xl font-bold font-display">Admin Dashboard</h1>
        <button
          onClick={() => { sessionStorage.removeItem('admin_token'); setIsAuthorized(false); }}
          className="text-milk-dim hover:text-white text-sm"
        >
          Sign Out
        </button>
      </div>

      <div className="grid gap-6">
        {/* Status Card */}
        <div className="glass-panel p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-milk-dim mb-4">Index Status</h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.indexed_students?.toLocaleString() || 0} students</p>
              <p className="text-milk-dim text-xs">
                {stats?.last_indexed ? `Last indexed: ${new Date(stats.last_indexed).toLocaleString()}` : 'Never indexed'}
              </p>
            </div>
          </div>
        </div>

        {/* Upload Zone */}
        <div className="glass-panel p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-milk-dim mb-4">Upload Master PDF</h3>
          <label className="upload-zone flex flex-col items-center justify-center py-12 px-6 cursor-pointer group">
            <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} />
            <Upload className="w-10 h-10 text-milk-dim group-hover:text-accent transition-colors mb-4" />
            <p className="text-center">
              <span className="text-accent font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-milk-dim text-xs mt-1">Master PDF up to 1GB</p>
          </label>

          {uploading && (
            <div className="mt-6">
              <div className="flex justify-between text-xs mb-2">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-navy-light rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Card */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold">Process Index</h3>
              <p className="text-sm text-milk-dim">Build student mapping from uploaded PDF</p>
            </div>
            <button
              onClick={triggerIndexing}
              disabled={indexing}
              className="btn-primary px-6 py-3 flex items-center gap-2"
            >
              {indexing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Build Index
            </button>
          </div>

          {indexProgress && (
            <div className="space-y-4">
              <div className="flex justify-between text-xs">
                <span>{indexProgress.status === 'indexing' ? 'Processing pages...' : 'Done'}</span>
                <span>{indexProgress.current} / {indexProgress.total}</span>
              </div>
              <div className="h-2 bg-navy-light rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${(indexProgress.current / indexProgress.total) * 100}%` }}
                />
              </div>
              {indexProgress.status.startsWith('failed') && (
                <div className="flex items-center gap-2 text-danger text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{indexProgress.status}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
