import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

async function runAxeAudit() {
  console.log("Starting Axe WCAG 2.1 AA Accessibility Audit across all views...");
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  await page.goto("http://localhost:5173/");
  await page.waitForTimeout(2000);

  const pages = ["Dashboard", "Budget", "Timeline", "Vendors", "Ideas"];
  const allViolations = [];

  for (const pageName of pages) {
    if (pageName !== "Dashboard") {
      const navBtn = page.getByRole("button", { name: pageName, exact: true });
      await navBtn.click();
      await page.waitForTimeout(1000);
    }

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    console.log(`View '${pageName}': Found ${accessibilityScanResults.violations.length} accessibility violation(s).`);
    if (accessibilityScanResults.violations.length > 0) {
      accessibilityScanResults.violations.forEach((v) => {
        console.log(`  - [${v.id}] ${v.help} (Impact: ${v.impact})`);
        v.nodes.forEach((n) => console.log(`      Target: ${n.target.join(", ")} | HTML: ${n.html}`));
      });
      allViolations.push({ page: pageName, violations: accessibilityScanResults.violations });
    }
  }

  await browser.close();
  if (allViolations.length === 0) {
    console.log(">>> ALL VIEWS PASSED AXE WCAG 2.1 AA AUDIT WITH 0 VIOLATIONS! <<<");
  } else {
    console.warn(`Total views with issues: ${allViolations.length}`);
  }
}

runAxeAudit().catch((e) => {
  console.error("Axe audit error:", e);
  process.exit(1);
});
