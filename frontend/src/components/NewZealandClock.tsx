import { useEffect, useState } from 'react';

const formatter = new Intl.DateTimeFormat('en-NZ', {
  timeZone: 'Pacific/Auckland', day: 'numeric', month: 'short', year: 'numeric',
  hour: 'numeric', minute: '2-digit', hour12: true,
});

export function NewZealandClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return <div className="nz-clock">
    <span>New Zealand</span>
    <time dateTime={now.toISOString()}>{formatter.format(now)}</time>
  </div>;
}
