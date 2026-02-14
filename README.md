# World of Light

An interactive, symbolic web experience where visitors send a prayer or intention into the universe and visually see their contribution as light added to a shared 3D world.

## ✦ Live Demo

Deploy to GitHub Pages and open the published URL. The site is a single page static app — no backend, no API keys, no build step required.

## ✦ Features (MVP)

- **3D Globe** — A softly glowing wireframe world floating in space, illuminated by scattered lights representing shared intentions
- **Ambient Animation** — Gentle rotation, breathing/pulsing, and subtle star field background
- **Prayer Submission** — Choose "A prayer for myself" or "A prayer for someone else"
- **Visibility Controls** — Public, anonymous, or beam-only (light without text)
- **Optional Name Field** — Shown when praying for someone else
- **Email Notification Placeholder** — UI present, clearly noted as a future feature
- **Character Counter** — Up to 400 characters for your intention
- **Submission Animation** — Soft light burst, ripple wave, luminosity increase, and permanent new light dot on the globe
- **Recent Intentions Panel** — Session-local display of public/anonymous prayers
- **Light Counter** — Tracks total lights in the world
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Iframe Compatible** — No fixed viewport assumptions; works inside Squarespace or similar embeds

## ✦ Deploy to GitHub Pages

### Option A: Direct deploy from `main` branch

1. Push all files (`index.html`, `style.css`, `app.js`) to the `main` branch of your repository
2. Go to **Settings → Pages** in your GitHub repository
3. Under **Source**, select **Deploy from a branch**
4. Choose `main` branch and `/ (root)` folder
5. Click **Save**
6. Your site will be live at `https://<username>.github.io/<repo-name>/` within a few minutes

### Option B: Use GitHub Actions (default for new repos)

1. Go to **Settings → Pages**
2. Under **Source**, select **GitHub Actions**
3. GitHub will auto-detect the static site and deploy it

### Local Preview

Simply open `index.html` in a modern browser. No build step needed.

```bash
# or use a simple local server
npx serve .
# or
python3 -m http.server 8000
```

## ✦ Tech Stack

- **Three.js** (r128 via CDN) — 3D rendering
- **Vanilla HTML/CSS/JS** — No framework, no build tool
- **Google Fonts** — Cormorant Garamond + Inter

## ✦ Configuration

All key parameters are at the top of `app.js` in the `CONFIG` object:

```javascript
const CONFIG = {
  initialLightCount: 60,     // Starting lights on the globe
  globeRadius: 2.2,          // Size of the globe
  rotationSpeed: 0.0008,     // Base rotation speed
  breatheSpeed: 0.3,         // Breathing animation speed
  breatheAmplitude: 0.015,   // Breathing scale amount
  lightDotSize: 0.04,        // Size of each light dot
  burstDuration: 2000,       // Burst animation duration (ms)
  rippleDuration: 2500,      // Ripple animation duration (ms)
  starCount: 800,            // Background stars
  maxCharCount: 400,         // Max prayer characters
};
```

## ✦ What's Next (Post-MVP)

- **Persistence layer** — Store prayers in a database (e.g. Supabase, Firebase) so the globe shows all contributions across sessions and visitors
- **Real email notifications** — Send an actual email when someone prays for someone else (requires a backend or serverless function)
- **Geolocation** — Place lights at approximate locations based on visitor's region
- **Global light counter** — Shared counter across all visitors
- **Prayer moderation** — Content review before public display
- **Sound design** — Optional ambient audio and submission sound effects
- **Share functionality** — Let users share that they added a light to the world

## ✦ Privacy

- No analytics or third-party tracking
- No data leaves the browser in this MVP
- Email addresses entered are not stored or transmitted
- All prayer data is session-only (cleared on page refresh)