const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const videoDir = path.join(__dirname, '..', 'demo_videos');

  const browser = await chromium.launch({ 
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: {
      dir: videoDir,
      size: { width: 1280, height: 800 }
    }
  });

  const page = await context.newPage();

  try {
    // ===== PART 1: LANDING PAGE =====
    console.log('1. Loading landing page...');
    await page.goto('http://localhost:5173', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(videoDir, '01_landing_page.png') });
    console.log('   ✓ Landing page loaded');

    // Scroll down to show features
    await page.evaluate(() => window.scrollBy({ top: 600, behavior: 'smooth' }));
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(videoDir, '02_landing_features.png') });

    // Scroll back up
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(1500);

    // ===== PART 2: CUSTOMER LOGIN =====
    console.log('2. Navigating to login...');
    const loginBtn = await page.$('a[href*="login"], button:has-text("Login"), button:has-text("Sign In"), a:has-text("Login"), a:has-text("Sign In")');
    if (loginBtn) {
      await loginBtn.click();
      await page.waitForTimeout(2000);
    } else {
      await page.goto('http://localhost:5173/login', { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: path.join(videoDir, '03_login_page.png') });
    console.log('   ✓ Login page loaded');

    // Fill login form
    console.log('3. Logging in as customer...');
    const emailInput = await page.$('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    const passwordInput = await page.$('input[type="password"], input[name="password"]');
    
    if (emailInput && passwordInput) {
      await emailInput.click();
      await emailInput.fill('customer1@fixit.com');
      await page.waitForTimeout(500);
      await passwordInput.click();
      await passwordInput.fill('password123');
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(videoDir, '04_login_filled.png') });

      const submitBtn = await page.$('button[type="submit"], button:has-text("Sign In"), button:has-text("Login"), button:has-text("Log In")');
      if (submitBtn) {
        await submitBtn.click();
        await page.waitForTimeout(3000);
      }
    }

    // ===== PART 3: CUSTOMER DASHBOARD =====
    console.log('4. Customer dashboard...');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(videoDir, '05_customer_dashboard.png') });
    console.log('   ✓ Customer dashboard loaded');

    // Scroll to show requests
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(videoDir, '06_customer_requests.png') });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(1000);

    // ===== PART 4: NEW REPAIR REQUEST =====
    console.log('5. Navigating to new repair request...');
    const newReqBtn = await page.$('a[href*="request"], button:has-text("New Request"), a:has-text("New Request"), button:has-text("Request"), a:has-text("Repair")');
    if (newReqBtn) {
      await newReqBtn.click();
      await page.waitForTimeout(3000);
    } else {
      await page.goto('http://localhost:5173/request', { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: path.join(videoDir, '07_repair_request_page.png') });
    console.log('   ✓ Repair request page loaded');

    // ===== PART 5: CHAT MESSAGE =====
    console.log('6. Sending chat message...');
    const chatInput = await page.$('textarea, input[type="text"][placeholder*="message" i], input[type="text"][placeholder*="describe" i], input[type="text"][placeholder*="issue" i], input[placeholder*="type" i]');
    if (chatInput) {
      await chatInput.click();
      await chatInput.fill('My kitchen sink pipe is leaking badly and water is flooding the floor. I need an urgent plumber in Douala.');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(videoDir, '08_chat_message_typed.png') });

      const sendBtn = await page.$('button:has-text("Send"), button[type="submit"]:near(textarea)');
      if (sendBtn) {
        await sendBtn.click();
      } else {
        await chatInput.press('Enter');
      }
      console.log('   ✓ Message sent, waiting for AI response...');
      
      await page.waitForTimeout(15000);
      await page.screenshot({ path: path.join(videoDir, '09_chat_response.png') });
      
      await page.waitForTimeout(10000);
      await page.screenshot({ path: path.join(videoDir, '10_chat_complete.png') });
    } else {
      console.log('   ✗ Could not find chat input');
    }

    // ===== PART 6: LOGOUT =====
    console.log('7. Logging out...');
    const logoutBtn = await page.$('button:has-text("Logout"), button:has-text("Log Out"), a:has-text("Logout"), button:has-text("Sign Out")');
    if (logoutBtn) {
      await logoutBtn.click();
      await page.waitForTimeout(2000);
    } else {
      await page.evaluate(() => localStorage.clear());
      await page.goto('http://localhost:5173/login', { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(2000);
    }

    // ===== PART 7: TECHNICIAN LOGIN =====
    console.log('8. Logging in as technician...');
    const emailInput2 = await page.$('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    const passwordInput2 = await page.$('input[type="password"], input[name="password"]');
    
    if (emailInput2 && passwordInput2) {
      await emailInput2.click();
      await emailInput2.fill('tech1@fixit.com');
      await page.waitForTimeout(500);
      await passwordInput2.click();
      await passwordInput2.fill('password123');
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(videoDir, '11_tech_login_filled.png') });

      const submitBtn2 = await page.$('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
      if (submitBtn2) {
        await submitBtn2.click();
        await page.waitForTimeout(3000);
      }
    }

    // ===== PART 8: TECHNICIAN DASHBOARD =====
    console.log('9. Technician dashboard...');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(videoDir, '12_tech_dashboard.png') });
    console.log('   ✓ Technician dashboard loaded');

    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(videoDir, '13_tech_assigned_jobs.png') });

    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(videoDir, '14_tech_job_board.png') });

    await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(videoDir, '15_tech_reviews.png') });

    console.log('\n=== DEMO RECORDING COMPLETE ===');
    console.log('Screenshots saved as 01-15 PNG files.');

  } catch (err) {
    console.error('Error during recording:', err.message);
    await page.screenshot({ path: path.join(videoDir, 'error_screenshot.png') });
  } finally {
    await context.close();
    await browser.close();
    console.log('Browser closed. Video + screenshots in:', videoDir);
  }
})();
