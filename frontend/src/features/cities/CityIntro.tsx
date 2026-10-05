import { Link } from 'react-router-dom';
import './cities.css';

export function CityIntro() {
  return <section className="city-intro card" aria-labelledby="city-preparation">
    <div className="city-monogram" aria-hidden="true">CHC</div>
    <div><h2 id="city-preparation">Your Christchurch preparation</h2>
      <p>Use your existing checklist alongside published city guides. No account is needed.</p>
      <div className="guide-actions"><Link to="/predeparture?task=airport-transport">Airport transport checklist</Link><Link to="/predeparture?task=confirm-accommodation">Accommodation checklist</Link></div>
      <p className="notice">These checklist tasks have not yet been editorially reviewed. City guidance appears below only after publication review, separately for each language.</p>
    </div>
  </section>;
}
