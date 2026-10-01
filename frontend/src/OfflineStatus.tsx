import { useEffect, useState } from 'react';
export function OfflineStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const connection = () => setOnline(navigator.onLine);
    window.addEventListener('online', connection); window.addEventListener('offline', connection);
    let active = true;
    const controlled = () => { if (active) setReady(!!navigator.serviceWorker.controller); };
    if (import.meta.env.PROD && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', controlled);
      navigator.serviceWorker.register('/sw.js').then(() => navigator.serviceWorker.ready).then(controlled).catch(() => { if (active) setFailed(true); });
    }
    return () => { active = false; window.removeEventListener('online', connection); window.removeEventListener('offline', connection); if ('serviceWorker' in navigator) navigator.serviceWorker.removeEventListener('controllerchange', controlled); };
  }, []);
  return <div className="offline-status" role="status">
    {!online && <p className="notice warning">You are offline. Your checklist and previously saved guides are available on this browser.</p>}
    <p>{ready ? 'App ready for offline use. Save guides before disconnecting.' : failed ? 'Offline setup failed. Reconnect and refresh to try again.' : 'Offline access becomes available after the production app finishes loading in a supported browser.'}</p>
  </div>;
}
