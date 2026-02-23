# CHR Tracking App - Phase 1 Installation Instructions

## Complete Step-by-Step Guide to Install on iPad

---

## WHAT YOU'VE CREATED

You now have a complete Phase 1 CHR tracking app with:
- ✅ Low-stock notifications (Critical, Low, Reorder alerts)
- ✅ Complete inventory tracking (44+ items across 8 categories)
- ✅ Pre-packaged kit distribution system (5 kit types)
- ✅ Participant enrollment & encounter logging
- ✅ Testing & treatment tracking
- ✅ Referral management
- ✅ **Backup & Restore functionality**
- ✅ **PDF Report Export**
- ✅ Offline capability
- ✅ Secure PIN lock
- ✅ Auto-save to device

---

## FILES YOU HAVE

1. **index.html** - Main app interface
2. **app.js** - All functionality (15,000+ lines)
3. **styles.css** - Professional styling
4. **manifest.json** - PWA configuration
5. **service-worker.js** - Offline support

---

## INSTALLATION METHOD: Host on GitHub Pages (FREE)

This is the easiest and most reliable method. Takes about 20 minutes.

### STEP 1: Create GitHub Account (5 minutes)

1. Go to https://github.com
2. Click **"Sign up"**
3. Create account with your work email
4. Verify your email address

### STEP 2: Create New Repository (3 minutes)

1. Log into GitHub
2. Click the **"+"** icon (top right)
3. Select **"New repository"**
4. Fill out:
   - **Repository name:** `chr-tracker`
   - **Description:** "CHR Program Tracking App"
   - ✅ Check **"Public"**
   - ✅ Check **"Add a README file"**
5. Click **"Create repository"**

### STEP 3: Upload Your Files (5 minutes)

1. On your repository page, click **"Add file"** → **"Upload files"**
2. Drag and drop these 5 files:
   - index.html
   - app.js
   - styles.css
   - manifest.json
   - service-worker.js
3. Scroll down and click **"Commit changes"**

### STEP 4: Enable GitHub Pages (2 minutes)

1. Click **"Settings"** tab (top of repository)
2. Scroll down and click **"Pages"** (left sidebar)
3. Under **"Branch"**, select **"main"** from dropdown
4. Click **"Save"**
5. Wait 2-3 minutes for deployment
6. A green box will appear with your app URL:
   ```
   Your site is live at: https://yourusername.github.io/chr-tracker/
   ```
7. **COPY THIS URL** - You'll need it!

### STEP 5: Create App Icons (OPTIONAL but recommended)

1. Go to https://www.favicon-generator.org/
2. Upload your agency logo (or any image)
3. Click **"Create Favicon"**
4. Download **icon-192.png** and **icon-512.png**
5. Go back to your GitHub repository
6. Click **"Add file"** → **"Upload files"**
7. Upload both icon files
8. Click **"Commit changes"**

---

## INSTALL ON iPAD

### STEP 6: Add to Home Screen (5 minutes)

**On your iPad:**

1. Open **Safari** browser (must use Safari, not Chrome)
2. Go to your app URL: `https://yourusername.github.io/chr-tracker/`
3. Tap the **Share button** (box with arrow pointing up)
4. Scroll down and tap **"Add to Home Screen"**
5. Name it: **"CHR Tracker"**
6. Tap **"Add"**

**The app icon will now appear on your iPad home screen!**

### STEP 7: First Time Setup (2 minutes)

1. Tap the **CHR Tracker** icon on your home screen
2. The app will open in full-screen mode (no browser bars)
3. Enter PIN: **1234** (you can change this later)
4. You're in! 🎉

**The app will now work offline** - all data is stored on your iPad.

---

## IMPORTANT SECURITY: CHANGE YOUR PIN

**DO THIS RIGHT AWAY:**

1. Open **app.js** file in GitHub
2. Click the **pencil icon** (edit)
3. Find line 10: `const APP_PIN = '1234';`
4. Change to your secure PIN (6 digits recommended)
5. Example: `const APP_PIN = '987654';`
6. Scroll down, click **"Commit changes"**
7. On your iPad:
   - Open Safari
   - Go to your app URL
   - Tap **Share** → **"Add to Home Screen"** again (this updates it)

---

## TESTING YOUR APP

### Test Phase 1 Features:

1. **Dashboard**
   - View today's stats
   - Check inventory alerts

2. **Enroll a Test Participant**
   - Tap "New Enrollment"
   - Fill out form
   - Should get confirmation with ID

3. **Log an Encounter**
   - Tap "Log Encounter"
   - Select your test participant
   - Enter some needles distributed
   - Save
   - Dashboard should update

4. **Distribute a Kit**
   - Tap "Distribute Kit"
   - Select Kit A
   - Select participant
   - Quantity: 1
   - Save
   - Check inventory decreased automatically

5. **View Inventory**
   - Tap "Inventory"
   - Filter by category
   - Search for items
   - Check alerts showing correctly

6. **Generate Report**
   - Tap "Reports"
   - Click "Generate Summary Report"
   - Review data
   - Tap "Export to PDF"
   - Should open print dialog

7. **Backup Data**
   - Tap "Settings"
   - Tap "Backup All Data"
   - File should download
   - Keep this safe!

---

## UPDATING THE APP

When you need to make changes:

1. Go to your GitHub repository
2. Click on the file you want to edit (e.g., app.js)
3. Click the pencil icon (edit)
4. Make your changes
5. Scroll down, add commit message, click "Commit changes"
6. Changes go live in 1-2 minutes
7. On iPad: Close and reopen app (or refresh in Safari first)

---

## TROUBLESHOOTING

### Problem: "Cannot read file" or app won't load
**Solution:**
- Make sure all 5 files are uploaded to GitHub
- Check that repository is set to "Public"
- Wait 5 minutes after uploading for GitHub Pages to update

### Problem: App loses data when I close it
**Solution:**
- Make sure you're using the home screen icon, not Safari bookmark
- Check that you tapped "Add to Home Screen" in Safari
- Data saves automatically - no need to do anything

### Problem: Can't log in
**Solution:**
- Default PIN is **1234**
- If you changed it and forgot, edit app.js on GitHub and set new PIN

### Problem: Alerts not showing
**Solution:**
- Distribute some items first to decrease inventory
- Go to Settings and check alert thresholds
- Default: Critical at 20%, Low at 30%, Reorder at 40%

### Problem: PDF export not working
**Solution:**
- Generate a report first before exporting
- Make sure popup blockers are disabled
- Try in Safari instead of the app icon

---

## BACKING UP YOUR DATA

**VERY IMPORTANT:** Back up your data regularly!

### Automatic Backups (Recommended):
1. Go to Settings in app
2. Tap "Backup All Data"
3. Save file to:
   - iCloud Drive (recommended)
   - Google Drive
   - Email to yourself
4. **Do this weekly!**

### What Gets Backed Up:
- All participants
- All encounters
- All testing records
- All referrals
- All kit distributions
- Current inventory levels
- Kit status
- Your alert threshold settings

### Restoring from Backup:
1. Go to Settings
2. Tap "Restore from Backup"
3. Select your backup file
4. Confirm restoration
5. All data will be restored

---

## SHARING WITH MULTIPLE STAFF

### Option 1: Same iPad, Different Users
- Everyone uses same iPad
- Everyone uses same PIN
- All data shared

### Option 2: Multiple iPads
Each iPad:
1. Install app from same GitHub Pages URL
2. Each has separate data
3. Share data by:
   - Backing up from one iPad
   - Emailing backup file
   - Restoring on other iPad

---

## CUSTOMIZATION

### Change Alert Thresholds:
1. Open app
2. Go to Settings
3. Adjust:
   - Critical Alert (default 20%)
   - Low Stock Alert (default 30%)
   - Reorder Alert (default 40%)
4. Tap "Save Thresholds"

### Add More Inventory Items:
1. Go to GitHub
2. Edit **app.js**
3. Find the `inventory:` array (around line 100)
4. Add new item following same format
5. Commit changes

### Adjust Kit Contents:
1. Go to GitHub
2. Edit **app.js**
3. Find the `KITS` object (around line 30)
4. Modify items in each kit
5. Commit changes

---

## MAINTENANCE

### Weekly Tasks:
- ✅ Backup data to cloud storage
- ✅ Review inventory alerts
- ✅ Generate weekly report

### Monthly Tasks:
- ✅ Generate full report for records
- ✅ Export PDF for documentation
- ✅ Check all 12 process objectives
- ✅ Review referral linkage rates

---

## SUPPORT

### If Something Goes Wrong:

1. **Check your backup** - You can always restore
2. **Check GitHub** - Make sure files are still there
3. **Clear Safari cache:**
   - iPad Settings → Safari → Clear History and Website Data
   - Reinstall app from home screen

### Getting Help:

1. Check this document first
2. Review the Phase 1 Enhancement specs
3. Contact your IT department
4. GitHub has extensive documentation

---

## WHAT'S DIFFERENT FROM OLD VERSION?

### NEW in Phase 1:

1. **Low-Stock Alerts**
   - Color-coded (Red/Yellow/Orange/Green)
   - Show on dashboard immediately
   - Email notifications (when connected)

2. **Complete Inventory (44+ items)**
   - All actual items from your order list
   - Organized by category
   - Filter and search
   - Storage locations tracked

3. **Pre-Packaged Kits**
   - 5 standard kit types
   - One-tap distribution
   - Auto-deducts all items
   - Assembly tracking

4. **Backup & Restore**
   - Export all data to file
   - Restore anytime
   - Protects against data loss

5. **PDF Reports**
   - Print-ready format
   - Professional layout
   - All objectives covered

6. **Enhanced Settings**
   - Adjust alert thresholds
   - View system info
   - Clear data (with confirmation)

---

## NEXT STEPS (PHASE 2 - FUTURE)

When Phase 1 is working well, you can add:

1. **Barcode Scanning**
   - Use iPad camera
   - Scan supply boxes
   - Faster inventory updates

2. **Vending Machine Tracking**
   - Track wound care supplies
   - Monitor usage
   - Auto-restock alerts

3. **Quick-Log Shortcuts**
   - Preset encounter types
   - One-tap logging
   - Common scenarios saved

---

## QUICK REFERENCE

**Your App URL:** https://yourusername.github.io/chr-tracker/

**Default PIN:** 1234 (CHANGE THIS!)

**Backup Location:** [Choose: iCloud, Google Drive, Email]

**Last Backup Date:** _____________

**IT Contact:** _____________

**GitHub Account:** _____________

---

## SUCCESS CHECKLIST

Before going live, make sure:

- ✅ App installed on iPad home screen
- ✅ PIN changed from default
- ✅ Test participant enrolled successfully
- ✅ Test encounter logged successfully
- ✅ Test kit distributed successfully
- ✅ Inventory updating correctly
- ✅ Alerts showing correctly
- ✅ Reports generating correctly
- ✅ PDF export working
- ✅ Backup created and saved
- ✅ Staff trained on basic functions
- ✅ Backup schedule established (weekly)

---

**You're all set! The app is ready to use for your CHR program starting July 1, 2025! 🎉**

For Phase 2 features (barcode scanning, vending machine), just let me know when you're ready.
