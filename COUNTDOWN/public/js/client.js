const socket = io();

function formatMs(ms){
  const total = Math.max(0, Math.floor(ms/1000));
  const h = Math.floor(total/3600);
  const m = Math.floor((total%3600)/60);
  const s = total%60;
  return [h,m,s].map(v=>String(v).padStart(2,'0')).join(':');
}

let allState = null;
let selectedTeamId = null;

function populateTeamSelect(teams){
  const sel = document.getElementById('teamSelect');
  sel.innerHTML = '';
  teams.forEach(t => {
    const o = document.createElement('option');
    o.value = t.id;
    o.textContent = t.name;
    sel.appendChild(o);
  });
  if (teams.length) {
    selectedTeamId = sel.value = teams[0].id;
  }
}

function populateProblems(problems){
  const sel = document.getElementById('problemSelect');
  sel.innerHTML = '';
  problems.forEach(p => {
    const o = document.createElement('option');
    o.value = p.id;
    o.textContent = p.title;
    sel.appendChild(o);
  });
}

function renderProblemDetails(problem, team){
  const root = document.getElementById('problemDetails');
  root.innerHTML = '';
  if (!problem) return;
  const h = document.createElement('h3');
  h.textContent = problem.title;
  const p = document.createElement('p');
  p.textContent = problem.description;
  root.appendChild(h);
  root.appendChild(p);

  const list = document.createElement('div');
  problem.tasks.forEach((text, idx) => {
    const taskIndex = idx + 1;
    const taskDiv = document.createElement('div');
    taskDiv.className = 'milestone' + ((team && team.tasks && team.tasks[problem.id] && team.tasks[problem.id][idx] && team.tasks[problem.id][idx].approved) ? ' done' : '');
    const span = document.createElement('span');
    span.textContent = `${taskIndex}. ${text}`;
    const btn = document.createElement('button');
    btn.textContent = (team && team.tasks && team.tasks[problem.id] && team.tasks[problem.id][idx] && team.tasks[problem.id][idx].approved) ? 'Approved' : 'Request';
    btn.disabled = (team && team.tasks && team.tasks[problem.id] && team.tasks[problem.id][idx] && team.tasks[problem.id][idx].approved);
    btn.onclick = () => {
      socket.emit('requestTaskApproval', { teamId: team.id, taskIndex });
      btn.textContent = 'Requested';
      btn.disabled = true;
    };
    taskDiv.appendChild(span);
    taskDiv.appendChild(btn);
    list.appendChild(taskDiv);
  });
  root.appendChild(list);
}

socket.on('state', (state) => {
  allState = state;
  document.getElementById('timer').textContent = formatMs(state.remaining);
  populateTeamSelect(state.teams || []);
  populateProblems(state.problemStatements || []);

  // sync selected team
  const sel = document.getElementById('teamSelect');
  selectedTeamId = sel.value;
  const team = (state.teams || []).find(t => t.id === selectedTeamId);
  const problemId = team && team.selectedProblemId;
  const problem = (state.problemStatements || []).find(p => p.id === problemId) || (state.problemStatements || [])[0];
  if (problemId && team) {
    document.getElementById('problemSelect').value = problemId;
  }
  renderProblemDetails(problem, team);

  // render teams list (summary)
  const teamsDiv = document.getElementById('teams');
  teamsDiv.innerHTML = '';
  (state.teams || []).forEach(team => {
    const tdiv = document.createElement('div');
    tdiv.className = 'team';
    const h = document.createElement('h3');
    h.textContent = team.name + (team.selectedProblemId ? ` — ${team.selectedProblemId}` : '');
    tdiv.appendChild(h);
    Object.keys(team.tasks || {}).forEach(pid => {
      const tasks = team.tasks[pid] || [];
      tasks.forEach(ms => {
        const md = document.createElement('div');
        md.className = 'milestone' + (ms.approved ? ' done' : '');
        md.innerHTML = `<span>${ms.text}</span><small>${ms.approved ? 'Approved' : (ms.requested ? 'Requested' : '')}</small>`;
        tdiv.appendChild(md);
      });
    });
    teamsDiv.appendChild(tdiv);
  });
});

// when participant chooses different team/problem
document.getElementById('teamSelect').addEventListener('change', (e) => {
  selectedTeamId = e.target.value;
  // re-render problem details for the new team
  const team = (allState && allState.teams || []).find(t => t.id === selectedTeamId);
  const problemId = (document.getElementById('problemSelect').value) || (team && team.selectedProblemId);
  const problem = (allState && allState.problemStatements || []).find(p => p.id === problemId);
  renderProblemDetails(problem, team);
});

document.getElementById('problemSelect').addEventListener('change', (e) => {
  const pid = e.target.value;
  if (!selectedTeamId) return alert('Select your team first');
  socket.emit('selectProblem', { teamId: selectedTeamId, problemId: pid });
});
