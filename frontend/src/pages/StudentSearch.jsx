import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Download, X, Sparkles } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import CountdownCard from '../components/CountdownCard';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function PdfPreview({ studentId, apiBase }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const canvasRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const renderPdf = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await fetch(`${apiBase}/api/download/${studentId}`);
        if (!response.ok) throw new Error('Failed to fetch PDF');
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();

        const pdfjsLib = window.pdfjsLib;
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);

        if (!isMounted) return;

        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        await page.render(renderContext).promise;
        setLoading(false);
      } catch (err) {
        console.error('PDF.js render error:', err);
        setError(true);
        setLoading(false);
      }
    };

    renderPdf();
    return () => { isMounted = false; };
  }, [studentId, isMobile, apiBase]);

  if (isMobile) {
    return (
      <div className="w-full min-h-[260px] flex items-center justify-center pdf-preview-container mb-6">
        <a
          href={`${apiBase}/api/preview/${studentId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="glass-pill px-6 py-4 flex items-center gap-3 text-sm font-bold text-white hover:bg-white/10 transition-all active:scale-95 shadow-xl border border-white/20 z-10"
        >
          <Sparkles className="w-5 h-5 text-accent animate-pulse" />
          Tap to preview timetable
        </a>
      </div>
    );
  }

  return (
    <div className="w-full md:min-h-[400px] min-h-[260px] md:h-[400px] h-[260px] pdf-preview-container mb-6 custom-scrollbar overflow-y-auto">
      {loading && <div className="shimmer-placeholder" />}
      {error ? (
        <iframe
          src={`${apiBase}/api/preview/${studentId}`}
          className="w-full h-full border-none relative z-10"
          title="Timetable Preview Fallback"
          onLoad={() => setLoading(false)}
        />
      ) : (
        <canvas
          ref={canvasRef}
          className={clsx(
            "w-full h-auto transition-opacity duration-500 relative z-10",
            loading ? "opacity-0" : "opacity-100"
          )}
        />
      )}
    </div>
  );
}

export default function StudentSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const debouncedQuery = useDebounce(query, 300);
  const dropdownRef = useRef(null);
  const hasCelebratedRef = useRef(false);

  useEffect(() => {
    if (selectedStudent) {
      fetchSchedule(selectedStudent.id);
    } else {
      setSchedule([]);
    }
  }, [selectedStudent]);

  async function fetchSchedule(id) {
    try {
      const res = await fetch(`${API_BASE}/api/schedule/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSchedule(data);
      }
    } catch (err) {
      setSchedule([]);
    }
  }

  useEffect(() => {
    if (selectedStudent && !hasCelebratedRef.current) {
      triggerConfetti();
      hasCelebratedRef.current = true;
    } else if (!selectedStudent) {
      hasCelebratedRef.current = false;
    }
  }, [selectedStudent]);

  const triggerConfetti = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#4A9DFF';

    // First burst — center
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.5 },
      colors: [accentColor, '#F8F5F0', '#C8CDD8', '#A855F7', '#34D399']
    });

    // Second burst — 400ms later, sides
    setTimeout(() => {
      confetti({
        particleCount: 40,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: [accentColor, '#FBBF24']
      });
      confetti({
        particleCount: 40,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#A855F7', '#34D399']
      });
    }, 400);
  };

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      searchStudents(debouncedQuery);
    } else {
      setResults([]);
      setError(null);
      setShowDropdown(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function searchStudents(q) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setShowDropdown(true);
      } else {
        if (res.status === 503) {
          setError('not-ready');
        } else {
          setError('server-error');
        }
        setResults([]);
        setShowDropdown(true);
      }
    } catch (err) {
      setError('server-error');
      setResults([]);
      setShowDropdown(true);
    } finally {
      setLoading(false);
    }
  }

  const handleSelect = (student) => {
    setSelectedStudent(student);
    setShowDropdown(false);
    setQuery('');
  };

  const dotTransition = {
    duration: 0.6,
    repeat: Infinity,
    ease: "easeInOut"
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pb-[env(safe-area-inset-bottom)] md:pt-0 pt-[20vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="glass-container"
      >
        <header className="text-center mb-10">
          <h1 className="text-[32px] font-bold font-display text-white leading-tight">
            〜 SlipStream
          </h1>
          <p className="text-[13px] text-milk-dim mt-1">Find your exam timetable</p>
        </header>

        {!selectedStudent ? (
          <div className="relative" ref={dropdownRef}>
            <div className="inset-well">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-milk-dim/50">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                className="inset-input !text-[16px]"
                placeholder="Name or reg number..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.length >= 2 && setShowDropdown(true)}
              />
              {loading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ ...dotTransition, delay: i * 0.3 }}
                      className="w-1.5 h-1.5 rounded-full bg-silver"
                    />
                  ))}
                </div>
              )}
            </div>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  style={{ originY: 0 }}
                  className="absolute top-full left-0 right-0 mt-3 dropdown-glass z-50 shadow-2xl"
                >
                  {results.length > 0 ? (
                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                      {results.map((student) => (
                        <button
                          key={student.id}
                          onClick={() => handleSelect(student)}
                          className="w-full min-h-[48px] flex items-center justify-between px-5 py-3 hover:bg-white/10 transition-colors text-left border-b border-white/5 last:border-none"
                        >
                          <span className="font-medium text-milk">{student.name}</span>
                          <span className="font-mono text-xs text-silver">{student.reg}</span>
                        </button>
                      ))}
                    </div>
                  ) : error === 'not-ready' ? (
                    <div role="alert" className="px-6 py-10 text-center">
                      <p className="text-silver text-sm">Timetables aren't ready yet — check back soon.</p>
                    </div>
                  ) : error === 'server-error' ? (
                    <div role="alert" className="p-2">
                      <div className="glass-pill border-l-[3px] border-l-danger px-5 py-4">
                        <p className="text-milk text-sm">Something went wrong on our end. Try again in a moment.</p>
                      </div>
                    </div>
                  ) : (
                    <div role="alert" className="p-2">
                      <div className="glass-pill border-l-[3px] border-l-warning px-5 py-4">
                        <h3 className="text-milk font-bold text-sm">Not found</h3>
                        <p className="text-milk text-sm mt-1">We couldn't find anyone matching that name. Try your registration number, or check the spelling.</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full"
          >
            <div className="mb-6">
              <span className="text-[13px] font-medium text-accent">Timetable found</span>
            </div>

            <h2 className="text-xl font-bold mb-1 text-white">{selectedStudent.name}</h2>
            <p className="font-mono text-xs text-milk-dim mb-6">
              {selectedStudent.reg} <span className="mx-2 opacity-30">•</span> Page {selectedStudent.page}
            </p>

            <PdfPreview studentId={selectedStudent.id} apiBase={API_BASE} />

            <CountdownCard schedule={schedule} />

            <a
              href={`${API_BASE}/api/download/${selectedStudent.id}`}
              download={`${selectedStudent.name.replace(/ /g, '_')}_Timetable.pdf`}
              className="btn-primary w-full py-4 flex items-center justify-center gap-2 mb-4"
            >
              <Download className="w-5 h-5" />
              Download my timetable
            </a>

            <button
              onClick={() => setSelectedStudent(null)}
              className="w-full text-milk-dim/60 text-xs hover:text-white transition-colors py-3 min-h-[44px]"
            >
              Back to search
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
