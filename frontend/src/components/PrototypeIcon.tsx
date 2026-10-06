import { iconPaths } from '../features/explore/catalog';
// Additional paths copied from prototype/app.js.
const paths = { ...iconPaths,
  compass: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20 M16 8l-3 5-5 3 3-5z',
  user: 'M20 21v-2a7 7 0 0 0-14 0v2 M13 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8',
  save: 'M6 3h12v19l-6-4-6 4z',
};
export function PrototypeIcon({ name }: { name: keyof typeof paths }) {
  return <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={paths[name]}/></svg>;
}
