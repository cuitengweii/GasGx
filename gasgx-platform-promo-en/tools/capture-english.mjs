import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const outputDir = new URL("../capture-en/screenshots/", import.meta.url);
const positions = [0, 0.26, 0.44, 0.61, 0.79, 0.9];

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });

await page.goto("https://www.gasgx.com/digitalization/platform/", { waitUntil: "networkidle", timeout: 120000 });
await page.evaluate(() => {
  localStorage.setItem("gasgx-lang", "en");
  localStorage.setItem("gas_lang", "en");
});
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(2200);

const state = await page.evaluate(() => ({
  lang: document.documentElement.lang,
  enMode: document.body.classList.contains("en-mode"),
  visibleText: document.body.innerText,
}));

if (state.lang !== "en" || !state.enMode) {
  throw new Error(`English mode did not activate: ${JSON.stringify({ lang: state.lang, enMode: state.enMode })}`);
}
if (/[\u3400-\u9fff]/u.test(state.visibleText)) {
  throw new Error("Visible page text still contains CJK characters in English mode.");
}

for (let index = 0; index < positions.length; index += 1) {
  await page.evaluate((position) => window.scrollTo(0, document.body.scrollHeight * position), positions[index]);
  await page.waitForTimeout(850);
  await page.screenshot({
    path: new URL(`scroll-${String(index).padStart(3, "0")}.png`, outputDir).pathname,
    animations: "disabled",
  });
}

await browser.close();
console.log(`Captured ${positions.length} English screenshots.`);
