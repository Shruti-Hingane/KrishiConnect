# KrishiConnect
# 🌾 KrishiConnect - Full-Stack Mandi Queue & Procurement Management System

KrishiConnect is a full-stack web application designed to eliminate long waiting queues for farmers selling crops under Indian Government Minimum Support Price (MSP) schemes. The platform provides real-time mandi queue tracking, digital QR gate pass generation, quality inspection ledger management, and offline SMS-based token reservation.

---

## 🚀 Key Features

- **Direct MSP Slot Booking:** Farmers can register and reserve procurement time slots online or via offline SMS commands.
- **Digital QR Gate Passes:** Generates instant QR codes for security gate validation and printable entry passes.
- **Officer Inspection Portal:** Enables government procurement officers to assess crop quality, record moisture levels, approve tokens, and settle payout rates.
- **Interactive Mandi Map:** Integrated map view displaying live hub queue density levels and direct route directions.
- **KrishiAI Assistant:** Embedded interactive assistant for real-time queue status inquiries and delay support.

---

## 🛠️ Tech Stack & Architecture

### **Frontend**
- **UI Framework:** HTML5, Tailwind CSS, JavaScript (ES6 Modules)
- **Map & Visualization:** Leaflet.js & OpenStreetMap
- **Icons & QR Generation:** Lucide Icons, QRCode.js

### **Backend & Database**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose ODM)
- **Environment Management:** `dotenv`

---

## 📁 Project Directory Structure

```text
KrishiConnect/
├── BackEnd/
│   ├── models/            # Mongoose Schemas (User, Token/Slot models)
│   ├── routes/            # Express API Endpoint Routes
│   ├── .env.example       # Example environment variables template
│   ├── package.json       # Backend Dependencies & Scripts
│   ├── package-lock.json  # Lockfile for dependency tree
│   └── server.js          # Main Express Application & Database Connection
├── index.html             # Main Application Frontend Interface
├── app.js                 # Client-side API Controller & Dynamic UI Engine
└── README.md              # Documentation
