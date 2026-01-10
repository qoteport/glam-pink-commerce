import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already dismissed recently
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) return; // Don't show for 7 days after dismissal
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      // For iOS, show the prompt after a delay
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after a delay
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
      >
        <div className="bg-background border border-border rounded-2xl shadow-xl p-4 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground mb-1">
                Install HairyTalesBeauty
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {isIOS 
                  ? "Tap the share button and 'Add to Home Screen' to install"
                  : "Install our app for a better shopping experience"}
              </p>
              
              {!isIOS && deferredPrompt && (
                <Button 
                  onClick={handleInstall}
                  className="w-full"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Install App
                </Button>
              )}
              
              {isIOS && (
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded-lg">
                  <p className="flex items-center gap-2">
                    <span>1. Tap</span>
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-background rounded border">
                      ⬆️
                    </span>
                    <span>Share</span>
                  </p>
                  <p className="mt-1">2. Select "Add to Home Screen"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
