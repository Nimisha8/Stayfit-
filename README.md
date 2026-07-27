# 🔥 StayFit — Weight Loss Accountability Platform

StayFit is a full-stack fitness accountability web app. Instead of relying on willpower alone, StayFit adds real stakes: daily streaks, automatic point penalties for missed check-ins, and group leaderboards that keep you honest in front of people who can actually see whether you showed up.

**🌐 Live demo:** [stayfit-henna.vercel.app](https://stayfit-henna.vercel.app)

> Note: the backend runs on a free hosting tier, so the very first request after a period of inactivity may take 30–60 seconds to respond while the server wakes up. Everything after that is fast.

---

## ✨ Features

**Daily Accountability**
- Daily check-ins across four goals: workout, diet, water intake, and steps
- Automatic streak tracking (current + longest) and a points system
- A scheduled background job automatically deducts points and resets streaks for missed days — no manual tracking required

**Progress Tracking**
- Weight logging with unit preference (kg/lbs)
- Automatic BMI calculation with health-category feedback
- Progress photo gallery (Cloudinary-backed uploads)
- Visual timeline of weight history with month-over-month change indicators
- Weekly consistency chart and monthly summary on the dashboard

**Groups & Social Accountability**
- Create or join accountability groups
- Live leaderboard ranked by points and streaks
- Real-time-feeling group chat (polling-based)

**AI Coach**
- Conversational coach powered by Google's Gemini API
- Personalized responses grounded in the user's actual streak, points, check-in history, and BMI — not generic advice

**Trainer**
- Curated diet plan ideas across multiple dietary styles (balanced, high-protein, vegetarian, vegan, and more)
- Embedded home workout videos organized by category (full body, cardio/weight loss, abs, legs, arms, yoga)
- Optional, self-disclosed health information field (informational only — not medical advice)

**Account & Profile**
- Secure JWT-based authentication
- Editable profile: name, password, height, personal goals, health notes
- Lifetime account overview (member since, total check-ins, longest streak, groups joined)
- Full account deletion with password confirmation

**Design**
- Fully responsive, mobile-friendly layout with a collapsible navigation menu
- Custom illustrated landing page with animated stats, interactive feature cards, and FAQ
- Consistent, hand-tuned visual identity throughout (not a default template)

---

## 🛠️ Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS
- Framer Motion (animations)
- Recharts (data visualization)
- React Router
- Axios

**Backend**
- Node.js + Express
- MySQL (via `mysql2`)
- JSON Web Tokens (authentication)
- bcrypt (password hashing)
- Multer + Cloudinary (image uploads)
- node-cron (scheduled tasks)
- Google Gemini API (AI coach)

**Infrastructure**
- **Frontend hosting:** Vercel
- **Backend hosting:** Render
- **Database:** Aiven (managed MySQL)
- **Scheduled jobs:** cron-job.org (external trigger for the daily penalty check)

---

## 📁 Project Structure

```
stayfit/
├── frontend/          # React + Vite application
│   ├── src/
│   │   ├── pages/         # Route-level page components
│   │   ├── components/    # Reusable UI components
│   │   ├── api/           # Axios instance & API config
│   │   └── utils/         # Helper functions (unit conversion, etc.)
│   └── public/
└── backend/           # Node/Express API
    ├── controllers/       # Route handler logic
    ├── routes/            # Express route definitions
    ├── middleware/         # Auth & request validation
    └── config/            # Database connection setup
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js (v18+)
- A MySQL database (local or hosted)
- A Cloudinary account (for photo uploads)
- A Google Gemini API key (for the AI Coach)

### 1. Clone the repository
```bash
git clone https://github.com/Nimisha8/Stayfit-.git
cd Stayfit-
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with the following variables:
```
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_PORT=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CRON_SECRET=
GEMINI_API_KEY=
```

Run the database schema against your MySQL instance, then start the server:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
```

Create a `.env.local` file in `frontend/`:
```
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:
```bash
npm run dev
```

The app should now be running at `http://localhost:5173`.

---

## 📌 Notes

- Health-related content (diet plans, self-disclosed conditions) is intended as general inspiration only and is not personalized medical or nutritional advice.
- The daily penalty check is triggered by an external scheduler hitting a protected endpoint, rather than relying solely on an in-process cron job — this avoids missed runs caused by the backend's free-tier hosting going to sleep during periods of inactivity.

---

## 👩‍💻 Author

Built by **Nimisha Nair**.
