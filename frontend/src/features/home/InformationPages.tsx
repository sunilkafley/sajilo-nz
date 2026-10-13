import { Link } from 'react-router-dom';
import { emergencyResource } from './discovery';

export function CommunityPage() {
  return <section><p className="eyebrow">COMMUNITY</p><h1>A little closer to home</h1><p className="intro">A place for Nepalese community organisations, cultural gatherings and local services. The directory is coming soon, starting with Christchurch.</p><div className="card"><h2>While we prepare the directory</h2><p>No community, event or business listings are available yet. Listings will need source attribution and human review before publication.</p><Link to="/cities/christchurch">Explore Christchurch preparation</Link></div><p><Link to="/sources">Find official travel information</Link></p><p><a href={emergencyResource.url}>Emergency Help (NZ Police, online)</a></p></section>;
}
export function AboutPage() {
  return <section><p className="eyebrow">ABOUT SAJILO NZ</p><h1>Your New Zealand journey companion</h1><p className="intro">For Nepalese students, workers, partners, families and newcomers. Practical guidance without an account.</p><div className="card"><h2>Your journey, your browser</h2><p>Checklist progress and saved guides stay on this browser, not in a personal account. Clearing browser data can remove them.</p><p>Published guides include official sources and recorded review information. Check those sources before acting; Sajilo NZ does not determine immigration eligibility.</p><p>Nepali guide translations are published only after review. Where interface translations are unavailable, we show English clearly.</p><Link to="/journey">Choose your journey</Link></div></section>;
}
