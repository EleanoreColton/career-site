// =====================
// PASSWORD
// =====================

const PASSWORD = "Chocolateroses21!?!";

function checkPassword() {
  const input = document.getElementById('password-input').value;
  if (input === PASSWORD) {
    document.getElementById('lock-screen').style.display = 'none';
    document.getElementById('dashboard').classList.remove('hidden');
    sessionStorage.setItem('dash-auth', 'true');
    renderAll();
  } else {
    document.getElementById('lock-error').textContent = 'Incorrect password. Try again.';
    document.getElementById('password-input').value = '';
  }
}

function handleKey(event) {
  if (event.key === 'Enter') checkPassword();
}

function logout() {
  sessionStorage.removeItem('dash-auth');
  location.reload();
}

// Auto-unlock if already authenticated this session
if (sessionStorage.getItem('dash-auth') === 'true') {
  document.getElementById('lock-screen').style.display = 'none';
  document.getElementById('dashboard').classList.remove('hidden');
}

// =====================
// DATA — loads from
// local storage or
// uses defaults
// =====================

function load(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch { return fallback; }
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

let credentials = load('ec-credentials', [
  { name: 'Google Project Management (Coursera)', org: 'Google / Coursera', status: 'in-progress', date: '2026-05-01' },
  { name: 'CAPM', org: 'Project Management Institute', status: 'planned', date: '2026-06-01' },
  { name: 'LEED GA Reinstatement', org: 'US Green Building Council', status: 'planned', date: '2026-04-01' },
  { name: 'LEED AP BD+C', org: 'US Green Building Council', status: 'planned', date: '2026-09-01' },
  { name: 'ESG Data Specialist', org: 'In progress', status: 'in-progress', date: '' },
  { name: 'Green Globes Emerging Professional', org: 'Green Building Initiative', status: 'complete', date: '' },
]);

let applications = load('ec-applications', []);

let contacts = load('ec-contacts', [
  { name: 'Contact at New Leaf Energy', company: 'New Leaf Energy', status: 'warm', next: 'Follow up on Chicago visit' },
  { name: 'Contact at Burns & McDonnell', company: 'Burns & McDonnell', status: 'stale', next: 'Re-engage with industry topic' },
  { name: 'Contact at Invenergy', company: 'Invenergy', status: 'warm', next: 'Send informational interview request' },
  { name: 'GBI contact', company: 'Green Building Initiative', status: 'target', next: 'Reconnect on industry topic' },
  { name: 'IGA contact', company: 'IGA', status: 'target', next: 'Reconnect on industry topic' },
]);

let tasks = load('ec-tasks', [
  { text: 'Follow up on existing applications', done: false },
  { text: 'Send Invenergy informational interview request', done: false },
  { text: 'Re-engage Burns & McDonnell contact', done: false },
  { text: 'Complete Google PM module this week', done: false },
  { text: 'Friday pipeline review', done: false },
]);

// =====================
// METRICS
// =====================

function renderMetrics() {
  const active = contacts.filter(c => c.status === 'active').length;
  const followUp = contacts.filter(c => c.status === 'stale').length;
  const appCount = applications.length;
  const interviewing = applications.filter(a => a.status === 'interviewing').length;
  const credsInProgress = credentials.filter(c => c.status === 'in-progress').length;
  const tasksLeft = tasks.filter(t => !t.done).length;

  const metrics = [
    { label: 'Active contacts', value: active },
    { label: 'Need follow-up', value: followUp },
    { label: 'Applications', value: appCount },
    { label: 'Interviewing', value: interviewing },
    { label: 'Creds in progress', value: credsInProgress },
    { label: 'Tasks remaining', value: tasksLeft },
  ];

  document.getElementById('metrics-grid').innerHTML = metrics.map(m => `
    <div class="metric-card">
      <div class="metric-value">${m.value}</div>
      <div class="metric-label">${m.label}</div>
    </div>
  `).join('');
}

// =====================
// CREDENTIALS
// =====================

const statusColors = {
  'complete': 'badge-green',
  'in-progress': 'badge-amber',
  'planned': 'badge-gray',
  'applied': 'badge-blue',
  'in-contact': 'badge-amber',
  'interviewing': 'badge-green',
  'no-response': 'badge-gray',
  'warm': 'badge-amber',
  'active': 'badge-green',
  'stale': 'badge-red',
  'target': 'badge-gray',
};

const statusLabels = {
  'complete': 'Complete',
  'in-progress': 'In progress',
  'planned': 'Planned',
  'applied': 'Applied',
  'in-contact': 'In contact',
  'interviewing': 'Interviewing',
  'no-response': 'No response',
  'warm': 'Warm',
  'active': 'Active',
  'stale': 'Follow up',
  'target': 'Target',
};

function renderCredentials() {
  const list = document.getElementById('cred-list');
  if (credentials.length === 0) {
    list.innerHTML = '<p class="empty-state">No credentials yet — add one above.</p>';
    return;
  }
  list.innerHTML = credentials.map((c, i) => `
    <div class="list-item">
      <div class="list-item-main">
        <div class="list-item-title">${c.name}</div>
        <div class="list-item-sub">${c.org}${c.date ? ' · Target: ' + formatDate(c.date) : ''}</div>
      </div>
      <div class="list-item-right">
        <span class="badge ${statusColors[c.status]}">${statusLabels[c.status]}</span>
        <button class="icon-btn" onclick="removeItem('credentials', ${i})">✕</button>
      </div>
    </div>
  `).join('');
}

function addCredential() {
  const name = document.getElementById('cred-name').value.trim();
  const org = document.getElementById('cred-org').value.trim();
  const status = document.getElementById('cred-status').value;
  const date = document.getElementById('cred-date').value;
  if (!name) return;
  credentials.unshift({ name, org, status, date });
  save('ec-credentials', credentials);
  document.getElementById('cred-name').value = '';
  document.getElementById('cred-org').value = '';
  document.getElementById('cred-date').value = '';
  renderCredentials();
  renderMetrics();
}

// =====================
// APPLICATIONS
// =====================

function renderApplications() {
  const list = document.getElementById('app-list');
  if (applications.length === 0) {
    list.innerHTML = '<p class="empty-state">No applications yet — add one above.</p>';
    return;
  }
  list.innerHTML = applications.map((a, i) => `
    <div class="list-item">
      <div class="list-item-main">
        <div class="list-item-title">${a.company} — ${a.role}</div>
        <div class="list-item-sub">${a.date ? 'Applied ' + formatDate(a.date) : ''}${a.next ? ' · Next: ' + a.next : ''}</div>
      </div>
      <div class="list-item-right">
        <span class="badge ${statusColors[a.status]}">${statusLabels[a.status]}</span>
        <button class="icon-btn" onclick="removeItem('applications', ${i})">✕</button>
      </div>
    </div>
  `).join('');
}

function addApplication() {
  const company = document.getElementById('app-company').value.trim();
  const role = document.getElementById('app-role').value.trim();
  const status = document.getElementById('app-status').value;
  const date = document.getElementById('app-date').value;
  const next = document.getElementById('app-next').value.trim();
  if (!company || !role) return;
  applications.unshift({ company, role, status, date, next });
  save('ec-applications', applications);
  document.getElementById('app-company').value = '';
  document.getElementById('app-role').value = '';
  document.getElementById('app-next').value = '';
  document.getElementById('app-date').value = '';
  renderApplications();
  renderMetrics();
}

// =====================
// CONTACTS
// =====================

function renderContacts() {
  const list = document.getElementById('con-list');
  if (contacts.length === 0) {
    list.innerHTML = '<p class="empty-state">No contacts yet — add one above.</p>';
    return;
  }
  list.innerHTML = contacts.map((c, i) => `
    <div class="list-item">
      <div class="list-item-main">
        <div class="list-item-title">${c.name}</div>
        <div class="list-item-sub">${c.company}${c.next ? ' · ' + c.next : ''}</div>
      </div>
      <div class="list-item-right">
        <span class="badge ${statusColors[c.status]}">${statusLabels[c.status]}</span>
        <button class="icon-btn" onclick="removeItem('contacts', ${i})">✕</button>
      </div>
    </div>
  `).join('');
}

function addContact() {
  const name = document.getElementById('con-name').value.trim();
  const company = document.getElementById('con-company').value.trim();
  const status = document.getElementById('con-status').value;
  const next = document.getElementById('con-next').value.trim();
  if (!name) return;
  contacts.unshift({ name, company, status, next });
  save('ec-contacts', contacts);
  document.getElementById('con-name').value = '';
  document.getElementById('con-company').value = '';
  document.getElementById('con-next').value = '';
  renderContacts();
  renderMetrics();
}

// =====================
// TASKS
// =====================

function renderTasks() {
  const list = document.getElementById('task-list');
  if (tasks.length === 0) {
    list.innerHTML = '<p class="empty-state">No tasks — add one above.</p>';
    return;
  }
  list.innerHTML = tasks.map((t, i) => `
    <div class="task-item ${t.done ? 'task-done' : ''}" onclick="toggleTask(${i})">
      <div class="task-check">${t.done ? '✓' : ''}</div>
      <div class="task-text">${t.text}</div>
      <button class="icon-btn" onclick="event.stopPropagation(); removeItem('tasks', ${i})">✕</button>
    </div>
  `).join('');
}

function addTask() {
  const text = document.getElementById('task-input').value.trim();
  if (!text) return;
  tasks.unshift({ text, done: false });
  save('ec-tasks', tasks);
  document.getElementById('task-input').value = '';
  renderTasks();
  renderMetrics();
}

function handleTaskKey(event) {
  if (event.key === 'Enter') addTask();
}

function toggleTask(i) {
  tasks[i].done = !tasks[i].done;
  save('ec-tasks', tasks);
  renderTasks();
  renderMetrics();
}

function clearCompletedTasks() {
  tasks = tasks.filter(t => !t.done);
  save('ec-tasks', tasks);
  renderTasks();
  renderMetrics();
}

// =====================
// SHARED UTILITIES
// =====================

function removeItem(type, i) {
  if (type === 'credentials') { credentials.splice(i, 1); save('ec-credentials', credentials); renderCredentials(); }
  if (type === 'applications') { applications.splice(i, 1); save('ec-applications', applications); renderApplications(); }
  if (type === 'contacts') { contacts.splice(i, 1); save('ec-contacts', contacts); renderContacts(); }
  if (type === 'tasks') { tasks.splice(i, 1); save('ec-tasks', tasks); renderTasks(); }
  renderMetrics();
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function renderAll() {
  renderMetrics();
  renderCredentials();
  renderApplications();
  renderContacts();
  renderTasks();
}

// Run on load if already authenticated
if (sessionStorage.getItem('dash-auth') === 'true') renderAll();