import approvedLogo from '../assets/sajilonz-logo.png';

export function SajiloLogo({ language = 'en' }: { language?: 'en' | 'ne' }) {
  const tagline = language === 'ne' ? 'तपाईंको न्युजिल्यान्ड सहयात्री' : 'Your New Zealand journey companion';
  return <img className="sajilo-logo" src={approvedLogo} width={2172} height={724}
    alt={`Sajilo NZ — ${tagline}`} lang={language}/>;
}
