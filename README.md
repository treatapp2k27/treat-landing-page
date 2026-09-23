# 🍽️ Treat — Official Landing Page & Interactive Showcase

<p align="center">
  <img src="assets/images/treat_bubble_logo.png" alt="Treat Logo" width="120" style="border-radius: 24px;" />
</p>

<p align="center">
  <strong>Where Work Meets Food</strong><br>
  A modern, high-performance product landing page and interactive showcase for Treat — the food-tech platform connecting squads and food lovers with dynamic feast deals, real-time budget matching, instant 2-minute table holds, and live kitchen synchronization.
</p>

<p align="center">
  <a href="#features"><img src="https://img.shields.io/badge/status-production--ready-success?style=flat-square" alt="Status"></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/tech-TailwindCSS%20|%20Three.js%20|%20Firebase-9357E8?style=flat-square" alt="Tech Stack"></a>
  <a href="#license"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License"></a>
  <a href="#contributor"><img src="https://img.shields.io/badge/contributor-EFTAKHAR--AMIN--SAKIB-E040A0?style=flat-square" alt="Contributor"></a>
</p>

---

## 📑 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
  - [1. Hero Section & Brand Storytelling](#1-hero-section--brand-storytelling)
  - [2. Interactive 4-Phone Flow Showcase](#2-interactive-4-phone-flow-showcase)
  - [3. Mobile-First Responsive Carousel](#3-mobile-first-responsive-carousel)
  - [4. Three.js 3D Turntable Device Viewer](#4-threejs-3d-turntable-device-viewer)
  - [5. Full-Featured Admin Studio & Dashboard](#5-full-featured-admin-studio--dashboard)
  - [6. Firebase Authentication Integration](#6-firebase-authentication-integration)
  - [7. Configuration Engine & JSON Backup/Restore](#7-configuration-engine--json-backuprestore)
  - [8. Developer & Creator Showcase](#8-developer--creator-showcase)
- [Tech Stack & Architecture](#tech-stack--architecture)
- [Project Directory Structure](#project-directory-structure)
- [Getting Started & Local Development](#getting-started--local-development)
  - [Prerequisites](#prerequisites)
  - [Option A: Lightweight Node.js Server (Recommended)](#option-a-lightweight-nodejs-server-recommended)
  - [Option B: Python HTTP Server](#option-b-python-http-server)
  - [Option C: VS Code Live Server or Direct Browser](#option-c-vs-code-live-server-or-direct-browser)
- [Admin Access & Passkey Credentials](#admin-access--passkey-credentials)
- [Deployment Options](#deployment-options)
- [Contributor](#contributor)
- [License](#license)

---

## 🌟 Overview

**Treat** bridges social dining and modern food tech. The landing page serves as both an ultra-responsive public product storefront and an interactive content management suite:

1. **Visually Immersive**: Leverages a pastel food-tech aesthetic (warm cream surfaces, ink typography, berry magenta, violet accents, and mint highlights).
2. **Interactive Demonstrations**: Includes a live per-person squad budget calculator with dynamic tip/tax calculations, an active countdown timer simulating instant table holds, and a Three.js 3D phone model.
3. **No-Code / Low-Code Site Management**: Includes a slide-out Admin Studio and a standalone Admin Dashboard (`admin.html`) enabling team members to customize copy, wireframe screenshots, download links, and testimonials in real time.

---

## 🚀 Key Features

### 1. Hero Section & Brand Storytelling
- **Stacked Impact Typography**: "Find Your Craving", "Share the Good Stuff" (with responsive curved underline in Treat berry magenta), and "Make It a Treat" (with hand-drawn heart doodle).
- **Direct Action CTAs**: Instant download triggers, QR code scanner modal, and waitlist email capture with real-time validation.
- **Floating Ambient Elements**: Atmospheric CSS orbs (Berry, Violet, Sizzling Coral) that respond smoothly to scroll position.

### 2. Interactive 4-Phone Flow Showcase
Walks visitors through four realistic iPhone 16 Pro models displaying the core Treat customer journey:
- **01. Feast Drops**: Explore limited-time 2-for-1 platter drops, dietary category tags, and search filters.
- **02. Squad Budget**: Dynamic interactive slider where visitors adjust squad size and per-person target to calculate live savings.
- **03. Flash Lock**: Live animated countdown ring (1:58 ticking table hold), zero deposit requirement, and instant kitchen floor sync badge.
- **04. Squad Perks**: Community reviews, level progression badges, and shared XP rewards.

### 3. Mobile-First Responsive Carousel
- On mobile devices (< 768px), the 4-phone desktop layout transforms into a smooth horizontal touch-swipe snap carousel with zero layout shift.
- Touch pill navigation (`01 Drops`, `02 Budget`, `03 Hold`, `04 Perks`) with active indicator dots allows one-tap jumping between stages.
- Tilt angles and perspective distortions are automatically flattened on touchscreens for maximum legibility.

### 4. Three.js 3D Turntable Device Viewer
- Embedded Three.js (r128) canvas provides a 360-degree interactive 3D smartphone model with dynamic studio lighting, ambient reflections, and smooth drag-to-rotate orbital controls.

### 5. Full-Featured Admin Studio & Dashboard
- **Embedded Drawer**: Quick on-page adjustments accessible via a secret 3-click trigger on the Treat navbar logo or the admin trigger button.
- **Full-Page Studio Dashboard (`admin.html`)**: Comprehensive control center with dedicated tabs:
  - **Overview**: System status, quick actions, and data summary.
  - **Hero & Branding**: Edit headlines, slogans, badges, and CTA button labels with live previews.
  - **4-Phone Flow**: Update mockups, titles, badges, and copy for each step.
  - **Foodie Deals & Testimonials**: Add, reorder, or edit featured platters and community reviews.
  - **Download & App Stores**: Configure Android APK download paths, iOS TestFlight links, and QR codes.
  - **Developer Showcase**: Update creator profiles, avatar images, and social handles.
  - **Backup & Restore**: Export complete website configuration as a formatted JSON file, import backups, or restore factory defaults.

### 6. Firebase Authentication Integration
- Powered by Firebase Modular v10 SDK (`js/firebase-auth.js`).
- Secure access for the Admin Dashboard:
  - **Email & Password Authentication**: Complete with custom error translation and lockout prevention.
  - **1-Click Google Authentication**: Founder / owner sign-in popup.
  - **Password Reset**: Automated self-service reset emails via Firebase Auth.
  - **Passkey Fallback**: Master security passkey support for rapid local development.

### 7. Configuration Engine & JSON Backup/Restore
- **Dual-Layer Persistence**: Automatically synchronizes edits between `localStorage` (`treat_landing_config_v4`) and active memory.
- **State Hydration**: Default dataset (`js/defaultData.js`) guarantees instant rendering even on clean browser profiles without external API dependencies.

### 8. Developer & Creator Showcase
- Dedicated spotlight on project creator **EFTAKHAR-AMIN-SAKIB** featuring circular avatars, bio, role attribution, and social channel links (GitHub, LinkedIn, Portfolio).

---

## 🛠️ Tech Stack & Architecture

```
Treat Landing Page Architecture
├── Presentation Layer
│   ├── index.html                  # Main single-page product showcase
│   ├── admin.html                  # Dedicated full-page Admin Studio
│   └── css/styles.css              # Custom design system tokens & 3D CSS
├── Script Modules
│   ├── js/app.js                   # Application coordinator & event wiring
│   ├── js/screenFlow.js            # 4-phone DOM renderer & carousel engine
│   ├── js/admin.js                 # Slide-out drawer admin panel logic
│   ├── js/firebase-auth.js         # Firebase Auth v10 client controller
│   ├── js/defaultData.js           # Central default schema & initial state
│   └── js/phone3d.js               # Three.js 3D smartphone turntable
├── Assets
│   ├── assets/images/              # High-res photography, logos, doodles
│   └── assets/screens/             # iPhone screen mockups (00 - 07)
└── Utilities & Config
    ├── server.js                   # Zero-dependency local Node.js server
    └── package.json                # Project scripts and metadata
```

- **Frontend Core**: Vanilla JavaScript (ES6+), HTML5, Tailwind CSS (via CDN)
- **3D Graphics**: Three.js (r128)
- **Authentication**: Firebase v10 Modular SDK (CDN)
- **Design Icons**: Google Material Symbols Outlined, Caveat, DM Sans, Plus Jakarta Sans
- **Server**: Node.js standard library (`http`, `fs`, `path`)

---

## 📁 Project Directory Structure

```plaintext
treat-landing-page/
├── assets/
│   ├── images/
│   │   ├── bistro_bella.jpg
│   │   ├── churro_sundae.jpg
│   │   ├── fiesta_platter.jpg
│   │   ├── gourmet_chicken_skillet.jpg
│   │   ├── hero_food_bowl.jpg
│   │   ├── prop_heart.svg
│   │   ├── prop_leaf.svg
│   │   ├── prop_tomato.svg
│   │   ├── squad_dining_table.jpg
│   │   ├── taco_bodega.jpg
│   │   ├── Treat Logo.png
│   │   ├── treat_bubble_logo.png
│   │   ├── treat_logo.png
│   │   ├── treat_splash_screen.png
│   │   └── treat_splash_stitch.png
│   └── screens/
│       ├── 00_welcome.png
│       ├── 01_explore.png
│       ├── 02_budget.png
│       ├── 03_platters.png
│       ├── 04_hold.png
│       ├── 05_voucher.png
│       ├── 06_social.png
│       └── 07_kitchen.png
├── css/
│   └── styles.css                  # Custom design tokens, 3D phone chassis
├── js/
│   ├── admin.js                    # Admin Studio panel logic
│   ├── app.js                      # UI coordinator, mobile carousel, modals
│   ├── defaultData.js              # Initial state & content dictionary
│   ├── firebase-auth.js            # Firebase Auth v10 client module
│   ├── phone3d.js                  # Three.js turntable controls
│   └── screenFlow.js               # Flow step renderer and binder
├── admin.html                      # Full-page Admin Studio Dashboard
├── index.html                      # Main landing page
├── package.json                    # Project configuration and run scripts
├── server.js                       # Lightweight HTTP dev server
├── treat-website-design.md         # Full UI/UX specification & guidelines
└── README.md                       # Complete documentation
```

---

## 💻 Getting Started & Local Development

### Prerequisites
- Any modern web browser (Chrome, Edge, Firefox, Safari)
- Optional: [Node.js](https://nodejs.org/) (v16+) or [Python](https://python.org/) (v3+)

### Option A: Lightweight Node.js Server (Recommended)
This repository includes a standalone server script with automatic MIME detection and port conflict auto-increment fallback:

```bash
# Clone the repository
git clone https://github.com/treatapp2k27/treat-landing-page.git

# Navigate into the project folder
cd treat-landing-page

# Launch the server
npm start
# or: node server.js
```

Open your browser to:
```
http://localhost:3001
```
*(If port 3001 is busy, the script automatically tries 3002, 3003, etc.)*

To access the full Admin Studio directly:
```
http://localhost:3001/admin
```

---

### Option B: Python HTTP Server
```bash
# Python 3
python -m http.server 3000
```
Then visit `http://localhost:3000`.

---

### Option C: VS Code Live Server or Direct Browser
- Open `index.html` directly in your browser, or
- Right click `index.html` in VS Code and select **Open with Live Server**.

---

## 🔐 Admin Access & Passkey Credentials

| Access Method | Details |
|---|---|
| **Full Dashboard URL** | `/admin.html` or `/admin` via `server.js` |
| **Drawer Trigger (Secret)** | Click the **Treat logo** in the navbar 3 times |
| **Developer Master Passkey** | `133162029` |
| **Firebase Auth** | Email/Password or 1-Click Google Sign-In |
| **Session Control** | Securely cached in `sessionStorage` with instant Lock/Logout |

---

## 🚀 Deployment Options

Because Treat Landing Page is built with standard web technologies and zero server-side build requirements:

### GitHub Pages
1. Go to repository **Settings** -> **Pages**.
2. Select branch `main` and root directory `/`.
3. Click **Save** — live within 60 seconds!

### Vercel / Netlify
1. Connect your GitHub repository `treatapp2k27/treat-landing-page`.
2. Build command: *(leave empty)*.
3. Output directory: `./`.
4. Deploy!

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

---

## 👤 Contributor

- **EFTAKHAR-AMIN-SAKIB** — Lead Creator & Developer  
  GitHub: [@EFTAKHAR-AMIN-SAKIB](https://github.com/EFTAKHAR-AMIN-SAKIB)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — see the LICENSE file for details.  
Copyright © 2026 Treat Inc. All rights reserved.
