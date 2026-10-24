import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const ARTIFACT_DIR = "C:\\Users\\Meet\\.gemini\\antigravity-ide\\brain\\92683976-d96c-4220-b417-7124f3d976d7";

async function captureDemoEvents() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto("http://localhost:5173");
  await page.waitForSelector("select");

  // Get all options from event selector
  const options = await page.$$eval("select option", (opts) =>
    opts.map((o) => ({ value: o.value, text: o.textContent }))
  );

  console.log("Found event options:", options);

  for (let i = 0; i < options.length; i++) {
    const opt = options[i];
    console.log(`Selecting event: ${opt.text}`);
    await page.selectOption("select", opt.value);
    await page.waitForTimeout(1000); // Wait for data and animations to settle

    const filename = `demo_event_${i + 1}_${opt.text.toLowerCase().replace(/[^a-z0-9]/g, "_")}.png`;
    const localPath = path.join(process.cwd(), filename);
    const artifactPath = path.join(ARTIFACT_DIR, `demo_event_${i + 1}.png`);

    await page.screenshot({ path: localPath, fullPage: true });
    fs.copyFileSync(localPath, artifactPath);
    console.log(`Saved screenshot to: ${artifactPath}`);
  }

  // Also capture mobile responsive view at 360px width
  await page.setViewportSize({ width: 360, height: 800 });
  await page.waitForTimeout(500);
  const mobilePath = path.join(ARTIFACT_DIR, "demo_event_mobile_360px.png");
  await page.screenshot({ path: mobilePath, fullPage: false });
  console.log(`Saved 360px mobile responsive screenshot to: ${mobilePath}`);

  await browser.close();
  console.log("All screenshots captured successfully!");
}

captureDemoEvents().catch((err) => {
  console.error(err);
  process.exit(1);
});
