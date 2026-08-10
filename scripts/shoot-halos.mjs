// Scratch: capture the airframe over four skies to inspect halo compositing.
// Run: node scripts/shoot-halos.mjs <output-dir>
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const OUT = process.argv[2];
if (!OUT) { console.error('usage: node scripts/shoot-halos.mjs <output-dir>'); process.exit(1); }
const url = pathToFileURL(path.resolve('redesign-v2.html')).href;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url);
await page.waitForTimeout(6000);

// SCROLL to each altitude rather than forcing it. Task 7 established that
// calling Stage.apply() directly does not survive: altitude is derived from
// scroll position, so the page's own rAF loop recomputes the pose from the
// real scroll offset and overwrites the forced one before the screenshot
// lands. Scrolling is also closer to what a reader actually sees.
const shots = [
  ['ground',  0.00],
  ['wp1',     0.22],
  ['cruise',  0.55],
  ['space',   0.92],
];

for (const [name, frac] of shots) {
  await page.evaluate((f) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: max * f, behavior: 'instant' });
  }, frac);
  // Let the scroll settle, the altitude subscription fire, and the render
  // loop draw the new pose.
  await page.waitForTimeout(900);
  const alt = await page.evaluate(() => Math.round(window.Flight.state.alt));
  await page.screenshot({ path: path.join(OUT, `halo-${name}-alt${alt}.png`) });
  console.log(`${name}: alt ${alt}`);
}

await browser.close();
console.log('wrote 4 screenshots to', OUT);
