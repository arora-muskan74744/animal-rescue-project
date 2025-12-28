# 🐾 Injured Animal Rescue Reporting System

A full-stack web application that allows citizens to report injured animals with photo and GPS location. NGOs can view reports, navigate to locations via Google Maps, and update rescue status.

## 🛠️ Tech Stack
- **Frontend**: React.js
- **Backend**: Node.js + Express.js
- **Database**: MySQL
- **File Storage**: Local disk (uploads folder)
- **Maps**: Google Maps API (free)

## ✨ Features
- ✅ Citizens report injured animals with:
  - Photo upload
  - Automatic GPS location (or manual)
  - Description, name, phone number
- ✅ NGOs dashboard shows:
  - Recent reports ordered by time
  - View uploaded photos
  - Direct Google Maps links
  - Status updates: PENDING → ON_THE_WAY → RESOLVED
- ✅ Responsive design, real-time updates

## 📱 Screenshots
*(Add screenshots later)*

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js (v18+)
- MySQL (v8+)

### 1. Backend Setup
cd ~/animal-rescue-project/backend
npm install
node server.js

*Backend runs on http://localhost:5000*

### 2. Frontend Setup
cd ~/animal-rescue-project/frontend
npm install
npm start
*Frontend runs on http://localhost:3000*

### 3. Test the app
1. Open http://localhost:3000
2. Submit a test report (with photo + location)
3. Scroll down to NGO dashboard
4. Click "View photo" / "Open in Maps" / status buttons

## 🗄️ Database Schema
reports table:

id (PK)

image_path

latitude, longitude (DECIMAL)

description (TEXT)

reporter_name, reporter_phone

status (VARCHAR: PENDING | ON_THE_WAY | RESOLVED)

created_at (TIMESTAMP)

## 📁 Project Structure
animal-rescue-project/
├── backend/
│ ├── server.js
│ ├── uploads/ (photos)
│ └── node_modules/
├── frontend/
│ ├── src/App.js
│ └── node_modules/
└── README.md

## 🔧 API Endpoints
POST /api/reports # Create new report
GET /api/reports # List all reports
PATCH /api/reports/:id/status # Update status


---
**Made with ❤️ for animal welfare**
