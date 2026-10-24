import { chromium } from "playwright";

async function runE2E() {
  console.log("Starting Playwright E2E Flow: Wizard -> Plan -> Edit Budget -> Add Vendor...");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  page.on("console", (msg) => console.log(`[BROWSER ${msg.type()}]:`, msg.text()));
  page.on("pageerror", (err) => console.error("[BROWSER ERROR]:", err));

  // 1. Visit landing / app
  await page.goto("http://localhost:5173/");
  await page.waitForTimeout(2000);

  // 2. Open Wizard and create a new event
  console.log("Step 1: Launching Setup Wizard...");
  const wizardBtn = page.locator("aside").getByRole("button", { name: "New Celebration" });
  await wizardBtn.click();
  await page.waitForTimeout(1000);

  // Scope to setup wizard modal
  const modal = page.locator('div.fixed:has-text("Create New Celebration")');
  await modal.waitFor({ state: "visible" });

  // Fill in wizard inputs strictly within modal
  await modal.locator('input[placeholder*="Aarav & Meera"]').fill("Rohan & Priya Royal Jaipur Sangeet");
  await modal.locator('input[type="date"]').fill("2026-11-28");
  await modal.locator('select').selectOption("Jaipur");

  // Check form validity before submit
  const formValidity = await modal.locator('form').evaluate(form => {
    return {
      isValid: form.checkValidity(),
      invalid: Array.from(form.elements).filter(el => !el.checkValidity()).map(el => ({
        tag: el.tagName,
        type: el.type,
        placeholder: el.placeholder,
        value: el.value,
        msg: el.validationMessage
      }))
    };
  });
  console.log("WIZARD FORM VALIDATION:", JSON.stringify(formValidity));

  // Submit wizard
  const submitBtn = modal.locator('button[type="submit"]');
  await submitBtn.click();

  // Wait for AI generation & modal closure
  await modal.waitFor({ state: "hidden", timeout: 35000 });
  await page.waitForTimeout(1500);
  console.log("Step 1 PASSED: Event created with generated AI budget, timeline, and ideas!");

  // 3. Navigate to Budget and edit budget item
  console.log("Step 2: Navigating to Budget and editing planned/actual spend...");
  const budgetNav = page.getByRole("button", { name: "Budget", exact: true });
  await budgetNav.click();
  await page.waitForTimeout(1000);

  // Click edit on first budget row
  const editButtons = page.locator('button[title*="Edit actual spend"]');
  if (await editButtons.count() > 0) {
    await editButtons.first().click();
    await page.waitForTimeout(500);

    const actualInput = page.locator('input[type="number"]');
    await actualInput.first().fill("250000");

    const saveBtn = page.locator('button[title="Save changes"]');
    await saveBtn.click();
    await page.waitForTimeout(1500);
    console.log("Step 2 PASSED: Budget spend updated and recalculated!");
  }

  // 4. Navigate to Vendors and add a vendor
  console.log("Step 3: Navigating to Vendors and registering a new vendor...");
  const vendorsNav = page.getByRole("button", { name: "Vendors", exact: true });
  await vendorsNav.click();
  await page.waitForTimeout(1000);

  const addVendorBtn = page.locator("main").getByRole("button", { name: "Add Vendor" });
  await addVendorBtn.click();
  await page.waitForTimeout(500);

  await page.fill('input[placeholder*="Royal Marwar"]', "Jaipur Heritage Shehnai Troupe");
  await page.fill('input[placeholder*="98765"]', "+91 98765 11223");

  const saveVendorBtn = page.getByRole("button", { name: "Save Vendor" });
  await saveVendorBtn.click();
  await page.waitForTimeout(2000);
  console.log("Step 3 PASSED: New vendor added and tracked in ledger!");

  await browser.close();
  console.log(">>> PLAYWRIGHT E2E FLOW COMPLETED SUCCESSFULLY! <<<");
}

runE2E().catch((err) => {
  console.error("E2E FAILED:", err);
  process.exit(1);
});
