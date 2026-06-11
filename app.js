// ============================================
// CHR TRACKING APP — v1.1
// Participant Hub + Custom Inventory + RFID
// ============================================

const APP_PIN = '1234'; // CHANGE THIS
let isLocked = true;
let autoLockTimeout;
let newItemPhotoData = null; // stores base64 photo for new inventory item

let THRESHOLDS = { critical: 20, low: 30, reorder: 40 };
if (localStorage.getItem('alertThresholds')) {
    THRESHOLDS = JSON.parse(localStorage.getItem('alertThresholds'));
}

// ── Kit Definitions ───────────────────────────────────────────
const KITS = {
    'Kit A': { name:'Basic Harm Reduction', starting:100, current:100, items:{'Needles/Syringes':10,'Benzalkonium Chloride Towelettes':5,'Fentanyl Test Strip':2,'Xylazine Test Strip':1,'Airlife Sterile Water 5ml':2,'Richmond Cotton Pellets':2,'7" inch Wood Stirrers':1,'One Use Filter Pack':2,'Tourniquet':1,'Lifestyle Normal Condoms':2,'Personal Lubricant':1,'Needle Disposal Box':1,'Brown Bags':1}},
    'Kit B': { name:'Overdose Prevention',  starting:50,  current:50,  items:{'4mg Naloxone Nasal Spray':1,'CPR Face Shields':1,'Fentanyl Test Strip':5,'Xylazine Test Strip':3,'Benzo Test Strips':1,'Drawstring Backpack':1}},
    'Kit C': { name:'Safe Sex',             starting:150, current:150, items:{'Lifestyle Normal Condoms':5,'Lifestyle Large Condoms':5,'Dental Dam':2,'Personal Lubricant':5,'2x2 Zip Bags Resealable':1}},
    'Kit D': { name:'Wound Care',           starting:75,  current:75,  items:{'First Aid Sheer Band Aids':10,'Knuckle Adhesive Bandages':2,'Benzalkonium Chloride Towelettes':5,'Blue Medical Tape Rolls':1,'Finger Cots':2,'Hand Sanitizing Purell Wipes':2,'Lip Ointments':1,'2 MIL Thickness Zip Closure Bags':1}},
    'Kit E': { name:'Personal Hygiene',     starting:100, current:100, items:{'Toothbrush':1,'Gel Fluoride Toothpaste':1,'Dawnmist Shampoo and Conditioner Packets':2,'Washcloths':2,'Deodorant':1,'Lip Balm':2,'Purell Hand Sanitizing Bottles':1,'Tampax Regular':2,'Drawstring Backpack':1}}
};

// ── Default Inventory ─────────────────────────────────────────
const DEFAULT_INVENTORY = [
    {id:1,  name:'Needles/Syringes',                       category:'harm-reduction', starting:50000,unit:'units',   location:'Locked Cabinet A'},
    {id:2,  name:'Tourniquet',                             category:'harm-reduction', starting:250,  unit:'each',    location:'Locked Cabinet A'},
    {id:3,  name:'Brass Screens',                          category:'harm-reduction', starting:1000, unit:'each',    location:'Locked Cabinet A'},
    {id:4,  name:'7" inch Wood Stirrers',                  category:'harm-reduction', starting:1000, unit:'each',    location:'Locked Cabinet A'},
    {id:5,  name:'One Use Filter Pack',                    category:'harm-reduction', starting:4500, unit:'pack',    location:'Locked Cabinet A'},
    {id:6,  name:'Richmond Cotton Pellets',                category:'harm-reduction', starting:13,   unit:'box',     location:'Locked Cabinet A'},
    {id:7,  name:'Airlife Sterile Water 5ml',              category:'harm-reduction', starting:1200, unit:'vial',    location:'Locked Cabinet A'},
    {id:8,  name:'2x2 Zip Bags Resealable',                category:'harm-reduction', starting:1000, unit:'each',    location:'Supply Room'},
    {id:9,  name:'2 MIL Thickness Zip Closure Bags',       category:'harm-reduction', starting:1000, unit:'each',    location:'Supply Room'},
    {id:10, name:'Brown Bags',                             category:'harm-reduction', starting:1000, unit:'each',    location:'Supply Room'},
    {id:11, name:'4mg Naloxone Nasal Spray',               category:'overdose',       starting:100,  unit:'dose',    location:'Locked Med Cabinet'},
    {id:12, name:'Nasal Med Trainer',                      category:'overdose',       starting:20,   unit:'each',    location:'Storage Shelf B'},
    {id:13, name:'Fentanyl Test Strip',                    category:'overdose',       starting:200,  unit:'strip',   location:'Locked Cabinet A'},
    {id:14, name:'Xylazine Test Strip',                    category:'overdose',       starting:300,  unit:'strip',   location:'Locked Cabinet A'},
    {id:15, name:'Benzo Test Strips',                      category:'overdose',       starting:100,  unit:'strip',   location:'Locked Cabinet A'},
    {id:16, name:'CPR Face Shields',                       category:'overdose',       starting:10,   unit:'each',    location:'First Aid Station'},
    {id:17, name:'Lifestyle Normal Condoms',               category:'safe-sex',       starting:700,  unit:'each',    location:'Locked Cabinet C'},
    {id:18, name:'Lifestyle Large Condoms',                category:'safe-sex',       starting:700,  unit:'each',    location:'Locked Cabinet C'},
    {id:19, name:'Dental Dam',                             category:'safe-sex',       starting:100,  unit:'each',    location:'Locked Cabinet C'},
    {id:20, name:'Personal Lubricant',                     category:'safe-sex',       starting:1008, unit:'packet',  location:'Locked Cabinet C'},
    {id:21, name:'HIV Test Kit',                           category:'testing',        starting:100,  unit:'kit',     location:'Locked Med Cabinet'},
    {id:22, name:'First Aid Sheer Band Aids',              category:'wound-care',     starting:1200, unit:'bandage', location:'First Aid Station'},
    {id:23, name:'Knuckle Adhesive Bandages',              category:'wound-care',     starting:100,  unit:'bandage', location:'First Aid Station'},
    {id:24, name:'Blue Medical Tape Rolls',                category:'wound-care',     starting:30,   unit:'roll',    location:'First Aid Station'},
    {id:25, name:'Micropore Tape',                         category:'wound-care',     starting:100,  unit:'roll',    location:'First Aid Station'},
    {id:26, name:'Benzalkonium Chloride Towelettes',       category:'wound-care',     starting:1000, unit:'towelette',location:'First Aid Station'},
    {id:27, name:'Manicure Sticks',                        category:'wound-care',     starting:288,  unit:'each',    location:'First Aid Station'},
    {id:28, name:'Finger Cots',                            category:'wound-care',     starting:144,  unit:'each',    location:'First Aid Station'},
    {id:29, name:'Hand Sanitizing Purell Wipes',           category:'hygiene',        starting:100,  unit:'wipe',    location:'Multiple Locations'},
    {id:30, name:'Purell Hand Sanitizing Bottles',         category:'hygiene',        starting:48,   unit:'bottle',  location:'Multiple Locations'},
    {id:31, name:'Lip Ointments',                          category:'hygiene',        starting:1728, unit:'each',    location:'Supply Closet'},
    {id:32, name:'Lip Balm',                               category:'hygiene',        starting:288,  unit:'each',    location:'Supply Closet'},
    {id:33, name:'Dawnmist Shampoo and Conditioner Packets',category:'hygiene',       starting:100,  unit:'packet',  location:'Supply Closet'},
    {id:34, name:'Washcloths',                             category:'hygiene',        starting:1152, unit:'each',    location:'Supply Closet'},
    {id:35, name:'Fingernail Clippers',                    category:'hygiene',        starting:18,   unit:'each',    location:'Supply Closet'},
    {id:36, name:'Deodorant',                              category:'hygiene',        starting:96,   unit:'each',    location:'Supply Closet'},
    {id:37, name:'Toothbrush',                             category:'hygiene',        starting:144,  unit:'each',    location:'Supply Closet'},
    {id:38, name:'Gel Fluoride Toothpaste',                category:'hygiene',        starting:144,  unit:'tube',    location:'Supply Closet'},
    {id:39, name:'Shampoo and Hand Wash Packets',          category:'hygiene',        starting:300,  unit:'packet',  location:'Supply Closet'},
    {id:40, name:'Tampax Regular',                         category:'feminine',       starting:80,   unit:'each',    location:'Supply Closet'},
    {id:41, name:'Tampons',                                category:'feminine',       starting:80,   unit:'each',    location:'Supply Closet'},
    {id:42, name:'Kotex Regular Maxi Pads',                category:'feminine',       starting:120,  unit:'each',    location:'Supply Closet'},
    {id:43, name:'Needle Disposal Box',                    category:'disposal',       starting:200,  unit:'each',    location:'Multiple Locations'},
    {id:44, name:'Drawstring Backpack',                    category:'disposal',       starting:50,   unit:'each',    location:'Storage Area'}
];

// ── Database ──────────────────────────────────────────────────
const DB = {
    participants: [],
    encounters: [],
    testing: [],
    referrals: [],
    kitDistributions: [],
    inventory: DEFAULT_INVENTORY.map(i => ({ ...i, current: i.starting, min: Math.ceil(i.starting * 0.2), photo: null, custom: false })),
    kits: JSON.parse(JSON.stringify(KITS))
};

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
    updateDashboard();
    displayCurrentDate();
    const now = new Date();
    const dt = now.toISOString().slice(0,16);
    const enc = document.getElementById('encounterDateTime');
    if (enc) enc.value = dt;
    document.getElementById('criticalThreshold').value = THRESHOLDS.critical;
    document.getElementById('lowThreshold').value = THRESHOLDS.low;
    document.getElementById('reorderThreshold').value = THRESHOLDS.reorder;
});

function displayCurrentDate() {
    const el = document.getElementById('currentDate');
    if (el) el.textContent = new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
}

// ── Security ──────────────────────────────────────────────────
document.getElementById('loginForm').addEventListener('submit', e => {
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
function lockApp() { isLocked = true; document.getElementById('loginScreen').classList.remove('hidden'); clearTimeout(autoLockTimeout); }
function resetAutoLock() { clearTimeout(autoLockTimeout); autoLockTimeout = setTimeout(lockApp, 5*60*1000); }
document.addEventListener('click', resetAutoLock);
document.addEventListener('touchstart', resetAutoLock);

// ── Data ──────────────────────────────────────────────────────
function saveData() {
    localStorage.setItem('chrData', JSON.stringify(DB));
    localStorage.setItem('lastSync', new Date().toISOString());
}
function loadData() {
    const saved = localStorage.getItem('chrData');
    if (saved) {
        const d = JSON.parse(saved);
        DB.participants     = d.participants     || [];
        DB.encounters       = d.encounters       || [];
        DB.testing          = d.testing          || [];
        DB.referrals        = d.referrals        || [];
        DB.kitDistributions = d.kitDistributions || [];
        DB.inventory        = d.inventory        || DB.inventory;
        DB.kits             = d.kits             || DB.kits;
    }
    const ls = localStorage.getItem('lastSync');
    const lsEl = document.getElementById('lastSync');
    if (ls && lsEl) lsEl.textContent = new Date(ls).toLocaleString();
}

// ── Navigation ────────────────────────────────────────────────
function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    if (viewId === 'dashboard')         { updateDashboard(); }
    if (viewId === 'inventory')         { displayInventory(); }
    if (viewId === 'kits')              { updateKitStatusDisplay(); populateDD('kitParticipant'); }
    if (viewId === 'encounter')         { populateDD('encounterParticipant'); buildInventoryPicker('encounterInventoryList', 'enc'); }
    if (viewId === 'testing')           { populateDD('testParticipant'); displayTestingSummary(); }
    if (viewId === 'referrals')         { populateDD('referralParticipant'); displayReferralSummary(); }
    if (viewId === 'rfidManage')        { populateDD('rfidParticipantSelect'); displayRFIDStats(); setupRFIDForm(); }
    if (viewId === 'settings')          { updateSettingsDisplay(); }
    if (viewId === 'enrollment')        { buildInventoryPicker('enrollmentInventoryList', 'enr'); }
    if (viewId === 'addInventoryItem')  { showRecentCustomItems(); }
    if (viewId === 'participantHub')    { initParticipantHub(); }
}

// ── Dashboard ─────────────────────────────────────────────────
function updateDashboard() {
    document.getElementById('totalParticipants').textContent = DB.participants.length;
    const today = new Date().toDateString();
    document.getElementById('todayEncounters').textContent = DB.encounters.filter(e => new Date(e.dateTime).toDateString() === today).length;
    document.getElementById('needlesOut').textContent = DB.encounters.reduce((s,e) => s+(e.needlesOut||0),0).toLocaleString();
    document.getElementById('needlesIn').textContent  = DB.encounters.reduce((s,e) => s+(e.needlesIn||0),0).toLocaleString();
    displayAlerts();
}
function displayAlerts() {
    const alerts = generateAlerts();
    const sec = document.getElementById('alertsSection');
    if (!alerts.length) { sec.innerHTML = '<div class="alert alert-success"><strong>✅ All Inventory OK</strong></div>'; return; }
    let html = `<div class="alert alert-warning"><strong>⚠️ INVENTORY ALERTS (${alerts.length})</strong></div>`;
    alerts.slice(0,3).forEach(a => {
        const icon = a.level==='critical'?'🔴':a.level==='low'?'🟡':'🟠';
        html += `<div class="alert alert-${a.level}">${icon} <strong>${a.item}</strong>: ${a.current}/${a.starting} (${a.percent}%) — ${a.message}</div>`;
    });
    if (alerts.length>3) html += `<div class="alert alert-info">…and ${alerts.length-3} more. <a href="#" onclick="showView('inventory');return false;">View All</a></div>`;
    sec.innerHTML = html;
}
function generateAlerts() {
    const alerts = [];
    DB.inventory.forEach(item => {
        const pct = Math.round((item.current/item.starting)*100);
        if (pct < THRESHOLDS.critical) alerts.push({level:'critical',item:item.name,current:item.current,starting:item.starting,percent:pct,message:'ORDER NOW'});
        else if (pct < THRESHOLDS.low) alerts.push({level:'low',item:item.name,current:item.current,starting:item.starting,percent:pct,message:'LOW STOCK'});
        else if (pct < THRESHOLDS.reorder) alerts.push({level:'reorder',item:item.name,current:item.current,starting:item.starting,percent:pct,message:'REORDER SOON'});
    });
    Object.keys(DB.kits).forEach(k => {
        const kit = DB.kits[k];
        const pct = Math.round((kit.current/kit.starting)*100);
        if (pct < THRESHOLDS.low) alerts.push({level:'low',item:`${k} (${kit.name})`,current:kit.current,starting:kit.starting,percent:pct,message:'ASSEMBLE MORE KITS'});
    });
    return alerts.sort((a,b) => ({critical:0,low:1,reorder:2}[a.level]-{critical:0,low:1,reorder:2}[b.level]));
}

// ── Helpers ───────────────────────────────────────────────────
function populateDD(id) {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = '<option value="">Select Participant...</option>';
    DB.participants.forEach(p => {
        const o = document.createElement('option');
        o.value = p.id;
        o.textContent = `${p.firstName} ${p.lastName} (${p.id})`;
        sel.appendChild(o);
    });
}
function generateRandomParticipantID() {
    let id, unique = false;
    while (!unique) {
        id = 'CHR-' + (Math.floor(Math.random()*90000000)+10000000);
        unique = !DB.participants.some(p => p.id === id);
    }
    return id;
}
function updateInventoryItem(name, delta) {
    const item = DB.inventory.find(i => i.name === name);
    if (item) item.current = Math.max(0, item.current + delta);
}
function categoryLabel(cat) {
    const map = {'harm-reduction':'Harm Reduction','overdose':'Overdose Prevention','safe-sex':'Safe Sex','testing':'Testing','wound-care':'Wound Care','hygiene':'Hygiene','feminine':'Feminine Hygiene','disposal':'Disposal & Safety','custom':'Custom'};
    return map[cat] || cat;
}

// ── Inventory Picker (shared for enrollment + encounter) ──────
function buildInventoryPicker(containerId, prefix) {
    const container = document.getElementById(containerId);
    if (!container) return;
    let html = '';
    DB.inventory.forEach(item => {
        const pct = Math.round((item.current/item.starting)*100);
        const statusDot = pct < THRESHOLDS.critical ? '🔴' : pct < THRESHOLDS.low ? '🟡' : pct < THRESHOLDS.reorder ? '🟠' : '🟢';
        const photoHTML = item.photo
            ? `<img src="${item.photo}" class="picker-item-photo" alt="${item.name}">`
            : `<div class="picker-item-emoji">${categoryEmoji(item.category)}</div>`;
        html += `
        <div class="picker-item" id="${prefix}-item-${item.id}" data-name="${item.name}" data-category="${item.category}">
            <div class="picker-item-left">
                ${photoHTML}
                <div class="picker-item-info">
                    <strong>${item.name}</strong>
                    <small>${categoryLabel(item.category)} · ${item.current} ${item.unit} available ${statusDot}</small>
                </div>
            </div>
            <div class="picker-item-right">
                <input type="number" class="picker-qty" id="${prefix}-qty-${item.id}"
                    min="0" max="${item.current}" value="0"
                    onchange="updatePickerSummary('${prefix}')">
            </div>
        </div>`;
    });
    container.innerHTML = html;
}

function filterEnrollmentInventory() {
    const search = document.getElementById('enrollmentInventorySearch').value.toLowerCase();
    const cat = document.getElementById('enrollmentInventoryCategory').value;
    document.querySelectorAll('#enrollmentInventoryList .picker-item').forEach(el => {
        const name = el.dataset.name.toLowerCase();
        const c = el.dataset.category;
        el.style.display = ((!search || name.includes(search)) && (cat === 'all' || c === cat)) ? '' : 'none';
    });
}
function filterEncounterInventory() {
    const search = document.getElementById('encounterInventorySearch').value.toLowerCase();
    document.querySelectorAll('#encounterInventoryList .picker-item').forEach(el => {
        el.style.display = (!search || el.dataset.name.toLowerCase().includes(search)) ? '' : 'none';
    });
}
function updatePickerSummary(prefix) {
    if (prefix !== 'enr') return;
    const selected = getPickerSelections(prefix);
    const summary = document.getElementById('enrollmentInventorySummary');
    const items = document.getElementById('enrollmentSummaryItems');
    if (!summary || !items) return;
    if (!selected.length) { summary.style.display = 'none'; return; }
    summary.style.display = 'block';
    items.innerHTML = selected.map(s => `<span class="summary-tag">${s.name} × ${s.qty}</span>`).join('');
}
function getPickerSelections(prefix) {
    const results = [];
    document.querySelectorAll(`[id^="${prefix}-qty-"]`).forEach(input => {
        const qty = parseInt(input.value) || 0;
        if (qty > 0) {
            const id = input.id.replace(`${prefix}-qty-`, '');
            const item = DB.inventory.find(i => i.id == id);
            if (item) results.push({ id: item.id, name: item.name, qty });
        }
    });
    return results;
}
function categoryEmoji(cat) {
    const map = {'harm-reduction':'💉','overdose':'🚨','safe-sex':'❤️','testing':'🧪','wound-care':'🩹','hygiene':'🧴','feminine':'🌸','disposal':'🗑️','custom':'📦'};
    return map[cat] || '📦';
}

// ── Enrollment ────────────────────────────────────────────────
function setupEventListeners() {
    document.getElementById('enrollmentForm').addEventListener('submit', handleEnrollment);
    document.getElementById('encounterForm').addEventListener('submit', handleEncounter);
    document.getElementById('kitDistributionForm').addEventListener('submit', handleKitDistribution);
    document.getElementById('testingForm').addEventListener('submit', handleTesting);
    document.getElementById('referralForm').addEventListener('submit', handleReferral);
    document.getElementById('addInventoryForm').addEventListener('submit', handleAddInventoryItem);
    document.getElementById('inventoryCategory').addEventListener('change', displayInventory);
    document.getElementById('inventoryFilter').addEventListener('change', displayInventory);
    document.getElementById('inventorySearch').addEventListener('input', displayInventory);
}

function handleEnrollment(e) {
    e.preventDefault();
    const services = [];
    document.querySelectorAll('#enrollmentForm .checkbox-group input:checked').forEach(cb => services.push(cb.value));
    const itemsGiven = getPickerSelections('enr');
    const participantID = generateRandomParticipantID();
    const participant = {
        id: participantID,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        dob: document.getElementById('dob').value,
        phone: document.getElementById('phone').value,
        servicesInterested: services,
        agreementSigned: document.getElementById('agreementSigned').checked,
        enrollmentDate: new Date().toISOString(),
        status: 'Active',
        rfidAssigned: false,
        rfidSerialNumber: null,
        enrollmentItems: itemsGiven
    };
    DB.participants.push(participant);
    // Deduct inventory
    itemsGiven.forEach(sel => updateInventoryItem(sel.name, -sel.qty));
    saveData();
    let msg = `✅ Participant enrolled!\n\nID: ${participant.id}`;
    if (itemsGiven.length) msg += `\n\n📦 ${itemsGiven.length} item type(s) deducted from inventory.`;
    alert(msg);
    if ('NDEFReader' in window && confirm('Program an RFID keychain for this participant now?')) {
        writeParticipantIDToNFC(participantID);
    }
    document.getElementById('enrollmentForm').reset();
    document.querySelectorAll('#enrollmentInventoryList .picker-qty').forEach(i => i.value = 0);
    document.getElementById('enrollmentInventorySummary').style.display = 'none';
    showView('dashboard');
}

// ── Encounter ─────────────────────────────────────────────────
function handleEncounter(e) {
    e.preventDefault();
    const services = [];
    document.querySelectorAll('.service-check:checked').forEach(cb => services.push(cb.value));
    const needlesOut   = parseInt(document.getElementById('encNeedlesOut').value) || 0;
    const needlesIn    = parseInt(document.getElementById('encNeedlesIn').value)  || 0;
    const naloxoneGiven = parseInt(document.getElementById('encNaloxone').value)  || 0;
    const condomsGiven  = parseInt(document.getElementById('encCondoms').value)   || 0;
    const additionalItems = getPickerSelections('enc');
    const encounter = {
        id: 'ENC-' + Date.now(),
        participantID: document.getElementById('encounterParticipant').value,
        dateTime: document.getElementById('encounterDateTime').value,
        services,
        needlesOut,
        needlesIn,
        naloxoneGiven,
        condomsGiven,
        additionalItems,
        notes: document.getElementById('encounterNotes').value,
        staffInitials: document.getElementById('staffInitials').value
    };
    DB.encounters.push(encounter);
    updateInventoryItem('Needles/Syringes', -needlesOut);
    updateInventoryItem('4mg Naloxone Nasal Spray', -naloxoneGiven);
    updateInventoryItem('Lifestyle Normal Condoms', -condomsGiven);
    additionalItems.forEach(sel => updateInventoryItem(sel.name, -sel.qty));
    saveData();
    alert('✅ Encounter logged successfully!');
    document.getElementById('encounterForm').reset();
    document.querySelectorAll('#encounterInventoryList .picker-qty').forEach(i => i.value = 0);
    showView('dashboard');
}

// ── Kit Distribution ──────────────────────────────────────────
function handleKitDistribution(e) {
    e.preventDefault();
    const kitType = document.getElementById('kitType').value;
    const qty = parseInt(document.getElementById('kitQuantity').value);
    if (DB.kits[kitType].current < qty) { alert(`❌ Not enough ${kitType} kits available!`); return; }
    const dist = {
        id: 'KIT-' + Date.now(),
        participantID: document.getElementById('kitParticipant').value,
        kitType, kitName: DB.kits[kitType].name, quantity: qty,
        dateTime: new Date().toISOString(),
        notes: document.getElementById('kitNotes').value,
        staffInitials: document.getElementById('kitStaffInitials').value
    };
    DB.kitDistributions.push(dist);
    DB.kits[kitType].current -= qty;
    Object.keys(KITS[kitType].items).forEach(itemName => updateInventoryItem(itemName, -(KITS[kitType].items[itemName]*qty)));
    saveData();
    alert(`✅ ${qty} × ${kitType} distributed!`);
    document.getElementById('kitDistributionForm').reset();
    updateKitStatusDisplay();
}
function updateKitStatusDisplay() {
    const el = document.getElementById('kitStatusDisplay');
    let html = '';
    Object.keys(DB.kits).forEach(k => {
        const kit = DB.kits[k];
        const pct = Math.round((kit.current/kit.starting)*100);
        const cls = pct<THRESHOLDS.critical?'critical':pct<THRESHOLDS.low?'low':pct<THRESHOLDS.reorder?'reorder':'ok';
        const icon = pct<THRESHOLDS.critical?'🔴':pct<THRESHOLDS.low?'🟡':pct<THRESHOLDS.reorder?'🟠':'🟢';
        html += `<div class="kit-status-item ${cls}"><div class="kit-header"><strong>${k} — ${kit.name}</strong><span>${icon} ${kit.current}/${kit.starting}</span></div><div class="progress-bar"><div class="progress-fill ${cls}" style="width:${Math.min(pct,100)}%"></div></div></div>`;
    });
    el.innerHTML = html;
}

// ── Add Custom Inventory Item ─────────────────────────────────
function previewItemPhoto(event, source) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        newItemPhotoData = e.target.result;
        document.getElementById('newItemPhotoImg').src = newItemPhotoData;
        document.getElementById('newItemPhotoImg').style.display = 'block';
        document.getElementById('newItemPhotoPlaceholder').style.display = 'none';
        document.getElementById('clearPhotoBtn').style.display = 'inline-block';
    };
    reader.readAsDataURL(file);
}
function clearItemPhoto() {
    newItemPhotoData = null;
    document.getElementById('newItemPhotoImg').style.display = 'none';
    document.getElementById('newItemPhotoPlaceholder').style.display = 'block';
    document.getElementById('clearPhotoBtn').style.display = 'none';
    document.getElementById('newItemPhotoCapture').value = '';
    document.getElementById('newItemPhotoLibrary').value = '';
}
function handleAddInventoryItem(e) {
    e.preventDefault();
    const name     = document.getElementById('newItemName').value.trim();
    const category = document.getElementById('newItemCategory').value;
    const starting = parseInt(document.getElementById('newItemStarting').value);
    const unit     = document.getElementById('newItemUnit').value.trim();
    const minRaw   = document.getElementById('newItemMin').value;
    const min      = minRaw ? parseInt(minRaw) : Math.ceil(starting * 0.2);
    const location = document.getElementById('newItemLocation').value.trim() || 'Storage';
    // Check for duplicate name
    if (DB.inventory.find(i => i.name.toLowerCase() === name.toLowerCase())) {
        alert(`⚠️ An item named "${name}" already exists in inventory. Please use a different name.`);
        return;
    }
    const newId = Math.max(...DB.inventory.map(i => i.id), 100) + 1;
    const newItem = { id: newId, name, category, starting, current: starting, min, unit, location, photo: newItemPhotoData, custom: true };
    DB.inventory.push(newItem);
    saveData();
    alert(`✅ "${name}" added to inventory!\n\nStarting quantity: ${starting} ${unit}\nCategory: ${categoryLabel(category)}`);
    document.getElementById('addInventoryForm').reset();
    clearItemPhoto();
    showRecentCustomItems();
}
function showRecentCustomItems() {
    const el = document.getElementById('recentCustomItems');
    const customs = DB.inventory.filter(i => i.custom).slice(-5).reverse();
    if (!customs.length) { el.innerHTML = '<p style="color:#7f8c8d; padding:10px;">No custom items added yet.</p>'; return; }
    el.innerHTML = customs.map(item => {
        const photoHTML = item.photo
            ? `<img src="${item.photo}" class="custom-item-thumb" alt="${item.name}">`
            : `<div class="custom-item-emoji">${categoryEmoji(item.category)}</div>`;
        return `<div class="custom-item-row">${photoHTML}<div class="custom-item-info"><strong>${item.name}</strong><small>${categoryLabel(item.category)} · ${item.current}/${item.starting} ${item.unit}</small></div></div>`;
    }).join('');
}

// ── Inventory Display ─────────────────────────────────────────
function displayInventory() {
    const cat    = document.getElementById('inventoryCategory').value;
    const filter = document.getElementById('inventoryFilter').value;
    const search = document.getElementById('inventorySearch').value.toLowerCase();
    let items = DB.inventory;
    if (cat !== 'all')    items = items.filter(i => i.category === cat);
    if (search)           items = items.filter(i => i.name.toLowerCase().includes(search));
    if (filter !== 'all') items = items.filter(i => {
        const pct = (i.current/i.starting)*100;
        if (filter==='critical') return pct < THRESHOLDS.critical;
        if (filter==='low')      return pct < THRESHOLDS.low;
        if (filter==='alerts')   return pct < THRESHOLDS.reorder;
        return true;
    });
    const el = document.getElementById('inventoryList');
    if (!items.length) { el.innerHTML = '<p class="no-results">No items found.</p>'; return; }
    el.innerHTML = items.map(item => {
        const pct = Math.round((item.current/item.starting)*100);
        const cls = pct<THRESHOLDS.critical?'critical':pct<THRESHOLDS.low?'low':pct<THRESHOLDS.reorder?'reorder':'ok';
        const statusText = pct<THRESHOLDS.critical?'CRITICAL — ORDER NOW':pct<THRESHOLDS.low?'LOW STOCK':pct<THRESHOLDS.reorder?'REORDER SOON':'OK';
        const photoHTML = item.photo
            ? `<img src="${item.photo}" class="inv-item-photo" alt="${item.name}">`
            : `<div class="inv-item-emoji">${categoryEmoji(item.category)}</div>`;
        return `<div class="inventory-item ${cls}">
            <div class="item-header">
                <div class="item-header-left">${photoHTML}<div><strong>${item.name}</strong><small>${item.location}${item.custom?' · Custom item':''}</small></div></div>
                <div class="item-status">${item.current} / ${item.starting} ${item.unit}<br><small>${pct}% remaining</small></div>
            </div>
            <div class="progress-bar"><div class="progress-fill ${cls}" style="width:${Math.min(pct,100)}%"></div></div>
            <div class="item-footer"><span class="status-badge ${cls}">${statusText}</span><span class="min-threshold">Min: ${item.min} ${item.unit}</span></div>
        </div>`;
    }).join('');
}

// ── Testing ───────────────────────────────────────────────────
function handleTesting(e) {
    e.preventDefault();
    const rec = {
        id: 'TEST-' + Date.now(),
        participantID: document.getElementById('testParticipant').value,
        testType: document.getElementById('testType').value,
        testDate: document.getElementById('testDate').value,
        result: document.getElementById('testResult').value,
        treatmentStarted: document.getElementById('treatmentStarted').value,
        notes: document.getElementById('testNotes').value
    };
    DB.testing.push(rec);
    if (rec.testType === 'HIV') updateInventoryItem('HIV Test Kit', -1);
    saveData();
    alert('✅ Test record saved!');
    document.getElementById('testingForm').reset();
    displayTestingSummary();
}
function displayTestingSummary() {
    const el = document.getElementById('testingSummary');
    const counts = {};
    DB.testing.forEach(t => {
        if (!counts[t.testType]) counts[t.testType] = {total:0,positive:0,negative:0,pending:0};
        counts[t.testType].total++;
        if (t.result==='Positive')  counts[t.testType].positive++;
        if (t.result==='Negative')  counts[t.testType].negative++;
        if (t.result==='Pending')   counts[t.testType].pending++;
    });
    if (!Object.keys(counts).length) { el.innerHTML = '<p style="color:#7f8c8d;padding:10px;">No tests recorded yet.</p>'; return; }
    let html = '<table class="summary-table"><tr><th>Test</th><th>Total</th><th>Positive</th><th>Negative</th><th>Pending</th></tr>';
    Object.keys(counts).forEach(type => {
        const c = counts[type];
        html += `<tr><td><strong>${type}</strong></td><td>${c.total}</td><td>${c.positive}</td><td>${c.negative}</td><td>${c.pending}</td></tr>`;
    });
    el.innerHTML = html + '</table>';
}

// ── Referrals ─────────────────────────────────────────────────
function handleReferral(e) {
    e.preventDefault();
    const ref = {
        id: 'REF-' + Date.now(),
        participantID: document.getElementById('referralParticipant').value,
        referralTo: document.getElementById('referralTo').value,
        serviceType: document.getElementById('referralService').value,
        referralDate: document.getElementById('referralDate').value,
        linkedSuccessfully: document.getElementById('linkedSuccessfully').value,
        notes: document.getElementById('referralNotes').value
    };
    DB.referrals.push(ref);
    saveData();
    alert('✅ Referral saved!');
    document.getElementById('referralForm').reset();
    displayReferralSummary();
}
function displayReferralSummary() {
    const el = document.getElementById('referralSummary');
    const total = DB.referrals.length;
    const linked = DB.referrals.filter(r => r.linkedSuccessfully === 'Yes').length;
    const rate = total ? Math.round((linked/total)*100) : 0;
    let html = `<div class="summary-card"><h4>Overall Linkage Rate</h4><p class="stat-large">${rate}%</p><small>${linked} of ${total} linked</small></div>`;
    html += '<table class="summary-table"><tr><th>Organization</th><th>Total</th><th>Linked</th><th>Rate</th></tr>';
    ['Brightview','Horizon Behavioral Health','Savidia','Other'].forEach(org => {
        const orgRefs = DB.referrals.filter(r => r.referralTo === org);
        if (!orgRefs.length) return;
        const orgLinked = orgRefs.filter(r => r.linkedSuccessfully==='Yes').length;
        html += `<tr><td><strong>${org}</strong></td><td>${orgRefs.length}</td><td>${orgLinked}</td><td>${orgRefs.length?Math.round((orgLinked/orgRefs.length)*100):0}%</td></tr>`;
    });
    el.innerHTML = html + '</table>';
}

// ══════════════════════════════════════════════════════════════
// PARTICIPANT HUB
// ══════════════════════════════════════════════════════════════

function initParticipantHub() {
    document.getElementById('participantProfile').style.display = 'none';
    document.getElementById('hubSearchResults').innerHTML = '';
    document.getElementById('hubSearch').value = '';
    // Show all participants as cards initially
    renderParticipantCards(DB.participants);
}

function searchParticipantsHub() {
    const q = document.getElementById('hubSearch').value.toLowerCase().trim();
    if (!q) { renderParticipantCards(DB.participants); return; }
    const filtered = DB.participants.filter(p =>
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
    );
    renderParticipantCards(filtered);
}

function renderParticipantCards(participants) {
    const el = document.getElementById('hubSearchResults');
    if (!participants.length) {
        el.innerHTML = '<p class="no-results">No participants found.</p>';
        return;
    }
    el.innerHTML = participants.map(p => {
        const encounterCount = DB.encounters.filter(e => e.participantID === p.id).length;
        const lastEnc = DB.encounters.filter(e => e.participantID === p.id).sort((a,b) => new Date(b.dateTime)-new Date(a.dateTime))[0];
        const lastVisit = lastEnc ? new Date(lastEnc.dateTime).toLocaleDateString() : 'No visits yet';
        const rfidBadge = p.rfidAssigned ? '<span class="rfid-badge-small">🔑 RFID</span>' : '';
        return `<div class="participant-card" onclick="openParticipantProfile('${p.id}')">
            <div class="participant-card-avatar">👤</div>
            <div class="participant-card-info">
                <strong>${p.firstName} ${p.lastName}</strong>
                <small>${p.id} ${rfidBadge}</small>
                <small>Last visit: ${lastVisit} · ${encounterCount} encounter${encounterCount!==1?'s':''}</small>
            </div>
            <div class="participant-card-arrow">›</div>
        </div>`;
    }).join('');
}

function openParticipantProfile(participantId) {
    const p = DB.participants.find(pt => pt.id === participantId);
    if (!p) return;
    document.getElementById('hubSearchResults').style.display = 'none';
    document.getElementById('hubSearch').parentElement.style.display = 'none';
    document.getElementById('hubScanBanner').style.display = 'none';

    document.getElementById('profileName').textContent = `${p.firstName} ${p.lastName}`;
    document.getElementById('profileID').textContent = p.id;
    document.getElementById('profileRFID').textContent = p.rfidAssigned ? '🔑 RFID Keychain Assigned' : '⚠️ No RFID Keychain';
    document.getElementById('profileRFID').className = p.rfidAssigned ? 'rfid-badge assigned' : 'rfid-badge unassigned';

    // Quick stats
    const encounters = DB.encounters.filter(e => e.participantID === p.id);
    const tests = DB.testing.filter(t => t.participantID === p.id);
    const refs = DB.referrals.filter(r => r.participantID === p.id);
    const kits = DB.kitDistributions.filter(k => k.participantID === p.id);
    const totalNeedles = encounters.reduce((s,e) => s+(e.needlesOut||0), 0) + (p.enrollmentItems||[]).reduce((s,i) => i.name==='Needles/Syringes'?s+i.qty:s, 0);
    document.getElementById('profileQuickStats').innerHTML = `
        <div class="quick-stat"><span class="qs-num">${encounters.length}</span><span class="qs-label">Encounters</span></div>
        <div class="quick-stat"><span class="qs-num">${tests.length}</span><span class="qs-label">Tests</span></div>
        <div class="quick-stat"><span class="qs-num">${refs.length}</span><span class="qs-label">Referrals</span></div>
        <div class="quick-stat"><span class="qs-num">${kits.length}</span><span class="qs-label">Kits</span></div>
        <div class="quick-stat"><span class="qs-num">${totalNeedles.toLocaleString()}</span><span class="qs-label">Needles Given</span></div>
    `;

    // Timeline tab
    buildTimeline(p);
    // Enrollment tab
    buildEnrollmentDetail(p);
    // Inventory tab
    buildInventoryHistory(p);

    document.getElementById('participantProfile').style.display = 'block';
    // Reset to timeline tab
    switchTab('timeline');
    document.getElementById('participantProfile').scrollIntoView({behavior:'smooth'});
}

function closeProfile() {
    document.getElementById('participantProfile').style.display = 'none';
    document.getElementById('hubSearchResults').style.display = 'block';
    document.getElementById('hubSearch').parentElement.style.display = 'block';
    document.getElementById('hubScanBanner').style.display = 'block';
    renderParticipantCards(DB.participants);
}

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector(`.tab-btn[onclick="switchTab('${tab}')"]`).classList.add('active');
    document.getElementById(`tab${tab.charAt(0).toUpperCase()+tab.slice(1)}`).classList.add('active');
}

function buildTimeline(p) {
    const events = [];

    // Enrollment event
    events.push({
        type: 'enrollment',
        icon: '🌟',
        color: '#667eea',
        title: 'Enrolled in Program',
        date: new Date(p.enrollmentDate),
        detail: `Services of interest: ${(p.servicesInterested||[]).join(', ') || 'None selected'}${(p.enrollmentItems||[]).length ? `<br>Items received: ${p.enrollmentItems.map(i=>`${i.name} ×${i.qty}`).join(', ')}` : ''}`
    });

    // Encounters
    DB.encounters.filter(e => e.participantID === p.id).forEach(e => {
        const items = [
            e.needlesOut ? `Needles ×${e.needlesOut}` : null,
            e.naloxoneGiven ? `Naloxone ×${e.naloxoneGiven}` : null,
            e.condomsGiven ? `Condoms ×${e.condomsGiven}` : null,
            ...(e.additionalItems||[]).map(ai => `${ai.name} ×${ai.qty}`)
        ].filter(Boolean);
        events.push({
            type: 'encounter',
            icon: '📋',
            color: '#27ae60',
            title: 'Encounter',
            date: new Date(e.dateTime),
            detail: `Services: ${(e.services||[]).join(', ')||'None'}${items.length?`<br>Items: ${items.join(', ')}`:''}<br>Needles returned: ${e.needlesIn||0}${e.notes?`<br>Notes: ${e.notes}`:''}<br>Staff: ${e.staffInitials}`
        });
    });

    // Tests
    DB.testing.filter(t => t.participantID === p.id).forEach(t => {
        events.push({
            type: 'test',
            icon: '🧪',
            color: '#e67e22',
            title: `${t.testType} Test`,
            date: new Date(t.testDate),
            detail: `Result: <strong>${t.result}</strong> · Treatment: ${t.treatmentStarted}${t.notes?`<br>Notes: ${t.notes}`:''}`
        });
    });

    // Referrals
    DB.referrals.filter(r => r.participantID === p.id).forEach(r => {
        events.push({
            type: 'referral',
            icon: '🔗',
            color: '#8e44ad',
            title: `Referral — ${r.referralTo}`,
            date: new Date(r.referralDate),
            detail: `Service: ${r.serviceType} · Linked: ${r.linkedSuccessfully}${r.notes?`<br>Notes: ${r.notes}`:''}`
        });
    });

    // Kit distributions
    DB.kitDistributions.filter(k => k.participantID === p.id).forEach(k => {
        events.push({
            type: 'kit',
            icon: '📦',
            color: '#2980b9',
            title: `${k.kitType} — ${k.kitName}`,
            date: new Date(k.dateTime),
            detail: `Quantity: ${k.quantity}${k.notes?`<br>Notes: ${k.notes}`:''}<br>Staff: ${k.staffInitials}`
        });
    });

    // Sort newest first
    events.sort((a,b) => b.date - a.date);

    const el = document.getElementById('profileTimeline');
    if (!events.length) { el.innerHTML = '<p class="no-results">No activity yet.</p>'; return; }
    el.innerHTML = events.map(ev => `
        <div class="timeline-event">
            <div class="timeline-dot" style="background:${ev.color}">${ev.icon}</div>
            <div class="timeline-body">
                <div class="timeline-header">
                    <strong>${ev.title}</strong>
                    <span class="timeline-date">${ev.date.toLocaleDateString()} ${ev.date.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
                </div>
                <div class="timeline-detail">${ev.detail}</div>
            </div>
        </div>
    `).join('');
}

function buildEnrollmentDetail(p) {
    const el = document.getElementById('profileEnrollmentDetail');
    const enrollDate = new Date(p.enrollmentDate);
    el.innerHTML = `
        <div class="enrollment-detail-card">
            <div class="ed-row"><span class="ed-label">Enrollment Date</span><span class="ed-value">${enrollDate.toLocaleDateString()} at ${enrollDate.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span></div>
            <div class="ed-row"><span class="ed-label">Participant ID</span><span class="ed-value mono">${p.id}</span></div>
            <div class="ed-row"><span class="ed-label">Date of Birth</span><span class="ed-value">${p.dob || '—'}</span></div>
            <div class="ed-row"><span class="ed-label">Phone</span><span class="ed-value">${p.phone || '—'}</span></div>
            <div class="ed-row"><span class="ed-label">Agreement Signed</span><span class="ed-value">${p.agreementSigned ? '✅ Yes' : '❌ No'}</span></div>
            <div class="ed-row"><span class="ed-label">Status</span><span class="ed-value">${p.status}</span></div>
            <div class="ed-row"><span class="ed-label">Services Interested</span><span class="ed-value">${(p.servicesInterested||[]).join(', ')||'None'}</span></div>
            <div class="ed-row"><span class="ed-label">RFID Keychain</span><span class="ed-value">${p.rfidAssigned ? '🔑 Assigned' : '⚠️ Not assigned'}</span></div>
            ${(p.enrollmentItems||[]).length ? `<div class="ed-row"><span class="ed-label">Items Given at Enrollment</span><span class="ed-value">${p.enrollmentItems.map(i=>`${i.name} ×${i.qty}`).join('<br>')}</span></div>` : ''}
        </div>
    `;
}

function buildInventoryHistory(p) {
    const el = document.getElementById('profileInventoryList');
    // Collect all items given across enrollment + encounters + kits
    const itemMap = {};
    const addItem = (name, qty, when, type) => {
        if (!itemMap[name]) itemMap[name] = {name, total:0, events:[]};
        itemMap[name].total += qty;
        itemMap[name].events.push({qty, when, type});
    };
    (p.enrollmentItems||[]).forEach(i => addItem(i.name, i.qty, new Date(p.enrollmentDate), 'Enrollment'));
    DB.encounters.filter(e => e.participantID === p.id).forEach(e => {
        if (e.needlesOut)    addItem('Needles/Syringes', e.needlesOut, new Date(e.dateTime), 'Encounter');
        if (e.naloxoneGiven) addItem('4mg Naloxone Nasal Spray', e.naloxoneGiven, new Date(e.dateTime), 'Encounter');
        if (e.condomsGiven)  addItem('Lifestyle Normal Condoms', e.condomsGiven, new Date(e.dateTime), 'Encounter');
        (e.additionalItems||[]).forEach(ai => addItem(ai.name, ai.qty, new Date(e.dateTime), 'Encounter'));
    });
    DB.kitDistributions.filter(k => k.participantID === p.id).forEach(k => {
        const kitItems = KITS[k.kitType] ? KITS[k.kitType].items : {};
        Object.keys(kitItems).forEach(name => addItem(name, kitItems[name]*k.quantity, new Date(k.dateTime), `Kit: ${k.kitType}`));
    });
    if (!Object.keys(itemMap).length) { el.innerHTML = '<p class="no-results">No items recorded.</p>'; return; }
    const items = Object.values(itemMap).sort((a,b) => b.total - a.total);
    el.innerHTML = `
        <div class="inv-history-summary">Total unique items: ${items.length}</div>
        ${items.map(item => `
            <div class="inv-history-item">
                <div class="inv-history-header">
                    <strong>${item.name}</strong>
                    <span class="inv-history-total">${item.total} total</span>
                </div>
                <div class="inv-history-events">
                    ${item.events.map(ev => `<span class="inv-event-chip">${ev.type} · ×${ev.qty} · ${ev.when.toLocaleDateString()}</span>`).join('')}
                </div>
            </div>
        `).join('')}
    `;
}

// ── NFC / RFID ────────────────────────────────────────────────
let ndefReader = null;
if ('NDEFReader' in window) ndefReader = new NDEFReader();

async function startNFCScan() {
    if (!ndefReader) { alert('⚠️ NFC is not supported on this device.\nPlease use iPad Pro 2018+, iPad Air 2019+, or iPad mini 2019+.'); return; }
    try {
        await ndefReader.scan();
        alert('🔍 NFC Ready — Hold the participant\'s keychain near the top of the iPad.');
        ndefReader.onreading = event => {
            for (const record of event.message.records) {
                if (record.recordType === 'text') {
                    const id = new TextDecoder(record.encoding).decode(record.data);
                    const p = DB.participants.find(pt => pt.id === id);
                    if (p) {
                        showView('participantHub');
                        setTimeout(() => openParticipantProfile(id), 200);
                    } else {
                        alert(`❌ ID not found: ${id}`);
                    }
                    break;
                }
            }
        };
    } catch(err) { alert(`❌ NFC Error: ${err.message}`); }
}

async function startHubNFCScan() {
    if (!ndefReader) { alert('⚠️ NFC not supported on this device.'); return; }
    try {
        await ndefReader.scan();
        alert('🔍 NFC Ready — Hold keychain near the top of the iPad.');
        ndefReader.onreading = event => {
            for (const record of event.message.records) {
                if (record.recordType === 'text') {
                    const id = new TextDecoder(record.encoding).decode(record.data);
                    const p = DB.participants.find(pt => pt.id === id);
                    if (p) { openParticipantProfile(id); }
                    else   { alert(`❌ Participant not found: ${id}`); }
                    break;
                }
            }
        };
    } catch(err) { alert(`❌ NFC Error: ${err.message}`); }
}

async function writeParticipantIDToNFC(participantID) {
    if (!ndefReader) { alert('⚠️ NFC writing not supported.'); return; }
    try {
        alert(`📝 NFC Writer Ready\nWriting ID: ${participantID}\n\nHold a BLANK NTAG215 keychain near the top of the iPad...`);
        await ndefReader.write({ records: [{ recordType:'text', data: participantID }] });
        try { await ndefReader.makeReadOnly(); alert(`✅ Keychain Programmed!\nID: ${participantID}\n🔒 Tag locked — give to participant.`); }
        catch { alert(`✅ Keychain Programmed!\nID: ${participantID}\n⚠️ This tag type cannot be permanently locked.`); }
        const p = DB.participants.find(pt => pt.id === participantID);
        if (p) { p.rfidAssigned = true; saveData(); }
    } catch(err) { alert(`❌ Write Error: ${err.message}`); }
}

function setupRFIDForm() {
    const form = document.getElementById('rfidWriteForm');
    if (form._listenerAdded) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const id = document.getElementById('rfidParticipantSelect').value;
        if (id) writeParticipantIDToNFC(id);
        else alert('Please select a participant first.');
    });
    form._listenerAdded = true;
}

function displayRFIDStats() {
    const total    = DB.participants.length;
    const assigned = DB.participants.filter(p => p.rfidAssigned).length;
    const rate     = total ? Math.round((assigned/total)*100) : 0;
    const el = document.getElementById('rfidStatsDisplay');
    el.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card"><h3>Total Participants</h3><p class="stat-number">${total}</p></div>
            <div class="stat-card"><h3>RFID Assigned</h3><p class="stat-number">${assigned}</p></div>
            <div class="stat-card"><h3>Unassigned</h3><p class="stat-number">${total-assigned}</p></div>
            <div class="stat-card"><h3>Assignment Rate</h3><p class="stat-number">${rate}%</p></div>
        </div>
        ${total-assigned>0 ? `<div class="alert alert-warning" style="margin-top:15px;"><strong>⚠️ ${total-assigned} participant(s) need RFID keychains</strong></div>` : ''}
    `;
}

// ── Reports ───────────────────────────────────────────────────
function generateReport(type) {
    document.getElementById('reportOutput').innerHTML = generateReportContent(type);
}
function generateReportContent(type) {
    let html = `<div class="report-header"><h2>CHR Program Report</h2><p>Generated: ${new Date().toLocaleString()}</p></div>`;
    html += `<div class="report-section"><h3>Program Overview</h3><table class="summary-table">
        <tr><td><strong>Participants Enrolled</strong></td><td>${DB.participants.length} / 75</td></tr>
        <tr><td><strong>Total Encounters</strong></td><td>${DB.encounters.length}</td></tr>
        <tr><td><strong>Needles Distributed</strong></td><td>${DB.encounters.reduce((s,e)=>s+(e.needlesOut||0),0).toLocaleString()} / 50,000</td></tr>
        <tr><td><strong>Needles Returned</strong></td><td>${DB.encounters.reduce((s,e)=>s+(e.needlesIn||0),0).toLocaleString()} / 75,000</td></tr>
        <tr><td><strong>HIV Tests</strong></td><td>${DB.testing.filter(t=>t.testType==='HIV').length} / 25</td></tr>
        <tr><td><strong>HCV Tests</strong></td><td>${DB.testing.filter(t=>t.testType==='HCV').length} / 25</td></tr>
        <tr><td><strong>Total Referrals</strong></td><td>${DB.referrals.length}</td></tr>
        <tr><td><strong>Referrals Linked</strong></td><td>${DB.referrals.filter(r=>r.linkedSuccessfully==='Yes').length}</td></tr>
    </table></div>`;
    const alerts = generateAlerts();
    if (alerts.length) {
        html += `<div class="report-section"><h3>⚠️ Inventory Alerts</h3><table class="summary-table"><tr><th>Item</th><th>Current</th><th>%</th><th>Status</th></tr>`;
        alerts.forEach(a => html += `<tr><td>${a.item}</td><td>${a.current}/${a.starting}</td><td>${a.percent}%</td><td><span class="status-badge ${a.level}">${a.message}</span></td></tr>`);
        html += '</table></div>';
    }
    if (type === 'full') {
        html += `<div class="report-section"><h3>Participants</h3><table class="summary-table"><tr><th>ID</th><th>Name</th><th>Enrolled</th><th>Encounters</th></tr>`;
        DB.participants.forEach(p => {
            const enc = DB.encounters.filter(e => e.participantID===p.id).length;
            html += `<tr><td>${p.id}</td><td>${p.firstName} ${p.lastName}</td><td>${new Date(p.enrollmentDate).toLocaleDateString()}</td><td>${enc}</td></tr>`;
        });
        html += '</table></div>';
    }
    return html;
}
function exportReportPDF() {
    const content = document.getElementById('reportOutput').innerHTML;
    if (!content || content.includes('Select a report')) { alert('Generate a report first!'); return; }
    const w = window.open('','','height=800,width=1000');
    w.document.write(`<!DOCTYPE html><html><head><title>CHR Report</title><style>body{font-family:Arial;margin:40px;font-size:12px;}table{width:100%;border-collapse:collapse;}th{background:#3498db;color:white;padding:10px;text-align:left;}td{padding:8px;border-bottom:1px solid #ddd;}.status-badge.critical{background:#e74c3c;color:white;padding:3px 8px;border-radius:4px;}.status-badge.low{background:#f39c12;color:white;padding:3px 8px;border-radius:4px;}</style></head><body>${content}<script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();}<\/script></body></html>`);
    w.document.close();
}

// ── Settings ──────────────────────────────────────────────────
function saveThresholds() {
    THRESHOLDS.critical = parseInt(document.getElementById('criticalThreshold').value);
    THRESHOLDS.low      = parseInt(document.getElementById('lowThreshold').value);
    THRESHOLDS.reorder  = parseInt(document.getElementById('reorderThreshold').value);
    localStorage.setItem('alertThresholds', JSON.stringify(THRESHOLDS));
    alert('✅ Alert thresholds saved!');
    updateDashboard();
}
function updateSettingsDisplay() {
    const total = DB.participants.length + DB.encounters.length + DB.testing.length + DB.referrals.length + DB.kitDistributions.length;
    document.getElementById('totalRecords').textContent = total;
}
function backupData() {
    const backup = { version:'1.1', timestamp:new Date().toISOString(), data:DB, thresholds:THRESHOLDS };
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup,null,2)],{type:'application/json'}));
    const a = document.createElement('a');
    a.href = url; a.download = `CHR_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    document.getElementById('backupStatus').innerHTML = '<div class="alert alert-success">✅ Backup created!</div>';
    setTimeout(() => document.getElementById('backupStatus').innerHTML='', 4000);
}
function restoreData(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (!confirm('⚠️ This will replace ALL current data. Continue?')) { event.target.value=''; return; }
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backup = JSON.parse(e.target.result);
            if (!backup.data) throw new Error('Invalid backup format');
            DB.participants     = backup.data.participants     || [];
            DB.encounters       = backup.data.encounters       || [];
            DB.testing          = backup.data.testing          || [];
            DB.referrals        = backup.data.referrals        || [];
            DB.kitDistributions = backup.data.kitDistributions || [];
            DB.inventory        = backup.data.inventory        || DB.inventory;
            DB.kits             = backup.data.kits             || DB.kits;
            if (backup.thresholds) { THRESHOLDS = backup.thresholds; localStorage.setItem('alertThresholds',JSON.stringify(THRESHOLDS)); }
            saveData(); updateDashboard();
            document.getElementById('backupStatus').innerHTML = `<div class="alert alert-success">✅ Restored from ${new Date(backup.timestamp).toLocaleString()}</div>`;
        } catch(err) { alert('❌ Restore error: ' + err.message); }
        event.target.value = '';
    };
    reader.readAsText(file);
}
function clearAllData() {
    if (!confirm('⚠️ This will permanently delete ALL data. Continue?')) return;
    if (prompt('Type DELETE to confirm:') !== 'DELETE') { alert('Cancelled.'); return; }
    DB.participants=[]; DB.encounters=[]; DB.testing=[]; DB.referrals=[]; DB.kitDistributions=[];
    DB.inventory = DEFAULT_INVENTORY.map(i => ({...i, current:i.starting, min:Math.ceil(i.starting*0.2), photo:null, custom:false}));
    DB.kits = JSON.parse(JSON.stringify(KITS));
    localStorage.clear(); saveData(); updateDashboard();
    alert('✅ All data cleared.'); showView('dashboard');
}

// ── Service Worker ────────────────────────────────────────────
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch(()=>{});
}
