// ============================================
// CHR TRACKING APP - PHASE 1 - MAIN JAVASCRIPT
// ============================================

// Security & Authentication
const APP_PIN = '1234'; // CHANGE THIS TO YOUR SECURE PIN
let isLocked = true;
let autoLockTimeout;

// Alert Thresholds (can be adjusted in settings)
let THRESHOLDS = {
    critical: 20,  // 20%
    low: 30,      // 30%
    reorder: 40   // 40%
};

// Load thresholds from localStorage if they exist
if (localStorage.getItem('alertThresholds')) {
    THRESHOLDS = JSON.parse(localStorage.getItem('alertThresholds'));
}

// Kit Definitions
const KITS = {
    'Kit A': {
        name: 'Basic Harm Reduction',
        items: {
            'Needles/Syringes': 10,
            'Benzalkonium Chloride Towelettes': 5,
            'Fentanyl Test Strip': 2,
            'Xylazine Test Strip': 1,
            'Airlife Sterile Water 5ml': 2,
            'Richmond Cotton Pellets': 2,
            '7" inch Wood Stirrers': 1,
            'One Use Filter Pack': 2,
            'Tourniquet': 1,
            'Lifestyle Normal Condoms': 2,
            'Personal Lubricant': 1,
            'Needle Disposal Box': 1,
            'Brown Bags': 1
        },
        starting: 100,
        current: 100
    },
    'Kit B': {
        name: 'Overdose Prevention',
        items: {
            '4mg Naloxone Nasal Spray': 1,
            'CPR Face Shields': 1,
            'Fentanyl Test Strip': 5,
            'Xylazine Test Strip': 3,
            'Benzo Test Strips': 1,
            'Drawstring Backpack': 1
        },
        starting: 50,
        current: 50
    },
    'Kit C': {
        name: 'Safe Sex',
        items: {
            'Lifestyle Normal Condoms': 5,
            'Lifestyle Large Condoms': 5,
            'Dental Dam': 2,
            'Personal Lubricant': 5,
            '2x2 Zip Bags Resealable': 1
        },
        starting: 150,
        current: 150
    },
    'Kit D': {
        name: 'Wound Care',
        items: {
            'First Aid Sheer Band Aids': 10,
            'Knuckle Adhesive Bandages': 2,
            'Benzalkonium Chloride Towelettes': 5,
            'Blue Medical Tape Rolls': 1,
            'Finger Cots': 2,
            'Hand Sanitizing Purell Wipes': 2,
            'Lip Ointments': 1,
            '2 MIL Thickness Zip Closure Bags': 1
        },
        starting: 75,
        current: 75
    },
    'Kit E': {
        name: 'Personal Hygiene',
        items: {
            'Toothbrush': 1,
            'Gel Fluoride Toothpaste': 1,
            'Dawnmist Shampoo and Conditioner Packets': 2,
            'Washcloths': 2,
            'Deodorant': 1,
            'Lip Balm': 2,
            'Purell Hand Sanitizing Bottles': 1,
            'Tampax Regular': 2,
            'Drawstring Backpack': 1
        },
        starting: 100,
        current: 100
    }
};

// Database (LocalStorage)
const DB = {
    participants: [],
    encounters: [],
    testing: [],
    referrals: [],
    kitDistributions: [],
    inventory: [
        // CATEGORY 1: HARM REDUCTION SUPPLIES
        { id: 1, name: 'Needles/Syringes', category: 'harm-reduction', starting: 50000, current: 50000, min: 10000, unit: 'units', location: 'Locked Cabinet A' },
        { id: 2, name: 'Tourniquet', category: 'harm-reduction', starting: 250, current: 250, min: 50, unit: 'each', location: 'Locked Cabinet A' },
        { id: 3, name: 'Brass Screens', category: 'harm-reduction', starting: 1000, current: 1000, min: 200, unit: 'each', location: 'Locked Cabinet A' },
        { id: 4, name: '7" inch Wood Stirrers', category: 'harm-reduction', starting: 1000, current: 1000, min: 200, unit: 'each', location: 'Locked Cabinet A' },
        { id: 5, name: 'One Use Filter Pack', category: 'harm-reduction', starting: 4500, current: 4500, min: 900, unit: 'pack', location: 'Locked Cabinet A' },
        { id: 6, name: 'Richmond Cotton Pellets', category: 'harm-reduction', starting: 13, current: 13, min: 3, unit: 'box', location: 'Locked Cabinet A' },
        { id: 7, name: 'Airlife Sterile Water 5ml', category: 'harm-reduction', starting: 1200, current: 1200, min: 300, unit: 'vial', location: 'Locked Cabinet A' },
        { id: 8, name: '2x2 Zip Bags Resealable', category: 'harm-reduction', starting: 1000, current: 1000, min: 200, unit: 'each', location: 'Supply Room' },
        { id: 9, name: '2 MIL Thickness Zip Closure Bags', category: 'harm-reduction', starting: 1000, current: 1000, min: 200, unit: 'each', location: 'Supply Room' },
        { id: 10, name: 'Brown Bags', category: 'harm-reduction', starting: 1000, current: 1000, min: 200, unit: 'each', location: 'Supply Room' },
        
        // CATEGORY 2: OVERDOSE PREVENTION
        { id: 11, name: '4mg Naloxone Nasal Spray', category: 'overdose', starting: 100, current: 100, min: 20, unit: 'dose', location: 'Locked Med Cabinet' },
        { id: 12, name: 'Nasal Med Trainer', category: 'overdose', starting: 20, current: 20, min: 5, unit: 'each', location: 'Storage Shelf B' },
        { id: 13, name: 'Fentanyl Test Strip', category: 'overdose', starting: 200, current: 200, min: 40, unit: 'strip', location: 'Locked Cabinet A' },
        { id: 14, name: 'Xylazine Test Strip', category: 'overdose', starting: 300, current: 300, min: 60, unit: 'strip', location: 'Locked Cabinet A' },
        { id: 15, name: 'Benzo Test Strips', category: 'overdose', starting: 100, current: 100, min: 20, unit: 'strip', location: 'Locked Cabinet A' },
        { id: 16, name: 'CPR Face Shields', category: 'overdose', starting: 10, current: 10, min: 3, unit: 'each', location: 'First Aid Station' },
        
        // CATEGORY 3: SAFE SEX SUPPLIES
        { id: 17, name: 'Lifestyle Normal Condoms', category: 'safe-sex', starting: 700, current: 700, min: 140, unit: 'each', location: 'Locked Cabinet C' },
        { id: 18, name: 'Lifestyle Large Condoms', category: 'safe-sex', starting: 700, current: 700, min: 140, unit: 'each', location: 'Locked Cabinet C' },
        { id: 19, name: 'Dental Dam', category: 'safe-sex', starting: 100, current: 100, min: 20, unit: 'each', location: 'Locked Cabinet C' },
        { id: 20, name: 'Personal Lubricant', category: 'safe-sex', starting: 1008, current: 1008, min: 200, unit: 'packet', location: 'Locked Cabinet C' },
        
        // CATEGORY 4: TESTING SUPPLIES
        { id: 21, name: 'HIV Test Kit', category: 'testing', starting: 100, current: 100, min: 20, unit: 'kit', location: 'Locked Med Cabinet' },
        
        // CATEGORY 5: WOUND CARE SUPPLIES
        { id: 22, name: 'First Aid Sheer Band Aids', category: 'wound-care', starting: 1200, current: 1200, min: 300, unit: 'bandage', location: 'First Aid Station' },
        { id: 23, name: 'Knuckle Adhesive Bandages', category: 'wound-care', starting: 100, current: 100, min: 25, unit: 'bandage', location: 'First Aid Station' },
        { id: 24, name: 'Blue Medical Tape Rolls', category: 'wound-care', starting: 30, current: 30, min: 6, unit: 'roll', location: 'First Aid Station' },
        { id: 25, name: 'Micropore Tape', category: 'wound-care', starting: 100, current: 100, min: 20, unit: 'roll', location: 'First Aid Station' },
        { id: 26, name: 'Benzalkonium Chloride Towelettes', category: 'wound-care', starting: 1000, current: 1000, min: 200, unit: 'towelette', location: 'First Aid Station' },
        { id: 27, name: 'Manicure Sticks', category: 'wound-care', starting: 288, current: 288, min: 60, unit: 'each', location: 'First Aid Station' },
        { id: 28, name: 'Finger Cots', category: 'wound-care', starting: 144, current: 144, min: 30, unit: 'each', location: 'First Aid Station' },
        
        // CATEGORY 6: HYGIENE & PERSONAL CARE
        { id: 29, name: 'Hand Sanitizing Purell Wipes', category: 'hygiene', starting: 100, current: 100, min: 20, unit: 'wipe', location: 'Multiple Locations' },
        { id: 30, name: 'Purell Hand Sanitizing Bottles', category: 'hygiene', starting: 48, current: 48, min: 10, unit: 'bottle', location: 'Multiple Locations' },
        { id: 31, name: 'Lip Ointments', category: 'hygiene', starting: 1728, current: 1728, min: 350, unit: 'each', location: 'Supply Closet' },
        { id: 32, name: 'Lip Balm', category: 'hygiene', starting: 288, current: 288, min: 60, unit: 'each', location: 'Supply Closet' },
        { id: 33, name: 'Dawnmist Shampoo and Conditioner Packets', category: 'hygiene', starting: 100, current: 100, min: 20, unit: 'packet', location: 'Supply Closet' },
        { id: 34, name: 'Washcloths', category: 'hygiene', starting: 1152, current: 1152, min: 230, unit: 'each', location: 'Supply Closet' },
        { id: 35, name: 'Fingernail Clippers', category: 'hygiene', starting: 18, current: 18, min: 4, unit: 'each', location: 'Supply Closet' },
        { id: 36, name: 'Deodorant', category: 'hygiene', starting: 96, current: 96, min: 20, unit: 'each', location: 'Supply Closet' },
        { id: 37, name: 'Toothbrush', category: 'hygiene', starting: 144, current: 144, min: 30, unit: 'each', location: 'Supply Closet' },
        { id: 38, name: 'Gel Fluoride Toothpaste', category: 'hygiene', starting: 144, current: 144, min: 30, unit: 'tube', location: 'Supply Closet' },
        { id: 39, name: 'Shampoo and Hand Wash Packets', category: 'hygiene', starting: 300, current: 300, min: 60, unit: 'packet', location: 'Supply Closet' },
        
        // CATEGORY 7: FEMININE HYGIENE
        { id: 40, name: 'Tampax Regular', category: 'feminine', starting: 80, current: 80, min: 16, unit: 'each', location: 'Supply Closet' },
        { id: 41, name: 'Tampons', category: 'feminine', starting: 80, current: 80, min: 16, unit: 'each', location: 'Supply Closet' },
        { id: 42, name: 'Kotex Regular Maxi Pads', category: 'feminine', starting: 120, current: 120, min: 25, unit: 'each', location: 'Supply Closet' },
        
        // CATEGORY 8: DISPOSAL & SAFETY
        { id: 43, name: 'Needle Disposal Box', category: 'disposal', starting: 200, current: 200, min: 40, unit: 'each', location: 'Multiple Locations' },
        { id: 44, name: 'Drawstring Backpack', category: 'disposal', starting: 50, current: 50, min: 10, unit: 'each', location: 'Storage Area' }
    ],
    kits: JSON.parse(JSON.stringify(KITS)) // Deep copy of kit definitions
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setupEventListeners();
    updateDashboard();
    displayCurrentDate();
    
    // Show login screen on load
    if (isLocked) {
        document.getElementById('loginScreen').classList.remove('hidden');
    }
    
    // Set current datetime for encounter form
    const now = new Date();
    const datetime = now.toISOString().slice(0, 16);
    if (document.getElementById('encounterDateTime')) {
        document.getElementById('encounterDateTime').value = datetime;
    }
    
    // Load thresholds into settings
    document.getElementById('criticalThreshold').value = THRESHOLDS.critical;
    document.getElementById('lowThreshold').value = THRESHOLDS.low;
    document.getElementById('reorderThreshold').value = THRESHOLDS.reorder;
});

function displayCurrentDate() {
    const dateEl = document.getElementById('currentDate');
    if (dateEl) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = new Date().toLocaleDateString('en-US', options);
    }
}

// ============================================
// SECURITY & AUTHENTICATION
// ============================================

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const pin = document.getElementById('pinInput').value;
    
    if (pin === APP_PIN) {
        isLocked = false;
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('pinInput').value = '';
        updateDashboard();
        resetAutoLock();
    } else {
        alert('Incorrect PIN. Please try again.');
        document.getElementById('pinInput').value = '';
    }
});

document.getElementById('lockBtn').addEventListener('click', lockApp);

function lockApp() {
    isLocked = true;
    document.getElementById('loginScreen').classList.remove('hidden');
    clearTimeout(autoLockTimeout);
}

function resetAutoLock() {
    clearTimeout(autoLockTimeout);
    // Auto-lock after 5 minutes of inactivity
    autoLockTimeout = setTimeout(lockApp, 5 * 60 * 1000);
}

// Reset auto-lock on any user activity
document.addEventListener('click', resetAutoLock);
document.addEventListener('keypress', resetAutoLock);
document.addEventListener('touchstart', resetAutoLock);

// ============================================
// DATA MANAGEMENT
// ============================================

function saveData() {
    localStorage.setItem('chrData', JSON.stringify(DB));
    localStorage.setItem('lastSync', new Date().toISOString());
}

function loadData() {
    const saved = localStorage.getItem('chrData');
    if (saved) {
        const loadedData = JSON.parse(saved);
        DB.participants = loadedData.participants || [];
        DB.encounters = loadedData.encounters || [];
        DB.testing = loadedData.testing || [];
        DB.referrals = loadedData.referrals || [];
        DB.kitDistributions = loadedData.kitDistributions || [];
        DB.inventory = loadedData.inventory || DB.inventory;
        DB.kits = loadedData.kits || DB.kits;
    }
    const lastSync = localStorage.getItem('lastSync');
    if (lastSync && document.getElementById('lastSync')) {
        document.getElementById('lastSync').textContent = new Date(lastSync).toLocaleString();
    }
}

// ============================================
// NAVIGATION
// ============================================

function showView(viewId) {
    // Hide all views
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    
    // Show selected view
    document.getElementById(viewId).classList.add('active');
    
    // Update specific views when shown
    if (viewId === 'dashboard') {
        updateDashboard();
    } else if (viewId === 'inventory') {
        displayInventory();
    } else if (viewId === 'kits') {
        updateKitStatusDisplay();
        populateParticipantDropdown('kitParticipant');
    } else if (viewId === 'encounter') {
        populateParticipantDropdown('encounterParticipant');
    } else if (viewId === 'testing') {
        populateParticipantDropdown('testParticipant');
        displayTestingSummary();
    } else if (viewId === 'referrals') {
        populateParticipantDropdown('referralParticipant');
        displayReferralSummary();
    } else if (viewId === 'settings') {
        updateSettingsDisplay();
    }
}

// ============================================
// DASHBOARD FUNCTIONS
// ============================================

function updateDashboard() {
    // Update stats
    document.getElementById('totalParticipants').textContent = DB.participants.length;
    
    // Today's encounters
    const today = new Date().toDateString();
    const todayEncounters = DB.encounters.filter(e => 
        new Date(e.dateTime).toDateString() === today
    ).length;
    document.getElementById('todayEncounters').textContent = todayEncounters;
    
    // Total needles
    const totalNeedlesOut = DB.encounters.reduce((sum, e) => sum + (e.needlesOut || 0), 0);
    const totalNeedlesIn = DB.encounters.reduce((sum, e) => sum + (e.needlesIn || 0), 0);
    document.getElementById('needlesOut').textContent = totalNeedlesOut.toLocaleString();
    document.getElementById('needlesIn').textContent = totalNeedlesIn.toLocaleString();
    
    // Display alerts
    displayAlerts();
}

function displayAlerts() {
    const alertsSection = document.getElementById('alertsSection');
    const alerts = generateAlerts();
    
    if (alerts.length === 0) {
        alertsSection.innerHTML = `
            <div class="alert alert-success">
                <strong>✅ All Inventory OK</strong> - No items need immediate attention
            </div>
        `;
    } else {
        let html = `<div class="alert alert-warning">
            <strong>⚠️ INVENTORY ALERTS (${alerts.length})</strong>
        </div>`;
        
        // Show first 3 critical/low alerts
        alerts.slice(0, 3).forEach(alert => {
            const icon = alert.level === 'critical' ? '🔴' : alert.level === 'low' ? '🟡' : '🟠';
            html += `
                <div class="alert alert-${alert.level}">
                    ${icon} <strong>${alert.item}</strong>: ${alert.current}/${alert.starting} (${alert.percent}%) - ${alert.message}
                </div>
            `;
        });
        
        if (alerts.length > 3) {
            html += `<div class="alert alert-info">...and ${alerts.length - 3} more. <a href="#" onclick="showView('inventory'); return false;">View All</a></div>`;
        }
        
        alertsSection.innerHTML = html;
    }
}

function generateAlerts() {
    const alerts = [];
    
    // Check inventory items
    DB.inventory.forEach(item => {
        const percent = Math.round((item.current / item.starting) * 100);
        
        if (percent < THRESHOLDS.critical) {
            alerts.push({
                level: 'critical',
                item: item.name,
                current: item.current,
                starting: item.starting,
                percent: percent,
                message: 'ORDER NOW - CRITICAL'
            });
        } else if (percent < THRESHOLDS.low) {
            alerts.push({
                level: 'low',
                item: item.name,
                current: item.current,
                starting: item.starting,
                percent: percent,
                message: 'LOW STOCK'
            });
        } else if (percent < THRESHOLDS.reorder) {
            alerts.push({
                level: 'reorder',
                item: item.name,
                current: item.current,
                starting: item.starting,
                percent: percent,
                message: 'REORDER SOON'
            });
        }
    });
    
    // Check kits
    Object.keys(DB.kits).forEach(kitKey => {
        const kit = DB.kits[kitKey];
        const percent = Math.round((kit.current / kit.starting) * 100);
        
        if (percent < THRESHOLDS.low) {
            alerts.push({
                level: 'low',
                item: `${kitKey} (${kit.name})`,
                current: kit.current,
                starting: kit.starting,
                percent: percent,
                message: 'ASSEMBLE MORE KITS'
            });
        }
    });
    
    // Sort by severity
    alerts.sort((a, b) => {
        const order = { critical: 0, low: 1, reorder: 2 };
        return order[a.level] - order[b.level];
    });
    
    return alerts;
}

// ============================================
// PARTICIPANT ENROLLMENT
// ============================================

function setupEventListeners() {
    document.getElementById('enrollmentForm').addEventListener('submit', handleEnrollment);
    document.getElementById('encounterForm').addEventListener('submit', handleEncounter);
    document.getElementById('kitDistributionForm').addEventListener('submit', handleKitDistribution);
    document.getElementById('testingForm').addEventListener('submit', handleTesting);
    document.getElementById('referralForm').addEventListener('submit', handleReferral);
    
    // Inventory filters
    document.getElementById('inventoryCategory').addEventListener('change', displayInventory);
    document.getElementById('inventoryFilter').addEventListener('change', displayInventory);
    document.getElementById('inventorySearch').addEventListener('input', displayInventory);
}

function handleEnrollment(e) {
    e.preventDefault();
    
    const services = [];
    document.querySelectorAll('#enrollmentForm .checkbox-group input:checked').forEach(cb => {
        services.push(cb.value);
    });
    
    const participant = {
        id: 'CHR-' + Date.now(),
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        dob: document.getElementById('dob').value,
        phone: document.getElementById('phone').value,
        servicesInterested: services,
        agreementSigned: document.getElementById('agreementSigned').checked,
        enrollmentDate: new Date().toISOString(),
        status: 'Active'
    };
    
    DB.participants.push(participant);
    saveData();
    
    alert(`✅ Participant enrolled successfully!\nID: ${participant.id}`);
    document.getElementById('enrollmentForm').reset();
    showView('dashboard');
}

function populateParticipantDropdown(selectId) {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Select Participant...</option>';
    
    DB.participants.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = `${p.firstName} ${p.lastName} (${p.id})`;
        select.appendChild(option);
    });
}

// ============================================
// ENCOUNTER LOGGING
// ============================================

function handleEncounter(e) {
    e.preventDefault();
    
    const services = [];
    document.querySelectorAll('.service-check:checked').forEach(cb => {
        services.push(cb.value);
    });
    
    const needlesOut = parseInt(document.getElementById('needlesOut').value) || 0;
    const needlesIn = parseInt(document.getElementById('needlesIn').value) || 0;
    const naloxoneGiven = parseInt(document.getElementById('naloxoneGiven').value) || 0;
    const condomsGiven = parseInt(document.getElementById('condomsGiven').value) || 0;
    
    const encounter = {
        id: 'ENC-' + Date.now(),
        participantID: document.getElementById('encounterParticipant').value,
        dateTime: document.getElementById('encounterDateTime').value,
        services: services,
        needlesOut: needlesOut,
        needlesIn: needlesIn,
        naloxoneGiven: naloxoneGiven,
        condomsGiven: condomsGiven,
        notes: document.getElementById('encounterNotes').value,
        staffInitials: document.getElementById('staffInitials').value
    };
    
    DB.encounters.push(encounter);
    
    // Update inventory
    updateInventoryItem('Needles/Syringes', -needlesOut);
    updateInventoryItem('4mg Naloxone Nasal Spray', -naloxoneGiven);
    updateInventoryItem('Lifestyle Normal Condoms', -condomsGiven);
    
    saveData();
    
    alert('✅ Encounter logged successfully!');
    document.getElementById('encounterForm').reset();
    showView('dashboard');
}

// ============================================
// KIT DISTRIBUTION (NEW)
// ============================================

function handleKitDistribution(e) {
    e.preventDefault();
    
    const kitType = document.getElementById('kitType').value;
    const quantity = parseInt(document.getElementById('kitQuantity').value);
    
    // Check if enough kits available
    if (DB.kits[kitType].current < quantity) {
        alert(`❌ Not enough ${kitType} kits available!\nCurrent: ${DB.kits[kitType].current}\nRequested: ${quantity}`);
        return;
    }
    
    const distribution = {
        id: 'KIT-' + Date.now(),
        participantID: document.getElementById('kitParticipant').value,
        kitType: kitType,
        kitName: DB.kits[kitType].name,
        quantity: quantity,
        dateTime: new Date().toISOString(),
        notes: document.getElementById('kitNotes').value,
        staffInitials: document.getElementById('kitStaffInitials').value
    };
    
    DB.kitDistributions.push(distribution);
    
    // Decrease kit count
    DB.kits[kitType].current -= quantity;
    
    // Decrease individual items
    const kit = KITS[kitType];
    Object.keys(kit.items).forEach(itemName => {
        const qtyPerKit = kit.items[itemName];
        updateInventoryItem(itemName, -(qtyPerKit * quantity));
    });
    
    saveData();
    
    alert(`✅ ${quantity} x ${kitType} (${DB.kits[kitType].name}) distributed successfully!`);
    document.getElementById('kitDistributionForm').reset();
    updateKitStatusDisplay();
}

function updateKitStatusDisplay() {
    const display = document.getElementById('kitStatusDisplay');
    let html = '';
    
    Object.keys(DB.kits).forEach(kitKey => {
        const kit = DB.kits[kitKey];
        const percent = Math.round((kit.current / kit.starting) * 100);
        const barWidth = Math.min(percent, 100);
        
        let statusClass = 'ok';
        let statusIcon = '🟢';
        let statusText = '';
        
        if (percent < THRESHOLDS.critical) {
            statusClass = 'critical';
            statusIcon = '🔴';
            statusText = `⚠️ Assemble ${kit.starting - kit.current} more kits`;
        } else if (percent < THRESHOLDS.low) {
            statusClass = 'low';
            statusIcon = '🟡';
            statusText = `⚠️ Assemble ${Math.ceil((kit.starting * 0.5) - kit.current)} more kits`;
        } else if (percent < THRESHOLDS.reorder) {
            statusClass = 'reorder';
            statusIcon = '🟠';
        }
        
        html += `
            <div class="kit-status-item ${statusClass}">
                <div class="kit-header">
                    <strong>${kitKey} - ${kit.name}</strong>
                    <span>${statusIcon} ${kit.current}/${kit.starting}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${statusClass}" style="width: ${barWidth}%"></div>
                </div>
                ${statusText ? `<div class="kit-alert">${statusText}</div>` : ''}
            </div>
        `;
    });
    
    display.innerHTML = html;
}

// ============================================
// INVENTORY MANAGEMENT (ENHANCED)
// ============================================

function displayInventory() {
    const category = document.getElementById('inventoryCategory').value;
    const filter = document.getElementById('inventoryFilter').value;
    const search = document.getElementById('inventorySearch').value.toLowerCase();
    
    let items = DB.inventory;
    
    // Filter by category
    if (category !== 'all') {
        items = items.filter(item => item.category === category);
    }
    
    // Filter by search
    if (search) {
        items = items.filter(item => item.name.toLowerCase().includes(search));
    }
    
    // Filter by alert status
    if (filter !== 'all') {
        items = items.filter(item => {
            const percent = (item.current / item.starting) * 100;
            if (filter === 'critical') return percent < THRESHOLDS.critical;
            if (filter === 'low') return percent < THRESHOLDS.low;
            if (filter === 'alerts') return percent < THRESHOLDS.reorder;
            return true;
        });
    }
    
    const listEl = document.getElementById('inventoryList');
    
    if (items.length === 0) {
        listEl.innerHTML = '<p class="no-results">No items found matching your filters.</p>';
        return;
    }
    
    let html = '';
    items.forEach(item => {
        const percent = Math.round((item.current / item.starting) * 100);
        const barWidth = Math.min(percent, 100);
        
        let statusClass = 'ok';
        let statusText = 'OK';
        let statusIcon = '🟢';
        
        if (percent < THRESHOLDS.critical) {
            statusClass = 'critical';
            statusText = 'CRITICAL - ORDER NOW';
            statusIcon = '🔴';
        } else if (percent < THRESHOLDS.low) {
            statusClass = 'low';
            statusText = 'LOW STOCK';
            statusIcon = '🟡';
        } else if (percent < THRESHOLDS.reorder) {
            statusClass = 'reorder';
            statusText = 'REORDER SOON';
            statusIcon = '🟠';
        }
        
        html += `
            <div class="inventory-item ${statusClass}">
                <div class="item-header">
                    <div>
                        <strong>${item.name}</strong>
                        <small>${item.location}</small>
                    </div>
                    <div class="item-status">
                        ${statusIcon} ${item.current} / ${item.starting} ${item.unit}
                        <br><small>${percent}% remaining</small>
                    </div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${statusClass}" style="width: ${barWidth}%"></div>
                </div>
                <div class="item-footer">
                    <span class="status-badge ${statusClass}">${statusText}</span>
                    <span class="min-threshold">Min: ${item.min} ${item.unit}</span>
                </div>
            </div>
        `;
    });
    
    listEl.innerHTML = html;
}

function updateInventoryItem(itemName, changeAmount) {
    const item = DB.inventory.find(i => i.name === itemName);
    if (item) {
        item.current = Math.max(0, item.current + changeAmount);
    }
}

// ============================================
// TESTING & TREATMENT
// ============================================

function handleTesting(e) {
    e.preventDefault();
    
    const testRecord = {
        id: 'TEST-' + Date.now(),
        participantID: document.getElementById('testParticipant').value,
        testType: document.getElementById('testType').value,
        testDate: document.getElementById('testDate').value,
        result: document.getElementById('testResult').value,
        treatmentStarted: document.getElementById('treatmentStarted').value,
        notes: document.getElementById('testNotes').value
    };
    
    DB.testing.push(testRecord);
    
    // Update inventory - decrease test kit
    const testType = testRecord.testType;
    if (testType === 'HIV') {
        updateInventoryItem('HIV Test Kit', -1);
    }
    
    saveData();
    
    alert('✅ Test record saved successfully!');
    document.getElementById('testingForm').reset();
    displayTestingSummary();
}

function displayTestingSummary() {
    const summaryEl = document.getElementById('testingSummary');
    
    const testCounts = {};
    DB.testing.forEach(test => {
        if (!testCounts[test.testType]) {
            testCounts[test.testType] = { total: 0, positive: 0, negative: 0, pending: 0 };
        }
        testCounts[test.testType].total++;
        if (test.result === 'Positive') testCounts[test.testType].positive++;
        if (test.result === 'Negative') testCounts[test.testType].negative++;
        if (test.result === 'Pending') testCounts[test.testType].pending++;
    });
    
    let html = '<table class="summary-table"><tr><th>Test Type</th><th>Total</th><th>Positive</th><th>Negative</th><th>Pending</th></tr>';
    
    Object.keys(testCounts).forEach(type => {
        const counts = testCounts[type];
        html += `<tr>
            <td><strong>${type}</strong></td>
            <td>${counts.total}</td>
            <td>${counts.positive}</td>
            <td>${counts.negative}</td>
            <td>${counts.pending}</td>
        </tr>`;
    });
    
    html += '</table>';
    summaryEl.innerHTML = html;
}

// ============================================
// REFERRAL MANAGEMENT
// ============================================

function handleReferral(e) {
    e.preventDefault();
    
    const referral = {
        id: 'REF-' + Date.now(),
        participantID: document.getElementById('referralParticipant').value,
        referralTo: document.getElementById('referralTo').value,
        serviceType: document.getElementById('referralService').value,
        referralDate: document.getElementById('referralDate').value,
        linkedSuccessfully: document.getElementById('linkedSuccessfully').value,
        notes: document.getElementById('referralNotes').value
    };
    
    DB.referrals.push(referral);
    saveData();
    
    alert('✅ Referral saved successfully!');
    document.getElementById('referralForm').reset();
    displayReferralSummary();
}

function displayReferralSummary() {
    const summaryEl = document.getElementById('referralSummary');
    
    const totalRefs = DB.referrals.length;
    const linkedRefs = DB.referrals.filter(r => r.linkedSuccessfully === 'Yes').length;
    const linkageRate = totalRefs > 0 ? Math.round((linkedRefs / totalRefs) * 100) : 0;
    
    let html = `
        <div class="summary-card">
            <h4>Overall Linkage Rate</h4>
            <p class="stat-large">${linkageRate}%</p>
            <small>${linkedRefs} of ${totalRefs} successfully linked</small>
        </div>
        <table class="summary-table">
            <tr><th>Organization</th><th>Total Referrals</th><th>Successfully Linked</th><th>Linkage Rate</th></tr>
    `;
    
    const orgs = ['Brightview', 'Horizon Behavioral Health', 'Savidia', 'Other'];
    orgs.forEach(org => {
        const orgRefs = DB.referrals.filter(r => r.referralTo === org);
        const orgLinked = orgRefs.filter(r => r.linkedSuccessfully === 'Yes').length;
        const orgRate = orgRefs.length > 0 ? Math.round((orgLinked / orgRefs.length) * 100) : 0;
        
        if (orgRefs.length > 0) {
            html += `<tr>
                <td><strong>${org}</strong></td>
                <td>${orgRefs.length}</td>
                <td>${orgLinked}</td>
                <td>${orgRate}%</td>
            </tr>`;
        }
    });
    
    html += '</table>';
    summaryEl.innerHTML = html;
}

// ============================================
// REPORTING (ENHANCED WITH PDF EXPORT)
// ============================================

function generateReport(reportType) {
    const output = document.getElementById('reportOutput');
    const content = generateReportContent(reportType);
    output.innerHTML = content;
}

function generateReportContent(reportType) {
    let html = `
        <div class="report-header">
            <h2>CHR Program Report</h2>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <p>Report Period: July 1, 2025 - June 30, 2026</p>
        </div>
    `;
    
    // Summary Statistics
    html += `
        <div class="report-section">
            <h3>Program Overview</h3>
            <table class="summary-table">
                <tr><td><strong>Total Participants Enrolled</strong></td><td>${DB.participants.length} / 75 (${Math.round((DB.participants.length/75)*100)}%)</td></tr>
                <tr><td><strong>Total Encounters</strong></td><td>${DB.encounters.length}</td></tr>
                <tr><td><strong>Needles Distributed</strong></td><td>${DB.encounters.reduce((sum, e) => sum + (e.needlesOut || 0), 0).toLocaleString()} / 50,000</td></tr>
                <tr><td><strong>Needles Returned</strong></td><td>${DB.encounters.reduce((sum, e) => sum + (e.needlesIn || 0), 0).toLocaleString()} / 75,000</td></tr>
                <tr><td><strong>HIV Tests Completed</strong></td><td>${DB.testing.filter(t => t.testType === 'HIV').length} / 25</td></tr>
                <tr><td><strong>HCV Tests Completed</strong></td><td>${DB.testing.filter(t => t.testType === 'HCV').length} / 25</td></tr>
                <tr><td><strong>Total Referrals Made</strong></td><td>${DB.referrals.length}</td></tr>
                <tr><td><strong>Referrals Successfully Linked</strong></td><td>${DB.referrals.filter(r => r.linkedSuccessfully === 'Yes').length}</td></tr>
            </table>
        </div>
    `;
    
    // Kit Distributions
    html += `
        <div class="report-section">
            <h3>Kit Distribution Summary</h3>
            <table class="summary-table">
                <tr><th>Kit Type</th><th>Distributed</th><th>Remaining</th></tr>
    `;
    
    Object.keys(DB.kits).forEach(kitKey => {
        const kit = DB.kits[kitKey];
        const distributed = kit.starting - kit.current;
        html += `<tr>
            <td><strong>${kitKey} - ${kit.name}</strong></td>
            <td>${distributed}</td>
            <td>${kit.current}</td>
        </tr>`;
    });
    
    html += `</table></div>`;
    
    // Testing Summary
    html += `
        <div class="report-section">
            <h3>Testing & Treatment Summary</h3>
            <table class="summary-table">
                <tr><th>Test Type</th><th>Total Tests</th><th>Positive</th><th>Treatment Started</th></tr>
    `;
    
    ['HIV', 'HCV', 'HBV', 'STD', 'TB'].forEach(testType => {
        const tests = DB.testing.filter(t => t.testType === testType);
        const positive = tests.filter(t => t.result === 'Positive').length;
        const treated = tests.filter(t => t.treatmentStarted === 'Yes').length;
        
        if (tests.length > 0) {
            html += `<tr>
                <td><strong>${testType}</strong></td>
                <td>${tests.length}</td>
                <td>${positive}</td>
                <td>${treated}</td>
            </tr>`;
        }
    });
    
    html += `</table></div>`;
    
    // Referral Summary
    const totalRefs = DB.referrals.length;
    const linkedRefs = DB.referrals.filter(r => r.linkedSuccessfully === 'Yes').length;
    const linkageRate = totalRefs > 0 ? Math.round((linkedRefs / totalRefs) * 100) : 0;
    
    html += `
        <div class="report-section">
            <h3>Referral Linkage Summary</h3>
            <p><strong>Overall Linkage Rate: ${linkageRate}%</strong> (${linkedRefs} of ${totalRefs} successfully linked)</p>
            <table class="summary-table">
                <tr><th>Organization</th><th>Total Referrals</th><th>Successfully Linked</th><th>Linkage Rate</th></tr>
    `;
    
    ['Brightview', 'Horizon Behavioral Health', 'Savidia', 'Other'].forEach(org => {
        const orgRefs = DB.referrals.filter(r => r.referralTo === org);
        const orgLinked = orgRefs.filter(r => r.linkedSuccessfully === 'Yes').length;
        const orgRate = orgRefs.length > 0 ? Math.round((orgLinked / orgRefs.length) * 100) : 0;
        
        if (orgRefs.length > 0) {
            html += `<tr>
                <td><strong>${org}</strong></td>
                <td>${orgRefs.length}</td>
                <td>${orgLinked}</td>
                <td>${orgRate}%</td>
            </tr>`;
        }
    });
    
    html += `</table></div>`;
    
    // Inventory Alerts
    const alerts = generateAlerts();
    if (alerts.length > 0) {
        html += `
            <div class="report-section">
                <h3>⚠️ Inventory Alerts</h3>
                <table class="summary-table">
                    <tr><th>Item</th><th>Current</th><th>Starting</th><th>% Remaining</th><th>Status</th></tr>
        `;
        
        alerts.forEach(alert => {
            html += `<tr>
                <td><strong>${alert.item}</strong></td>
                <td>${alert.current}</td>
                <td>${alert.starting}</td>
                <td>${alert.percent}%</td>
                <td><span class="status-badge ${alert.level}">${alert.message}</span></td>
            </tr>`;
        });
        
        html += `</table></div>`;
    }
    
    if (reportType === 'full') {
        // Add participant list
        html += `
            <div class="report-section">
                <h3>Participant List</h3>
                <table class="summary-table">
                    <tr><th>ID</th><th>Name</th><th>Enrollment Date</th><th>Encounters</th></tr>
        `;
        
        DB.participants.forEach(p => {
            const encounters = DB.encounters.filter(e => e.participantID === p.id).length;
            html += `<tr>
                <td>${p.id}</td>
                <td>${p.firstName} ${p.lastName}</td>
                <td>${new Date(p.enrollmentDate).toLocaleDateString()}</td>
                <td>${encounters}</td>
            </tr>`;
        });
        
        html += `</table></div>`;
    }
    
    return html;
}

function exportReportPDF() {
    const reportContent = document.getElementById('reportOutput').innerHTML;
    
    if (!reportContent || reportContent.includes('Select a report type')) {
        alert('⚠️ Please generate a report first before exporting to PDF!');
        return;
    }
    
    // Create print window
    const printWindow = window.open('', '', 'height=800,width=1000');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>CHR Report - ${new Date().toLocaleDateString()}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 40px;
                    color: #333;
                    font-size: 12px;
                }
                h1, h2 {
                    color: #2c3e50;
                    border-bottom: 3px solid #3498db;
                    padding-bottom: 10px;
                }
                h3 {
                    color: #34495e;
                    margin-top: 30px;
                    border-bottom: 2px solid #95a5a6;
                    padding-bottom: 5px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                th {
                    background-color: #3498db;
                    color: white;
                    padding: 10px;
                    text-align: left;
                    border: 1px solid #2980b9;
                }
                td {
                    padding: 8px;
                    border: 1px solid #ddd;
                }
                tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                .report-section {
                    margin-bottom: 30px;
                    page-break-inside: avoid;
                }
                .report-header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .status-badge {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: bold;
                }
                .status-badge.critical {
                    background-color: #e74c3c;
                    color: white;
                }
                .status-badge.low {
                    background-color: #f39c12;
                    color: white;
                }
                .status-badge.reorder {
                    background-color: #ff9800;
                    color: white;
                }
                @media print {
                    body { margin: 20px; }
                    .report-section { page-break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            ${reportContent}
            <script>
                window.onload = function() {
                    window.print();
                    window.onafterprint = function() {
                        window.close();
                    };
                };
            </script>
        </body>
        </html>
    `);
    
    printWindow.document.close();
}

// ============================================
// BACKUP & RESTORE (NEW)
// ============================================

function backupData() {
    const backupData = {
        version: 'Phase 1.0',
        timestamp: new Date().toISOString(),
        data: DB,
        kits: DB.kits,
        thresholds: THRESHOLDS
    };
    
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Create download link
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CHR_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Show success message
    const status = document.getElementById('backupStatus');
    status.innerHTML = `<div class="alert alert-success">✅ Backup created successfully! File: CHR_Backup_${new Date().toISOString().split('T')[0]}.json</div>`;
    
    setTimeout(() => {
        status.innerHTML = '';
    }, 5000);
}

function restoreData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!confirm('⚠️ WARNING: This will replace ALL current data with the backup file. Make sure you have a current backup first! Continue?')) {
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backup = JSON.parse(e.target.result);
            
            // Validate backup
            if (!backup.data || !backup.version) {
                throw new Error('Invalid backup file format');
            }
            
            // Restore data
            DB.participants = backup.data.participants || [];
            DB.encounters = backup.data.encounters || [];
            DB.testing = backup.data.testing || [];
            DB.referrals = backup.data.referrals || [];
            DB.kitDistributions = backup.data.kitDistributions || [];
            DB.inventory = backup.data.inventory || DB.inventory;
            DB.kits = backup.kits || DB.kits;
            
            if (backup.thresholds) {
                THRESHOLDS = backup.thresholds;
                localStorage.setItem('alertThresholds', JSON.stringify(THRESHOLDS));
            }
            
            saveData();
            updateDashboard();
            
            const status = document.getElementById('backupStatus');
            status.innerHTML = `<div class="alert alert-success">✅ Data restored successfully from backup dated ${new Date(backup.timestamp).toLocaleString()}</div>`;
            
            setTimeout(() => {
                status.innerHTML = '';
            }, 5000);
            
        } catch (error) {
            alert('❌ Error restoring backup: ' + error.message);
        }
        
        event.target.value = '';
    };
    
    reader.readAsText(file);
}

// ============================================
// SETTINGS
// ============================================

function saveThresholds() {
    THRESHOLDS.critical = parseInt(document.getElementById('criticalThreshold').value);
    THRESHOLDS.low = parseInt(document.getElementById('lowThreshold').value);
    THRESHOLDS.reorder = parseInt(document.getElementById('reorderThreshold').value);
    
    localStorage.setItem('alertThresholds', JSON.stringify(THRESHOLDS));
    
    alert('✅ Alert thresholds saved successfully!');
    updateDashboard();
}

function updateSettingsDisplay() {
    const totalRecords = DB.participants.length + DB.encounters.length + 
                        DB.testing.length + DB.referrals.length + DB.kitDistributions.length;
    document.getElementById('totalRecords').textContent = totalRecords;
}

function clearAllData() {
    if (!confirm('⚠️ FINAL WARNING: This will permanently delete ALL data including participants, encounters, testing, referrals, and inventory records. This CANNOT be undone! Type "DELETE" to confirm.')) {
        return;
    }
    
    const confirmation = prompt('Type DELETE in capital letters to confirm:');
    if (confirmation !== 'DELETE') {
        alert('Data deletion cancelled.');
        return;
    }
    
    // Clear all data
    DB.participants = [];
    DB.encounters = [];
    DB.testing = [];
    DB.referrals = [];
    DB.kitDistributions = [];
    
    // Reset inventory to starting values
    DB.inventory.forEach(item => {
        item.current = item.starting;
    });
    
    // Reset kits
    DB.kits = JSON.parse(JSON.stringify(KITS));
    
    localStorage.clear();
    saveData();
    updateDashboard();
    
    alert('✅ All data has been cleared.');
    showView('dashboard');
}

// ============================================
// SERVICE WORKER (For offline capability)
// ============================================

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(reg => console.log('Service Worker registered'))
        .catch(err => console.log('Service Worker registration failed:', err));
}
