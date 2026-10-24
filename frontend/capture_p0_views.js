import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  const artifactDir = "C:/Users/Meet/.gemini/antigravity-ide/brain/92683976-d96c-4220-b417-7124f3d976d7";

  console.log("Navigating to http://localhost:5173/...");
  await page.goto("http://localhost:5173/");
  await page.waitForTimeout(2000);

  // 1. Dashboard screenshot
  await page.screenshot({ path: `${artifactDir}/p0_dashboard.png` });
  console.log("Captured p0_dashboard.png");

  // 2. Budget view
  const budgetBtn = page.getByRole("button", { name: "Budget", exact: true });
  await budgetBtn.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${artifactDir}/p0_budget.png` });
  console.log("Captured p0_budget.png");

  // 3. Timeline view
  const timelineBtn = page.getByRole("button", { name: "Timeline", exact: true });
  await timelineBtn.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${artifactDir}/p0_timeline.png` });
  console.log("Captured p0_timeline.png");

  // 4. Vendors view
  const vendorsBtn = page.getByRole("button", { name: "Vendors", exact: true });
  await vendorsBtn.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${artifactDir}/p0_vendors.png` });
  console.log("Captured p0_vendors.png");

  // 5. Ideas view
  const ideasBtn = page.getByRole("button", { name: "Ideas", exact: true });
  await ideasBtn.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${artifactDir}/p0_ideas.png` });
  console.log("Captured p0_ideas.png");

  await browser.close();
  console.log("All P0 views captured successfully!");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
