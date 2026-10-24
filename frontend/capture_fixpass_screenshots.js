import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const ARTIFACT_DIR = "C:\\Users\\Meet\\.gemini\\antigravity-ide\\brain\\92683976-d96c-4220-b417-7124f3d976d7";

async function captureFixPass() {
  console.log("Capturing UI Fix Pass screenshots in Dark and Light themes...");
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto("http://localhost:5173/");
  await page.waitForTimeout(2000);

  // Helper to save screenshot to both local cwd and artifacts directory
  const save = async (name) => {
    const local = path.join(process.cwd(), `${name}.png`);
    const art = path.join(ARTIFACT_DIR, `${name}.png`);
    await page.screenshot({ path: local, fullPage: true });
    fs.copyFileSync(local, art);
    console.log(`Saved screenshot: ${name}.png`);
  };

  // Helper to toggle theme
  const toggleTheme = async () => {
    // Header theme toggle button
    const themeBtn = page.getByRole("button", { name: /switch to (light|dark) theme/i });
    await themeBtn.click();
    await page.waitForTimeout(600);
  };

  // 1. Landing Page (Dark)
  const landingBtn = page.getByRole("button", { name: "Landing Page" });
  await landingBtn.click();
  await page.waitForTimeout(600);
  await save("fixpass_landing_dark");

  // 2. Landing Page (Light)
  await toggleTheme();
  await save("fixpass_landing_light");

  // Switch back to Dark as default
  await toggleTheme();

  // Return to Dashboard (Dark)
  const dashboardBtn = page.getByRole("button", { name: "Dashboard", exact: true });
  await dashboardBtn.click();
  await page.waitForTimeout(600);
  await save("fixpass_dashboard_dark");

  // 3. Dashboard (Light)
  await toggleTheme();
  await save("fixpass_dashboard_light");

  // Return to Dark
  await toggleTheme();

  // 4. Budget View (Dark)
  const budgetBtn = page.getByRole("button", { name: "Budget" });
  await budgetBtn.click();
  await page.waitForTimeout(600);
  await save("fixpass_budget_dark");

  // 5. Budget View (Light)
  await toggleTheme();
  await save("fixpass_budget_light");

  // Return to Dark
  await toggleTheme();

  // 6. Timeline View (Dark)
  const timelineBtn = page.getByRole("button", { name: "Timeline" });
  await timelineBtn.click();
  await page.waitForTimeout(600);
  await save("fixpass_timeline_dark");

  // 7. Timeline View (Light)
  await toggleTheme();
  await save("fixpass_timeline_light");

  // Return to Dark
  await toggleTheme();

  // 8. Vendors View (Dark)
  const vendorsBtn = page.getByRole("button", { name: "Vendors" });
  await vendorsBtn.click();
  await page.waitForTimeout(600);
  await save("fixpass_vendors_dark");

  // 9. Ideas View (Dark)
  const ideasBtn = page.getByRole("button", { name: "Ideas" });
  await ideasBtn.click();
  await page.waitForTimeout(600);
  await save("fixpass_ideas_dark");

  // 10. Copilot Slide-Over (Dark)
  const copilotBtn = page.getByRole("button", { name: "Copilot" });
  await copilotBtn.click();
  await page.waitForTimeout(600);
  await save("fixpass_copilot_dark");

  // Close copilot
  const closeCopilot = page.getByRole("button", { name: "Close Copilot" });
  if (await closeCopilot.isVisible()) {
    await closeCopilot.click();
  }

  // 11. Wizard Modal (Dark)
  const newCelebrationBtn = page.locator("aside").getByRole("button", { name: "New Celebration" });
  await newCelebrationBtn.click();
  await page.waitForTimeout(600);
  await save("fixpass_wizard_dark");

  await browser.close();
  console.log("All UI Fix Pass screenshots captured successfully!");
}

captureFixPass().catch((err) => {
  console.error("Screenshot capture error:", err);
  process.exit(1);
});
