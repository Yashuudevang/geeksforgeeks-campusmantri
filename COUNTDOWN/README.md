# Hackathon Countdown

Simple Node.js app for a 6-hour hackathon timer with real-time admin and participant pages.

Setup:

1. Install dependencies:

```powershell
npm install
```

2. Start server:

```powershell
npm start
```

3. Open admin view: http://localhost:3000/admin.html
   Open participant view: http://localhost:3000/

Features:
- Start/pause/reset timer
- Set custom remaining minutes
- Add teams and milestones in admin
- Participant view shows timer and milestones

Notes:
- No persistence; in-memory only (simple for hackathon)
- Optional: add persistence, authentication, nicer UI
