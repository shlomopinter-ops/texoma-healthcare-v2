import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const h = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const js = readFileSync(new URL('../script.js', import.meta.url), 'utf8');
test('core copy and bento', () => {
  for (const s of ['Healthcare operations.', 'Built for growth.', 'Strong teams. Smoother clinics. Systems that work in the field.',
    'Your managers are stretched thin.', 'Every location runs differently.', 'Daily problems keep reaching your desk.', 'You need experienced leadership now.',
    'needs next.', 'Talk with Shlomo', 'Book a call', 'class="bento"', 'img/logo-dark.png', 'img/logo-light.png'])
    assert.ok(h.includes(s), s);
  assert.match(h, /<title>Texoma Healthcare Group/);
  assert.match(h, /name="viewport"/);
  assert.ok(!/carease|tab\.bot/i.test(h + js));
  assert.equal((js.match(/const BOOKING_URL = /g) || []).length, 1);
  assert.ok(js.includes("mailto:shlomopinter@gmail.com?subject=Book%20a%20call"));
  for (const m of h.matchAll(/(?:src|href)="((?!https?:|mailto:|#)[^"]+)"/g)) assert.ok(existsSync(new URL('../' + m[1], import.meta.url)), m[1]);
});
