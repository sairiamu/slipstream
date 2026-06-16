import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, WifiOff } from 'lucide-react';

export default function PWAHandler() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e);

      const isDismissed = localStorage.getItem('pwa_install_dismissed');
      if (!isDismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleOnline = () => {
      setIsOffline(false);
      setTimeout(() => setShowOfflineBanner(false), 2000);
    };
    const handleOffline = () => {
      setIsOffline(true);
      setShowOfflineBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!navigator.onLine) {
      setShowOfflineBanner(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setShowInstallBanner(false);
    }
  };

  const dismissInstall = () => {
    localStorage.setItem('pwa_install_dismissed', 'true');
    setShowInstallBanner(false);
  };

  return (
    <>
      {/* Offline Banner */}
      <AnimatePresence>
        {showOfflineBanner && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[100] flex justify-center p-4 pointer-events-none"
          >
            <div className="glass-pill border-l-[3px] border-l-[#FBBF24] px-6 py-3 flex items-center gap-3 shadow-2xl pointer-events-auto">
              <WifiOff className="w-4 h-4 text-[#FBBF24]" />
              <p className="text-[#FBBF24] text-xs font-bold">You're offline — showing cached results only</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Install Banner */}
      <AnimatePresence>
        {showInstallBanner && !isOffline && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-0 right-0 z-[100] flex justify-center p-4"
          >
            <div className="glass-pill px-5 py-4 flex items-center gap-4 shadow-2xl max-w-sm w-full border border-white/20">
              <div className="flex-1">
                <p className="text-white text-sm font-medium">📲 Add SlipStream to your home screen</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleInstall}
                  className="bg-accent text-white px-4 py-2 rounded-lg text-xs font-bold hover:brightness-110 transition-all"
                >
                  Install
                </button>
                <button
                  onClick={dismissInstall}
                  className="p-2 text-milk-dim/50 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
