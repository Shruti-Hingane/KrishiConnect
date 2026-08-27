const API_URL = 'http://localhost:5000/api';
let currentUser = JSON.parse(localStorage.getItem('krishi_user')) || null;

document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  updateAuthUI();

  // Navigation Event Listeners
  document.getElementById('nav-brand').addEventListener('click', () => switchTab('home'));
  document.getElementById('nav-home-btn').addEventListener('click', () => switchTab('home'));
  document.getElementById('nav-farmer-btn').addEventListener('click', () => switchTab('farmer'));
  document.getElementById('nav-officer-btn').addEventListener('click', () => switchTab('officer'));

  // Auth Modal Listeners
  document.getElementById('open-auth-modal').addEventListener('click', () => openAuthModal());
  document.getElementById('close-auth-modal').addEventListener('click', () => closeAuthModal());
  document.getElementById('close-qr-modal').addEventListener('click', () => document.getElementById('qr-modal').classList.add('hidden'));

  // Auth Tabs (Login vs Sign Up)
  document.getElementById('auth-tab-login').addEventListener('click', () => toggleAuthForm('login'));
  document.getElementById('auth-tab-signup').addEventListener('click', () => toggleAuthForm('signup'));

  // Form Submissions
  document.getElementById('signup-form').addEventListener('submit', handleSignUp);
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('db-booking-form').addEventListener('submit', handleSlotBooking);
  document.getElementById('sim-sms-form').addEventListener('submit', handleSimulatedSMS);

  // Language Selector
  const langSelect = document.getElementById('lang-select');
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      applyLanguage(e.target.value);
    });
  }
});

// View / Tab Switcher
function switchTab(tabName) {
  const views = ['home', 'farmer', 'officer'];
  views.forEach(v => document.getElementById(`view-${v}`).classList.add('hidden'));

  document.getElementById(`view-${tabName}`).classList.remove('hidden');

  // Button styling
  const buttons = {
    home: document.getElementById('nav-home-btn'),
    farmer: document.getElementById('nav-farmer-btn'),
    officer: document.getElementById('nav-officer-btn')
  };

  Object.keys(buttons).forEach(key => {
    if (key === tabName) {
      buttons[key].className = 'nav-tab px-3.5 py-1.5 rounded-lg text-xs font-bold transition bg-emerald-600 text-white shadow';
    } else {
      buttons[key].className = 'nav-tab px-3.5 py-1.5 rounded-lg text-xs font-bold transition text-emerald-200 hover:text-white';
    }
  });

  if (tabName === 'farmer' && currentUser && currentUser.role === 'farmer') {
    loadFarmerSlots();
  } else if (tabName === 'officer' && currentUser && currentUser.role === 'officer') {
    loadAllSlotsForOfficer();
  }
}

// Auth UI Manager
function updateAuthUI() {
  const container = document.getElementById('auth-status-container');
  if (currentUser) {
    container.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="text-xs text-emerald-200 font-bold">👤 ${currentUser.name} (${currentUser.role})</span>
        <button onclick="logout()" class="bg-rose-600/80 hover:bg-rose-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition">
          Logout
        </button>
      </div>
    `;

    if (currentUser.role === 'farmer') {
      document.getElementById('farmer-auth-gate').classList.add('hidden');
      document.getElementById('farmer-workspace').classList.remove('hidden');
      document.getElementById('farmer-logged-name').innerText = currentUser.name;
    } else if (currentUser.role === 'officer') {
      document.getElementById('officer-auth-gate').classList.add('hidden');
      document.getElementById('officer-workspace').classList.remove('hidden');
      document.getElementById('officer-logged-name').innerText = currentUser.name;
    }
  } else {
    container.innerHTML = `
      <button id="open-auth-modal" onclick="openAuthModal()" class="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition shadow-lg border border-amber-300/40">
        <i data-lucide="user" class="w-4 h-4"></i> Login / Register
      </button>
    `;
    document.getElementById('farmer-auth-gate').classList.remove('hidden');
    document.getElementById('farmer-workspace').classList.add('hidden');
    document.getElementById('officer-auth-gate').classList.remove('hidden');
    document.getElementById('officer-workspace').classList.add('hidden');
  }
  lucide.createIcons();
}

function openAuthModal(presetRole) {
  if (presetRole) {
    document.getElementById('signup-role').value = presetRole;
  }
  document.getElementById('auth-modal').classList.remove('hidden');
}

function closeAuthModal() {
  document.getElementById('auth-modal').classList.add('hidden');
}

function toggleAuthForm(mode) {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const loginTab = document.getElementById('auth-tab-login');
  const signupTab = document.getElementById('auth-tab-signup');

  if (mode === 'login') {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    loginTab.className = 'w-1/2 py-2 text-xs font-bold rounded-lg bg-white shadow text-slate-900';
    signupTab.className = 'w-1/2 py-2 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-900';
  } else {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    signupTab.className = 'w-1/2 py-2 text-xs font-bold rounded-lg bg-white shadow text-slate-900';
    loginTab.className = 'w-1/2 py-2 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-900';
  }
}

// Database Auth API Handlers
async function handleSignUp(e) {
  e.preventDefault();
  const role = document.getElementById('signup-role').value;
  const name = document.getElementById('signup-name').value;
  const phone = document.getElementById('signup-phone').value;
  const password = document.getElementById('signup-password').value;

  try {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, name, phone, password })
    });
    const data = await res.json();

    if (res.ok) {
      alert('Registration successful! Please log in with your credentials.');
      toggleAuthForm('login');
      document.getElementById('login-phone').value = phone;
    } else {
      alert(data.message || 'Signup failed');
    }
  } catch (err) {
    alert('Server Connection Error');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const phone = document.getElementById('login-phone').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    });
    const data = await res.json();

    if (res.ok) {
      currentUser = data.user;
      localStorage.setItem('krishi_user', JSON.stringify(currentUser));
      localStorage.setItem('krishi_token', data.token);
      closeAuthModal();
      updateAuthUI();
      switchTab(currentUser.role === 'farmer' ? 'farmer' : 'officer');
    } else {
      alert(data.message || 'Invalid credentials');
    }
  } catch (err) {
    alert('Server Connection Error');
  }
}

function logout() {
  localStorage.removeItem('krishi_user');
  localStorage.removeItem('krishi_token');
  currentUser = null;
  updateAuthUI();
  switchTab('home');
}

// Slot Booking API Handlers
async function handleSlotBooking(e) {
  e.preventDefault();
  if (!currentUser) return alert('Please login first!');

  const cropType = document.getElementById('book-crop').value;
  const weightQuintals = document.getElementById('book-weight').value;
  const hubLocation = document.getElementById('book-hub').value;

  try {
    const res = await fetch(`${API_URL}/slots/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        farmerId: currentUser.id,
        farmerName: currentUser.name,
        farmerPhone: currentUser.phone,
        cropType,
        weightQuintals,
        hubLocation,
        bookingSource: 'Web'
      })
    });
    const data = await res.json();

    if (res.ok) {
      alert('Slot Booked & Saved to Database!');
      showQRPass(data.slot.tokenNumber, currentUser.name, `${cropType} (${weightQuintals} Qtl)`, hubLocation);
      loadFarmerSlots();
    }
  } catch (err) {
    alert('Error saving slot to database');
  }
}

async function loadFarmerSlots() {
  if (!currentUser) return;
  try {
    const res = await fetch(`${API_URL}/slots/farmer/${currentUser.id}`);
    const slots = await res.json();

    const tbody = document.getElementById('farmer-slots-table');
    tbody.innerHTML = '';

    slots.forEach(slot => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="p-3.5 font-bold text-emerald-700">${slot.tokenNumber}</td>
        <td class="p-3.5">${slot.cropType}</td>
        <td class="p-3.5">${slot.weightQuintals}</td>
        <td class="p-3.5 text-xs text-slate-500">${slot.hubLocation}</td>
        <td class="p-3.5"><span class="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">${slot.status}</span></td>
        <td class="p-3.5">
          <button onclick="showQRPass('${slot.tokenNumber}', '${slot.farmerName}', '${slot.cropType} (${slot.weightQuintals} Qtl)', '${slot.hubLocation}')" class="text-xs font-bold text-emerald-700 underline">
            View QR Pass
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Failed to load slots');
  }
}

async function loadAllSlotsForOfficer() {
  try {
    const res = await fetch(`${API_URL}/slots/all`);
    const slots = await res.json();

    const tbody = document.getElementById('officer-slots-table');
    tbody.innerHTML = '';

    slots.forEach(slot => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="p-3.5 font-bold text-slate-900">${slot.tokenNumber}</td>
        <td class="p-3.5 font-medium">${slot.farmerName}</td>
        <td class="p-3.5 font-mono text-xs">${slot.farmerPhone}</td>
        <td class="p-3.5">${slot.cropType} (${slot.weightQuintals} Qtl)</td>
        <td class="p-3.5"><span class="bg-amber-100 text-amber-900 text-xs px-2 py-0.5 rounded font-bold">${slot.status}</span></td>
        <td class="p-3.5 font-bold text-xs">${slot.qualityGrade || 'Pending'}</td>
        <td class="p-3.5 space-x-1">
          <button onclick="updateStatus('${slot._id}', 'Verified', 'Grade A')" class="bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded hover:bg-emerald-700">Approve A</button>
          <button onclick="updateStatus('${slot._id}', 'Verified', 'Grade B')" class="bg-amber-600 text-white text-[10px] font-bold px-2 py-1 rounded hover:bg-amber-700">Approve B</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Failed to load officer slots');
  }
}

async function updateStatus(slotId, status, qualityGrade) {
  try {
    const res = await fetch(`${API_URL}/slots/update-status/${slotId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, qualityGrade })
    });
    if (res.ok) {
      loadAllSlotsForOfficer();
    }
  } catch (err) {
    alert('Update failed');
  }
}

// Simulated SMS Command Engine (BOOK and STATUS Commands)
async function handleSimulatedSMS(e) {
  e.preventDefault();
  const input = document.getElementById('sim-sms-input').value.trim();
  const parts = input.split(' ');
  const command = parts[0] ? parts[0].toUpperCase() : '';
  const output = document.getElementById('sim-sms-output');
  output.classList.remove('hidden');

  // Command 1: BOOK <CROP> <QTY> <PHONE>
  if (command === 'BOOK') {
    if (parts.length < 4) {
      output.innerHTML = `<span class="text-rose-400">Invalid format! Use: BOOK &lt;CROP&gt; &lt;QTY&gt; &lt;PHONE&gt;</span>`;
      return;
    }

    const cropType = parts[1];
    const weightQuintals = parts[2];
    const farmerPhone = parts[3];

    try {
      const res = await fetch(`${API_URL}/slots/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId: "650000000000000000000000",
          farmerName: `SMS User (${farmerPhone})`,
          farmerPhone,
          cropType,
          weightQuintals,
          hubLocation: 'Hub #1 - Central Mandi',
          bookingSource: 'SMS'
        })
      });
      const data = await res.json();
      if (res.ok && data.slot) {
        output.innerHTML = `<strong>[SMS GATEWAY]</strong> Token <strong>${data.slot.tokenNumber}</strong> booked successfully! Gate Pass generated.`;
        if (currentUser && currentUser.role === 'farmer') loadFarmerSlots();
      } else {
        output.innerHTML = `<span class="text-rose-400">Booking failed: ${data.message || 'Server error'}</span>`;
      }
    } catch (err) {
      output.innerHTML = `<span class="text-rose-400">DB Connection Error</span>`;
    }
  } 
  // Command 2: STATUS <TOKEN_ID>
  else if (command === 'STATUS') {
    if (parts.length < 2) {
      output.innerHTML = `<span class="text-rose-400">Invalid format! Use: STATUS &lt;TOKEN_ID&gt;</span>`;
      return;
    }

    const tokenId = parts[1].toUpperCase();

    try {
      const res = await fetch(`${API_URL}/slots/status/${encodeURIComponent(tokenId)}`);
      const data = await res.json();

      if (res.ok && data.slot) {
        output.innerHTML = `<strong>[SMS GATEWAY]</strong> Token <strong>${data.slot.tokenNumber}</strong> | Status: <strong class="text-amber-300">${data.slot.status}</strong> | Grade: <strong class="text-emerald-300">${data.slot.qualityGrade || 'Pending Inspection'}</strong>`;
      } else {
        output.innerHTML = `<span class="text-amber-400">Token ${tokenId} not found in database.</span>`;
      }
    } catch (err) {
      output.innerHTML = `<span class="text-rose-400">DB Connection Error</span>`;
    }
  } 
  else {
    output.innerHTML = `<span class="text-rose-400">Invalid Command! Supported: BOOK or STATUS</span>`;
  }
}

function showQRPass(token, farmer, crop, hub) {
  document.getElementById('qr-pass-token').innerText = token;
  document.getElementById('qr-pass-farmer').innerText = farmer;
  document.getElementById('qr-pass-crop').innerText = crop;
  document.getElementById('qr-pass-hub').innerText = hub;

  const box = document.getElementById('qrcode-box');
  box.innerHTML = '';
  new QRCode(box, {
    text: JSON.stringify({ token, farmer, crop }),
    width: 140,
    height: 140,
    colorDark: "#064e3b",
    colorLight: "#ffffff"
  });

  document.getElementById('qr-modal').classList.remove('hidden');
}

// Multilingual Engine
const translations = {
  en: {
    heroTitle: "Direct MSP Grain Sales Without Mandi Queues.",
    heroDesc: "KrishiConnect bridges farmers and government procurement hubs. Book digital queue slots online, track center wait times in real-time, or generate gate passes offline using standard SMS.",
    bookBtn: "Book Procurement Slot",
    learnBtn: "Learn How It Works",
    qrTitle: "Digital QR Gate Passes",
    qrDesc: "Instantly obtain digital passes stored in your profile and verified by officers at security gates.",
    smsTitle: "Offline SMS Engine",
    smsDesc: "No smartphone or internet connection? Text simple SMS commands from any feature phone to reserve tokens.",
    mspTitle: "Transparent Quality Grading",
    mspDesc: "Procurement officers inspect crop quality on-site and update payout calculations live on the ledger."
  },
  hi: {
    heroTitle: "बिना मंडी कतार के सीधी न्यूनतम समर्थन मूल्य (MSP) बिक्री।",
    heroDesc: "कृषि-कनेक्ट किसानों और सरकारी खरीद केंद्रों को जोड़ता है। ऑनलाइन डिजिटल स्लॉट बुक करें या साधारण SMS से गेट पास प्राप्त करें।",
    bookBtn: "खरीद स्लॉट बुक करें",
    learnBtn: "यह कैसे काम करता है",
    qrTitle: "डिजिटल क्यूआर गेट पास",
    qrDesc: "अपने प्रोफाइल में सुरक्षित डिजिटल पास प्राप्त करें और सुरक्षा द्वार पर सत्यापन करवाएं।",
    smsTitle: "ऑफ़लाइन SMS सुविधा",
    smsDesc: "स्मार्टफोन नहीं है? टोकन बुक करने के लिए किसी भी मोबाइल से साधारण SMS भेजें।",
    mspTitle: "पारदर्शी गुणवत्ता ग्रेडिंग",
    mspDesc: "खरीद अधिकारी मौके पर फसल की गुणवत्ता का निरीक्षण करते हैं और भुगतान अपडेट करते हैं।"
  },
  mr: {
    heroTitle: "मंडीच्या रांगेशिवाय थेट किमान आधारभूत किंमत (MSP) धान्य विक्री.",
    heroDesc: "कृषि-कनेक्ट शेतकरी आणि शासकीय खरेदी केंद्रांना जोडते. ऑनलाईन डिजिटल स्लॉट बुक करा किंवा SMS द्वारे गेट पास मिळवा.",
    bookBtn: "खरेदी स्लॉट बुक करा",
    learnBtn: "हे कसे कार्य करते",
    qrTitle: "डिजिटल क्यूआर गेट पास",
    qrDesc: "तुमच्या प्रोफाइलमध्ये डिजिटल पास मिळवा आणि सुरक्षा गेटवर अधिकाऱ्यांकडून तपासा.",
    smsTitle: "ऑफलाईन SMS सुविधा",
    smsDesc: "स्मार्टफोन नाही? टोकन बुक करण्यासाठी कोणत्याही मोबाईलवरून साधा SMS पाठवा.",
    mspTitle: "पारदर्शक गुणवत्ता ग्रेडिंग",
    mspDesc: "खरेदी अधिकारी जागेवरच पिकाच्या दर्जाची तपासणी करतात आणि खात्यात नोंद करतात."
  }
};

function applyLanguage(lang) {
  const t = translations[lang] || translations['en'];

  const heroHeading = document.querySelector('#view-home h2');
  const heroDesc = document.querySelector('#view-home p');
  const bookBtn = document.querySelector('#view-home button');

  if (heroHeading) heroHeading.innerText = t.heroTitle;
  if (heroDesc) heroDesc.innerText = t.heroDesc;
  if (bookBtn) bookBtn.innerHTML = `<i data-lucide="ticket" class="w-4 h-4"></i> ${t.bookBtn}`;

  const cards = document.querySelectorAll('#view-home .grid > div');
  if (cards.length >= 3) {
    cards[0].querySelector('h3').innerText = t.qrTitle;
    cards[0].querySelector('p').innerText = t.qrDesc;
    
    cards[1].querySelector('h3').innerText = t.smsTitle;
    cards[1].querySelector('p').innerText = t.smsDesc;
    
    cards[2].querySelector('h3').innerText = t.mspTitle;
    cards[2].querySelector('p').innerText = t.mspDesc;
  }

  if (window.lucide) {
    lucide.createIcons();
  }
}
let mandiMap = null;

function initMandiMap() {
  // Prevent re-initialization error if user switches tabs
  if (mandiMap !== null) return;

  // Default center coordinates (e.g., Central Region)
  const defaultCoords = [19.0760, 72.8777];
  
  mandiMap = L.map('mandi-map').setView(defaultCoords, 9);

  // OpenStreetMap tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap'
  }).addTo(mandiMap);

  // Sample Mandi Procurement Hubs Data
  const hubs = [
    {
      name: "Hub #1 - Central Mandi",
      lat: 19.0760,
      lng: 72.8777,
      status: "Low Wait (~15 mins)",
      crops: "Wheat, Paddy",
      color: "green"
    },
    {
      name: "Hub #2 - North Grain Market",
      lat: 19.2183,
      lng: 72.9781,
      status: "Moderate Wait (~45 mins)",
      crops: "Maize, Wheat",
      color: "orange"
    },
    {
      name: "Hub #3 - District Storage Depot",
      lat: 18.9894,
      lng: 73.1175,
      status: "High Queue (>2 hrs)",
      crops: "Pulses, Paddy",
      color: "red"
    }
  ];

  // Add markers to the map
  hubs.forEach(hub => {
    const marker = L.marker([hub.lat, hub.lng]).addTo(mandiMap);
    
    const popupContent = `
      <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
        <strong style="color: #064e3b; font-size: 13px;">${hub.name}</strong><br/>
        <b>Crops:</b> ${hub.crops}<br/>
        <b>Queue Status:</b> <span style="color: ${hub.color}; font-weight: bold;">${hub.status}</span><br/><br/>
        <a href="https://www.google.com/maps/dir/?api=1&destination=${hub.lat},${hub.lng}" 
           target="_blank" 
           style="background-color: #059669; color: white; padding: 4px 8px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
           Get Directions ↗
        </a>
      </div>
    `;
    
    marker.bindPopup(popupContent);
  });
}

// Hook map initialization into tab switching logic
const originalSwitchTab = switchTab;
switchTab = function(tabName) {
  originalSwitchTab(tabName);
  if (tabName === 'farmer' || tabName === 'home') {
    setTimeout(() => {
      initMandiMap();
      if (mandiMap) mandiMap.invalidateSize(); // Fixes tile rendering issues on tab switch
    }, 200);
  }
};
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('chatbot-toggle-btn');
  const closeBtn = document.getElementById('chatbot-close-btn');
  const chatWindow = document.getElementById('chatbot-window');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');

  // Toggle Chat Visibility
  toggleBtn.addEventListener('click', () => chatWindow.classList.toggle('hidden'));
  closeBtn.addEventListener('click', () => chatWindow.classList.add('hidden'));

  // Handle User Message Submission
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = chatInput.value.trim();
    if (!query) return;

    appendMessage(query, 'user');
    chatInput.value = '';

    // Process Response after brief simulated thinking delay
    setTimeout(() => {
      const reply = generateAiResponse(query);
      appendMessage(reply, 'bot');
    }, 600);
  });

  window.sendQuickQuery = function(text) {
    chatInput.value = text;
    chatForm.dispatchEvent(new Event('submit'));
  };

  function appendMessage(text, sender) {
    const isUser = sender === 'user';
    const msgDiv = document.createElement('div');
    msgDiv.className = `flex items-start gap-2 ${isUser ? 'flex-row-reverse' : ''}`;

    msgDiv.innerHTML = `
      <div class="w-7 h-7 ${isUser ? 'bg-amber-500 text-slate-900' : 'bg-emerald-800 text-amber-300'} rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold shadow-sm">
        ${isUser ? 'YOU' : 'AI'}
      </div>
      <div class="${isUser ? 'bg-emerald-700 text-white' : 'bg-white text-slate-800 border border-slate-200'} p-3 rounded-2xl shadow-sm text-xs leading-relaxed max-w-[80%]">
        ${text}
      </div>
    `;

    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    if (window.lucide) lucide.createIcons();
  }

  // Simulated Conversational Logic for Hub Delays and Status Checks
  function generateAiResponse(input) {
    const text = input.toLowerCase();

    if (text.includes('delay') || text.includes('wait') || text.includes('time')) {
      return "<strong>Current Hub Queue Status:</strong><br/>• <strong>Central Mandi:</strong> ~15 min wait (Normal)<br/>• <strong>North Grain Silo:</strong> ~45 min wait (Moderate Traffic)<br/>• <strong>Nashik Main Hub:</strong> ~2 hr delay due to high moisture testing volume.";
    } 
    
    if (text.includes('reschedule') || text.includes('late')) {
      return "If your slot is delayed due to transport issues, open your <strong>Farmer Portal</strong>, click on your active token pass, and select <em>'Request 2-Hour Window Extension'</em>. Your queue position will be preserved.";
    } 

    if (text.includes('#krn') || text.includes('status')) {
      return "<strong>Token Verification:</strong><br/>Slot status is <strong>APPROVED & ACTIVE</strong>. Estimated gate clearance window is 10:30 AM – 11:30 AM today.";
    }

    return "I can help with queue updates, delay notifications, and gate passes. Try asking: <em>'What is the wait time at North Silo?'</em> or enter your Token ID.";
  }
});