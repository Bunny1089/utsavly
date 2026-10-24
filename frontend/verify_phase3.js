import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const artifactDir = "C:/Users/Meet/.gemini/antigravity-ide/brain/92683976-d96c-4220-b417-7124f3d976d7";

  console.log("Navigating to http://localhost:5173/...");
  await page.goto("http://localhost:5173/");
  await page.waitForTimeout(2000);

  // 1. Verify Health Score & Smart Alerts on Dashboard
  await page.screenshot({ path: `${artifactDir}/phase3_health.png` });
  console.log("Captured phase3_health.png");

  // 2. Open Budget and test What-If Simulator
  const budgetBtn = page.getByRole("button", { name: "Budget", exact: true });
  await budgetBtn.click();
  await page.waitForTimeout(1000);

  const simBtn = page.getByRole("button", { name: /What-If Simulator/i });
  await simBtn.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${artifactDir}/phase3_whatif.png` });
  console.log("Captured phase3_whatif.png");

  // 3. Open Copilot Slide-Over from sidebar
  const copilotBtn = page.getByRole("button", { name: "Copilot", exact: true });
  await copilotBtn.click();
  await page.waitForTimeout(1000);

  // Click a suggested command
  const promptBtn = page.getByRole("button", { name: /Increase catering budget by 50,000/i });
  if (await promptBtn.isVisible()) {
    await promptBtn.click();
    await page.waitForTimeout(3000);
  }

  await page.screenshot({ path: `${artifactDir}/phase3_copilot.png` });
  console.log("Captured phase3_copilot.png");

  await browser.close();
  console.log("Phase 3 verification complete!");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
