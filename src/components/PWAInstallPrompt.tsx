import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const promptEvent = e as BeforeInstallPromptEvent;
      promptEvent.preventDefault();
      setDeferredPrompt(promptEvent);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShow(false);
    }
    setDeferredPrompt(null);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 glass border border-border p-4 rounded-xl max-w-xs">
      <div className="flex justify-between items-start mb-2">
        <div className="font-medium">Install Nexus Captions</div>
        <button onClick={() => setShow(false)}><X size={16} /></button>
      </div>
      <p className="text-sm text-muted mb-3">Get quick access and work offline.</p>
      <button 
        onClick={handleInstall}
        className="neutral-btn w-full py-2 rounded bg-accent text-background text-sm font-medium"
      >
        Install App
      </button>
    </div>
  );
}
