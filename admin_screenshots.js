const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join('C:\\Users\\Ajit\\.gemini\\antigravity\\brain\\e662fb1a-0ee8-49ad-8ca1-c08d2663ea4a');
const BASE_URL = 'http://localhost:3000/admin';
const PASSCODE = 'swadam8888851522';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Capture console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  try {
    // === STEP 1: Login Screen ===
    console.log('Navigating to admin login page...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const loginPath = path.join(SCREENSHOTS_DIR, '01_login_screen.png');
    await page.screenshot({ path: loginPath, fullPage: true });
    console.log('SCREENSHOT_1:' + loginPath);

    // === STEP 2: Enter passcode and log in ===
    console.log('Looking for passcode input...');
    
    // First get page snapshot to understand structure
    const pageContent = await page.content();
    console.log('Page title:', await page.title());
    console.log('Page URL:', page.url());
    
    // Try multiple input selectors
    let inputFound = false;
    const inputSelectors = [
      'input[type="password"]',
      'input[type="number"]',
      'input[placeholder*="passcode" i]',
      'input[placeholder*="password" i]',
      'input[placeholder*="pin" i]',
      'input[name*="passcode" i]',
      'input[name*="password" i]',
      'input[id*="passcode" i]',
      'input[id*="password" i]',
      'input[type="text"]',
      'input'
    ];
    
    for (const selector of inputSelectors) {
      try {
        const el = page.locator(selector).first();
        const count = await el.count();
        if (count > 0) {
          console.log('Found input with selector:', selector);
          await el.fill(PASSCODE);
          inputFound = true;
          break;
        }
      } catch (e) {}
    }
    
    if (!inputFound) {
      console.log('WARNING: No input found on login page');
    }
    
    await page.waitForTimeout(500);

    // Try to find and click submit button
    const buttonSelectors = [
      'button[type="submit"]',
      'button:has-text("Login")',
      'button:has-text("Enter")',
      'button:has-text("Submit")',
      'button:has-text("Sign in")',
      'button:has-text("Unlock")',
      'button:has-text("Access")',
      'button:has-text("Verify")',
      'button:has-text("Continue")',
      '[role="button"]:has-text("Enter")',
      '[role="button"]:has-text("Login")',
      'button'
    ];
    
    let buttonClicked = false;
    for (const sel of buttonSelectors) {
      try {
        const btn = page.locator(sel).first();
        const count = await btn.count();
        if (count > 0) {
          console.log('Clicking button:', sel);
          await btn.click();
          buttonClicked = true;
          break;
        }
      } catch (e) {}
    }
    
    if (!buttonClicked) {
      // Try pressing Enter
      console.log('No button found, pressing Enter...');
      await page.keyboard.press('Enter');
    }
    
    console.log('Waiting for dashboard to load...');
    await page.waitForTimeout(4000);
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    console.log('Dashboard URL:', page.url());

    // === STEP 3: Dashboard Screenshot ===
    const dashPath = path.join(SCREENSHOTS_DIR, '02_dashboard.png');
    await page.screenshot({ path: dashPath, fullPage: true });
    console.log('SCREENSHOT_2:' + dashPath);

    // === STEP 4: Click on an order card ===
    console.log('Looking for order cards...');
    
    const orderSelectors = [
      '[data-testid*="order"]',
      '.order-card',
      '[class*="OrderCard"]',
      '[class*="order-card"]',
      '[class*="order-item"]',
      '[class*="OrderItem"]',
      'li[class*="order"]',
      // Generic list items / cards that might be orders
      'ul > li',
      '.card',
      '[role="listitem"]',
      'table tbody tr',
      '[class*="Card"]',
      '[class*="card"]',
      '[class*="Item"]',
      '[class*="Row"]',
    ];
    
    let orderClicked = false;
    for (const sel of orderSelectors) {
      try {
        const el = page.locator(sel).first();
        const count = await el.count();
        if (count > 0) {
          console.log('Found order element with selector:', sel, '- count:', count);
          await el.scrollIntoViewIfNeeded();
          await el.click({ timeout: 5000 });
          orderClicked = true;
          console.log('Clicked order element');
          break;
        }
      } catch (e) {
        console.log('Selector', sel, 'error:', e.message.substring(0, 100));
      }
    }
    
    if (!orderClicked) {
      console.log('WARNING: Could not click any order card');
    }
    
    await page.waitForTimeout(3000);

    // === STEP 5: Order Detail Drawer Screenshot ===
    const drawerPath = path.join(SCREENSHOTS_DIR, '03_order_detail_drawer.png');
    await page.screenshot({ path: drawerPath, fullPage: true });
    console.log('SCREENSHOT_3:' + drawerPath);

    // Report console errors
    if (consoleErrors.length > 0) {
      console.log('\nCONSOLE_ERRORS:');
      consoleErrors.slice(0, 10).forEach(e => console.log('  -', e.substring(0, 200)));
    } else {
      console.log('\nNO_CONSOLE_ERRORS');
    }

    console.log('DONE');

  } catch (err) {
    console.error('AUTOMATION_ERROR:', err.message);
    try {
      const errPath = path.join(SCREENSHOTS_DIR, 'error_state.png');
      await page.screenshot({ path: errPath, fullPage: true });
      console.log('ERROR_SCREENSHOT:' + errPath);
    } catch(e2) {}
  } finally {
    await browser.close();
  }
})();
