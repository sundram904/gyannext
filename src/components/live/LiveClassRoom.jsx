import { useEffect, useRef, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { loadJitsiScript } from '../../utils/loadJitsiScript';

export default function LiveClassRoom({ roomName, displayName, topic, onClose, onJoined }) {
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    loadJitsiScript()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        apiRef.current = new window.JitsiMeetExternalAPI('meet.jit.si', {
          roomName,
          parentNode: containerRef.current,
          width: '100%',
          height: '100%',
          userInfo: { displayName: displayName || 'GyanNext User' },
          configOverwrite: {
            prejoinPageEnabled: false,
            disableDeepLinking: true,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            MOBILE_APP_PROMO: false,
          },
        });
        apiRef.current.addListener('videoConferenceJoined', () => {
          setLoading(false);
          onJoined?.();
        });
        apiRef.current.addListener('readyToClose', () => onClose?.());
      })
      .catch(() => setError('Could not connect to the live class. Please check your internet connection and try again.'));

    return () => {
      cancelled = true;
      apiRef.current?.dispose();
    };
  }, [roomName, displayName]);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-ink-950">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <p className="font-display text-sm font-semibold text-white">{topic || 'Live Class'}</p>
          <p className="text-xs text-ink-400">Joined as {displayName}</p>
        </div>
        <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full text-white hover:bg-white/10" aria-label="Leave class">
          <X size={18} />
        </button>
      </div>

      <div className="relative flex-1">
        {loading && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
            <Loader2 size={28} className="animate-spin text-primary-300" />
            <p className="text-sm text-ink-300">Connecting to your class...</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-white">
            <p className="text-sm text-red-400">{error}</p>
            <button onClick={onClose} className="btn-outline !text-white !border-white/30">Close</button>
          </div>
        )}
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </div>
  );
}
