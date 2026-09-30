import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../prototype/app.js', import.meta.url), 'utf8');
function boot(saved) {
  const values = new Map(saved === undefined ? [] : [['sajilo-prototype', saved]]);
  const listeners = {};
  const app = { innerHTML: '' };
  const toast = { textContent: '', classList: { add() {}, remove() {} } };
  const context = vm.createContext({
    URLSearchParams, Intl, console,
    location: { hash: '#home' },
    localStorage: { getItem: k => values.get(k) ?? null, setItem: (k,v) => values.set(k,v), removeItem: k => values.delete(k) },
    document: { documentElement: {}, getElementById: id => ({app, toast}[id] ?? null), addEventListener: (event, fn) => listeners[event] = fn },
    window: { addEventListener() {}, scrollTo() {} },
    setTimeout() {}, clearTimeout() {}, confirm: () => true,
  });
  vm.runInContext(source, context);
  return { run: code => vm.runInContext(code, context), values, listeners, app };
}
test('unit: escape untrusted text before inserting into HTML', () => {
  assert.equal(boot().run('esc(' + JSON.stringify(`<img src="x" onerror='bad'>&`) + ')'), '&lt;img src=&quot;x&quot; onerror=&#39;bad&#39;&gt;&amp;');
});
test('unit: stage selects arrival tasks instead of study tasks', () => {
  const b = boot();
  assert.equal(b.run(`state.stage='First weeks in NZ'; checklistData() === first`), true);
  assert.equal(b.run(`state.stage='Preparing to travel'; checklistData() === pre`), true);
});
test('integration: malformed saved JSON does not stop initial rendering', () => {
  const b = boot('{broken');
  assert.equal(b.run('state.stage'), 'Exploring study');
  assert.ok(b.app.innerHTML.length > 0);
});
test('integration: bookmark persists across a fresh app instance and toggles off', () => {
  const b = boot();
  b.run(`save('test-guide','Test guide','predeparture')`);
  const reloaded = boot(b.values.get('sajilo-prototype'));
  assert.equal(reloaded.run('state.saved.length'), 1);
  assert.equal(reloaded.run('state.saved[0].target'), 'predeparture');
  reloaded.run(`save('test-guide','Test guide','predeparture')`);
  assert.equal(JSON.parse(reloaded.values.get('sajilo-prototype')).saved.length, 0);
});
test('integration: checklist change is saved and restored after reload', () => {
  const b = boot();
  const id = b.run(`Object.entries(pre)[0][0]+':'+Object.entries(pre)[0][1][0]`);
  b.listeners.change({ target: { dataset: {check:id}, checked:true } });
  const reloaded = boot(b.values.get('sajilo-prototype'));
  assert.equal(reloaded.run(`state.checks[${JSON.stringify(id)}]`), true);
  assert.match(reloaded.run(`checklist('predeparture')`), /1 of \d+ completed/);
});
test('integration: monthly budget input is stored weekly and negative amounts clamp to zero', () => {
  const b = boot();
  b.run(`budgetPeriod='Monthly'`);
  b.listeners.input({ target: {dataset:{budget:'Rent'}, value:'1040'} });
  assert.ok(Math.abs(JSON.parse(b.values.get('sajilo-prototype')).budget.Rent - 240) < 0.00001);
  b.listeners.input({ target: {dataset:{budget:'Rent'}, value:'-100'} });
  assert.equal(JSON.parse(b.values.get('sajilo-prototype')).budget.Rent, 0);
});
