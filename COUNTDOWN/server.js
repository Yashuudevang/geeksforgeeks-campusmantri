const express = require('express');
const http = require('http');
const path = require('path');
const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// Timer state
let remaining = 6 * 60 * 60 * 1000; // default 6 hours in ms
let running = false;
let interval = null;
let endAt = null;

// Problem statements (3 problems, each with 3 tasks)
const problemStatements = [
  {
    id: 'p1',
    title: 'Smart Attendance System',
    description: 'Build an attendance system using face recognition or QR codes.',
    tasks: [
      'Design architecture and wireframes',
      'Implement authentication & attendance capture',
      'Demo with sample dataset and edge case handling'
    ]
  },
  {
    id: 'p2',
    title: 'Budget Buddy',
    description: 'Create a personal budgeting web app with expense categories.',
    tasks: [
      'Create UI and data model',
      'Implement add/edit/delete transactions',
      'Add summary graphs and export feature'
    ]
  },
  {
    id: 'p3',
    title: 'Campus Events Planner',
    description: 'Build a small event planner where students can propose and RSVP to events.',
    tasks: [
      'Design event creation flow',
      'Implement RSVP and notifications',
      'Add admin view for approvals and schedule'
    ]
  }
];

// Teams and per-team task info (pre-create 50 teams)
let teams = Array.from({ length: 50 }, (_, i) => ({
  id: `team-${i + 1}`,
  name: `Team ${i + 1}`,
  selectedProblemId: null,
  // tasks is a map: problemId -> [ { index, text, requested, approved } ]
  tasks: {}
}));

function broadcastState() {
  io.emit('state', {
    remaining,
    running,
    teams,
    problemStatements
  });
}

io.on('connection', (socket) => {
  console.log('client connected', socket.id);
  socket.emit('state', { remaining, running, teams });

  socket.on('start', () => {
    if (!running) {
      running = true;
      endAt = Date.now() + remaining;
      interval = setInterval(() => {
        remaining = Math.max(0, endAt - Date.now());
        broadcastState();
        if (remaining <= 0) {
          running = false;
          clearInterval(interval);
          interval = null;
        }
      }, 250);
      broadcastState();
    }
  });

  socket.on('pause', () => {
    if (running) {
      running = false;
      if (interval) clearInterval(interval);
      remaining = Math.max(0, endAt - Date.now());
      interval = null;
      broadcastState();
    }
  });

  socket.on('reset', (ms) => {
    if (typeof ms === 'number') remaining = ms;
    else remaining = 6 * 60 * 60 * 1000;
    running = false;
    if (interval) clearInterval(interval);
    interval = null;
    broadcastState();
  });

  socket.on('setRemaining', (ms) => {
    if (typeof ms === 'number') {
      remaining = ms;
      if (running) {
        endAt = Date.now() + remaining;
      }
      broadcastState();
    }
  });

  // Participant selects a problem for their team
  socket.on('selectProblem', ({ teamId, problemId }) => {
    const t = teams.find(x => x.id === teamId);
    const p = problemStatements.find(p => p.id === problemId);
    if (t && p) {
      t.selectedProblemId = problemId;
      // initialize tasks for this problem if not present
      if (!t.tasks[problemId]) {
        t.tasks[problemId] = p.tasks.map((text, idx) => ({ index: idx + 1, text, requested: false, approved: false }));
      }
      broadcastState();
    }
  });

  // Participant requests approval for a task (by task index)
  socket.on('requestTaskApproval', ({ teamId, taskIndex }) => {
    const t = teams.find(x => x.id === teamId);
    if (t && t.selectedProblemId) {
      const arr = t.tasks[t.selectedProblemId] || [];
      const task = arr.find(ts => ts.index === taskIndex);
      if (task && !task.approved) {
        task.requested = true;
        broadcastState();
      }
    }
  });

  // Admin approves a task
  socket.on('approveTask', ({ teamId, taskIndex }) => {
    const t = teams.find(x => x.id === teamId);
    if (t && t.selectedProblemId) {
      const arr = t.tasks[t.selectedProblemId] || [];
      const task = arr.find(ts => ts.index === taskIndex);
      if (task) {
        task.approved = true;
        task.requested = false;
        broadcastState();
      }
    }
  });

  socket.on('addTeam', (team) => {
    // team: { id, name }
    teams.push({ id: team.id, name: team.name, milestones: [] });
    broadcastState();
  });

  socket.on('addMilestone', ({ teamId, milestone }) => {
    const t = teams.find(x => x.id === teamId);
    if (t) {
      t.milestones.push({ id: milestone.id, text: milestone.text, done: false });
      broadcastState();
    }
  });

  socket.on('toggleMilestone', ({ teamId, milestoneId }) => {
    const t = teams.find(x => x.id === teamId);
    if (t) {
      const m = t.milestones.find(ms => ms.id === milestoneId);
      if (m) m.done = !m.done;
      broadcastState();
    }
  });

  socket.on('disconnect', () => {
    console.log('client disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server listening on', PORT));
