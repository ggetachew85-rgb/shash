# Shash — Web App

Your goals. Your plan. Your app.

## Deploy to Vercel (free, 5 minutes)

### 1. Push to GitHub
1. Go to github.com → New repository → name it "shash" → Create
2. Open terminal in this folder and run:
   git init
   git add .
   git commit -m "initial"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/shash.git
   git push -u origin main

### 2. Deploy on Vercel
1. Go to vercel.com → Add New Project
2. Import your "shash" GitHub repo
3. Framework: Vite (auto-detected)
4. Click Deploy

That's it. Vercel gives you a URL like: https://shash-abc123.vercel.app

### 3. Add to iPhone home screen
1. Open the URL in Safari on your iPhone
2. Tap the Share button (box with arrow)
3. Tap "Add to Home Screen"
4. Tap "Add"

Shash now lives on your home screen like a real app.

## Run locally (optional)
npm install
npm run dev
Open http://localhost:5173 in your browser

## Features
- Home: 3 daily priorities + stats dashboard
- Todos: Daily/Weekly/Monthly/Yearly/One-time with auto-reset
- Health: Weight log + food/eating-outside tracker
- Finance: Debt tracker (avalanche order) + Uber Eats log
- Settings: Edit goals, export/import backup JSON
