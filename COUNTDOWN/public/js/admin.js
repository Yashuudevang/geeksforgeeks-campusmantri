const socket = io();

function uid(){return Math.random().toString(36).slice(2,9)}

function formatMs(ms){
  const total = Math.max(0, Math.floor(ms/1000));
  const h = Math.floor(total/3600);
  const m = Math.floor((total%3600)/60);
  const s = total%60;
  return [h,m,s].map(v=>String(v).padStart(2,'0')).join(':');
}

let lastState = null;

socket.on('state', (state) => {
  lastState = state;
  document.querySelector('#start').disabled = state.running;
  document.querySelector('#pause').disabled = !state.running;
  document.getElementById('timer').textContent = formatMs(state.remaining);
  renderTeams(state.teams || []);
  renderProblems(state.problemStatements || []);
});

function renderTeams(teams){
  const root = document.getElementById('teamsAdmin');
  root.innerHTML = '';
  teams.forEach(team => {
    const div = document.createElement('div');
    div.className = 'team';
    const h = document.createElement('h3');
    h.textContent = team.name + (team.selectedProblemId ? ` — ${team.selectedProblemId}` : '');
    div.appendChild(h);

    const addMs = document.createElement('div');
    addMs.style.marginTop = '8px';
    const input = document.createElement('input');
    input.placeholder = 'Milestone text';
    const btn = document.createElement('button');
    btn.textContent = 'Add Milestone';
    btn.onclick = () => {
      const text = input.value.trim();
      if (!text) return alert('Enter milestone');
      socket.emit('addMilestone', { teamId: team.id, milestone: { id: uid(), text } });

    // Render problem-specific tasks and admin approve buttons
    Object.keys(team.tasks || {}).forEach(pid => {
      const tasks = team.tasks[pid] || [];
      const pHeader = document.createElement('div');
      pHeader.style.marginTop = '8px';
      pHeader.innerHTML = `<strong>Problem: ${pid}</strong>`;
      div.appendChild(pHeader);
      tasks.forEach(tk => {
        const md = document.createElement('div');
        md.className = 'milestone' + (tk.approved ? ' done' : '');
        const span = document.createElement('span');
        span.textContent = `${tk.index}. ${tk.text}`;
        const small = document.createElement('small');
        small.textContent = tk.approved ? 'Approved' : (tk.requested ? 'Requested' : '');
        const btn = document.createElement('button');
        btn.textContent = tk.approved ? 'Approved' : (tk.requested ? 'Approve' : 'Approve');
        btn.disabled = tk.approved;
        btn.onclick = () => socket.emit('approveTask', { teamId: team.id, taskIndex: tk.index });
        md.appendChild(span);
        md.appendChild(small);
        md.appendChild(btn);
        div.appendChild(md);
      });
    });
      input.value = '';
    };
    addMs.appendChild(input);

function renderProblems(problems){
  const root = document.getElementById('problemsAdmin');
  root.innerHTML = '';
  problems.forEach(p => {
    const d = document.createElement('div');
    d.className = 'team';
    const h = document.createElement('h3');
    h.textContent = p.title;
    const pdesc = document.createElement('p');
    pdesc.textContent = p.description;
    d.appendChild(h);
    d.appendChild(pdesc);
    p.tasks.forEach((t, idx) => {
      const md = document.createElement('div');
      md.className = 'milestone';
      md.textContent = `${idx+1}. ${t}`;
      d.appendChild(md);
    });
    root.appendChild(d);
  });
}
    addMs.appendChild(btn);
    div.appendChild(addMs);

    team.milestones.forEach(ms => {
      const md = document.createElement('div');
      md.className = 'milestone' + (ms.done ? ' done' : '');
      const span = document.createElement('span');
      span.textContent = ms.text;
      const small = document.createElement('small');
      small.textContent = ms.done ? 'Done' : '';
      const toggle = document.createElement('button');
      toggle.textContent = ms.done ? 'Undo' : 'Done';
      toggle.onclick = () => socket.emit('toggleMilestone', { teamId: team.id, milestoneId: ms.id });
      md.appendChild(span);
      md.appendChild(small);
      md.appendChild(toggle);
      div.appendChild(md);
    });

    root.appendChild(div);
  });
}

// Controls
document.getElementById('start').onclick = () => socket.emit('start');
document.getElementById('pause').onclick = () => socket.emit('pause');
document.getElementById('reset').onclick = () => socket.emit('reset');
document.getElementById('setTime').onclick = () => {
  const mins = parseInt(document.getElementById('setMinutes').value,10);
  if (isNaN(mins) || mins < 0) return alert('Enter minutes');
  socket.emit('setRemaining', mins * 60 * 1000);
};

// Add team
document.getElementById('addTeam').onclick = () => {
  const name = document.getElementById('teamName').value.trim();
  if (!name) return alert('Enter a team name');
  socket.emit('addTeam', { id: uid(), name });
  document.getElementById('teamName').value = '';
};

// expose lastState for debugging
window.__lastState = () => lastState;
