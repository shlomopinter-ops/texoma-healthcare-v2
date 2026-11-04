import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const p = readFileSync(new URL('../platform.html', import.meta.url), 'utf8');
const pj = readFileSync(new URL('../platform.js', import.meta.url), 'utf8');
const pc = readFileSync(new URL('../platform.css', import.meta.url), 'utf8');
const h = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
test('platform page content', () => {
  for (const s of ['Ownership view', 'Regional view', 'Sample data', '300', 'facilities<br>already using it', 'Routine monthly', 'Relationship building',
    'Compliance follow-up', 'Equipment / cart issue', 'Quick stop', 'Visit summaries', 'Facility scorecards', 'Regional activity', 'Overdue visits', 'Red-to-green turnarounds',
    'Escalation email', 'Two visits a month'])
    assert.ok(p.includes(s), s);
  assert.match(p, /<title>[^<]+Texoma/);
  assert.match(p, /name="viewport"/);
  assert.ok(!/carease|base44|vitalops|teamrove|tab\.bot/i.test(p + pj + pc)); assert.ok(!/\bTab\b/.test(p + pj));
  for (const m of p.matchAll(/(?:src|href)="((?!https?:|mailto:|#)[^"#]+)/g)) assert.ok(existsSync(new URL('../' + m[1], import.meta.url)), m[1]);
});
test('home links to platform', () => {
  assert.ok((h.match(/href="platform\.html"/g) || []).length >= 3);
});
