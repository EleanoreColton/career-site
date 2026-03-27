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
let vaultDocs = load('ec-vault-docs', []);
let savedJDs = load('ec-saved-jds', []);
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
  initTools();
}

// Run on load if already authenticated
if (sessionStorage.getItem('dash-auth') === 'true') renderAll();
// =====================
// APPLICATION TOOLS
// =====================

// --- Tab switching ---
function switchTab(name) {
  document.querySelectorAll('.tools-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tools-panel').forEach(p => p.classList.remove('active'));
  document.querySelector(`[onclick="switchTab('${name}')"]`).classList.add('active');
  document.getElementById(`tab-${name}`).classList.add('active');
}

// --- Document Vault ---


const docTypeLabels = {
  resume: 'Resume',
  cover: 'Cover letter',
  writing: 'Writing sample',
  other: 'Other'
};

function addVaultDoc() {
  const name = document.getElementById('vault-doc-name').value.trim();
  const type = document.getElementById('vault-doc-type').value;
  const content = document.getElementById('vault-doc-content').value.trim();
  if (!name || !content) return;
  vaultDocs.unshift({ id: Date.now(), name, type, content, added: new Date().toLocaleDateString() });
  save('ec-vault-docs', vaultDocs);
  document.getElementById('vault-doc-name').value = '';
  document.getElementById('vault-doc-content').value = '';
  renderVault();
  updateSelects();
}

function renderVault() {
  const list = document.getElementById('vault-list');
  if (vaultDocs.length === 0) {
    list.innerHTML = '<p class="empty-state">No documents yet — paste one above to get started.</p>';
    return;
  }
  list.innerHTML = vaultDocs.map((doc, i) => `
    <div class="vault-doc-card">
      <div class="vault-doc-main">
        <div class="vault-doc-name">${doc.name}</div>
        <div class="vault-doc-meta">${docTypeLabels[doc.type]} · Added ${doc.added}</div>
      </div>
      <div class="vault-doc-actions">
        <button class="vault-btn" onclick="previewDoc(${i})">Preview</button>
        <button class="vault-btn danger icon-btn" onclick="removeVaultDoc(${i})">✕</button>
      </div>
    </div>
  `).join('');
}

function previewDoc(i) {
  const doc = vaultDocs[i];
  const preview = document.getElementById('vault-preview');
  if (preview) {
    preview.remove();
    return;
  }
  const el = document.createElement('div');
  el.id = 'vault-preview';
  el.style.cssText = 'background:white;border:1px solid rgba(26,26,46,0.1);border-radius:8px;padding:1.25rem;margin-top:0.75rem;font-size:12px;line-height:1.7;color:#1a1a2e;white-space:pre-wrap;max-height:400px;overflow-y:auto;';
  el.textContent = doc.content;
  document.getElementById('vault-list').insertAdjacentElement('beforebegin', el);
}

function removeVaultDoc(i) {
  vaultDocs.splice(i, 1);
  save('ec-vault-docs', vaultDocs);
  renderVault();
  updateSelects();
}

// --- JD Analyzer ---
function analyzeJD() {
  const title = document.getElementById('jd-title').value.trim();
  const content = document.getElementById('jd-content').value.trim();
  if (!content) return;

  const results = document.getElementById('jd-results');
  results.innerHTML = '<p class="loading-state">Analyzing...</p>';

  const mustHave = [];
  const preferred = [];
  const keywords = [];
  const values = [];

  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 10);

  const mustPatterns = [/required/i, /must have/i, /must be/i, /minimum/i, /\d\+\s*years/i, /bachelor/i, /master/i, /degree/i];
  const preferredPatterns = [/preferred/i, /plus/i, /desired/i, /ideally/i, /nice to have/i, /experience with/i];
  const valuePatterns = [/mission/i, /justice/i, /equity/i, /inclusion/i, /community/i, /passion/i, /collaborative/i, /values/i];

  const keywordList = [
    'project management', 'program management', 'stakeholder', 'policy', 'research',
    'analysis', 'writing', 'communication', 'regulatory', 'compliance', 'grant',
    'advocacy', 'litigation', 'GIS', 'data', 'outreach', 'coalition', 'legal',
    'environmental', 'clean energy', 'transportation', 'air quality', 'health',
    'climate', 'permitting', 'NEPA', 'federal', 'state', 'agency', 'nonprofit',
    'community solar', 'renewable', 'decarbonization', 'electrification', 'resilience',
    'ESG', 'sustainability', 'benchmarking', 'electrification', 'land acquisition'
  ];

  lines.forEach(line => {
    const cleanLine = line.replace(/^[\*\-\•\d\.]+\s*/, '').trim();
    if (cleanLine.length < 15) return;

    if (mustPatterns.some(p => p.test(cleanLine))) {
      if (mustHave.length < 8) mustHave.push(cleanLine);
    } else if (preferredPatterns.some(p => p.test(cleanLine))) {
      if (preferred.length < 6) preferred.push(cleanLine);
    } else if (valuePatterns.some(p => p.test(cleanLine))) {
      if (values.length < 4) values.push(cleanLine);
    }
  });

  keywordList.forEach(kw => {
    if (content.toLowerCase().includes(kw.toLowerCase())) {
      keywords.push(kw);
    }
  });

  const jdObj = { id: Date.now(), title: title || 'Untitled role', content, mustHave, preferred, keywords, values, added: new Date().toLocaleDateString() };
  savedJDs.unshift(jdObj);
  save('ec-saved-jds', savedJDs);

  renderJDResult(jdObj, results);
  renderSavedJDs();
  updateSelects();

  document.getElementById('jd-title').value = '';
  document.getElementById('jd-content').value = '';
}

function renderJDResult(jd, container) {
  container.innerHTML = `
    <div class="jd-card">
      <div class="jd-card-header">
        <div class="jd-card-title">${jd.title}</div>
        <span class="badge badge-green">Saved</span>
      </div>
      ${jd.mustHave.length > 0 ? `
        <div class="jd-section-title">Must-have requirements</div>
        ${jd.mustHave.map(r => `<div class="gap-item"><div class="gap-dot missing"></div>${r}</div>`).join('')}
      ` : ''}
      ${jd.preferred.length > 0 ? `
        <div class="jd-section-title">Preferred qualifications</div>
        ${jd.preferred.map(r => `<div class="gap-item"><div class="gap-dot partial"></div>${r}</div>`).join('')}
      ` : ''}
      ${jd.keywords.length > 0 ? `
        <div class="jd-section-title">Keywords to include</div>
        <div class="jd-tag-row">${jd.keywords.map(k => `<span class="jd-tag keyword">${k}</span>`).join('')}</div>
      ` : ''}
      ${jd.values.length > 0 ? `
        <div class="jd-section-title">Culture & values signals</div>
        <div class="jd-tag-row">${jd.values.map(v => `<span class="jd-tag value">${v}</span>`).join('')}</div>
      ` : ''}
    </div>
  `;
}

function renderSavedJDs() {
  const list = document.getElementById('saved-jds-list');
  if (savedJDs.length === 0) { list.innerHTML = ''; return; }
  list.innerHTML = `
    <p class="jd-section-title" style="margin-top:1.5rem;">Saved job descriptions</p>
    ${savedJDs.map((jd, i) => `
      <div class="vault-doc-card">
        <div class="vault-doc-main">
          <div class="vault-doc-name">${jd.title}</div>
          <div class="vault-doc-meta">Saved ${jd.added} · ${jd.keywords.length} keywords · ${jd.mustHave.length} requirements</div>
        </div>
        <div class="vault-doc-actions">
          <button class="vault-btn" onclick="showSavedJD(${i})">View</button>
          <button class="vault-btn danger icon-btn" onclick="removeJD(${i})">✕</button>
        </div>
      </div>
    `).join('')}
  `;
}

function showSavedJD(i) {
  renderJDResult(savedJDs[i], document.getElementById('jd-results'));
}

function removeJD(i) {
  savedJDs.splice(i, 1);
  save('ec-saved-jds', savedJDs);
  renderSavedJDs();
  updateSelects();
}

// --- Gap Highlighter ---
function updateSelects() {
  const resumeOptions = vaultDocs
    .filter(d => d.type === 'resume')
    .map((d, i) => `<option value="${vaultDocs.indexOf(d)}">${d.name}</option>`)
    .join('');

  const jdOptions = savedJDs
    .map((jd, i) => `<option value="${i}">${jd.title}</option>`)
    .join('');

  const resumeSelects = ['gap-resume-select'];
  const jdSelects = ['gap-jd-select', 'bullet-jd-select'];

  resumeSelects.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<option value="">-- Choose a resume --</option>${resumeOptions}`;
  });

  jdSelects.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<option value="">-- Choose a JD --</option>${jdOptions}`;
  });
}

function runGapAnalysis() {
  const resumeIdx = document.getElementById('gap-resume-select').value;
  const jdIdx = document.getElementById('gap-jd-select').value;
  if (resumeIdx === '' || jdIdx === '') return;

  const resume = vaultDocs[resumeIdx];
  const jd = savedJDs[jdIdx];
  const results = document.getElementById('gap-results');

  const strong = [];
  const partial = [];
  const missing = [];

  jd.keywords.forEach(kw => {
    if (resume.content.toLowerCase().includes(kw.toLowerCase())) {
      strong.push(kw);
    } else {
      missing.push(kw);
    }
  });

  jd.mustHave.forEach(req => {
    const words = req.toLowerCase().split(' ').filter(w => w.length > 4);
    const matches = words.filter(w => resume.content.toLowerCase().includes(w));
    if (matches.length > words.length * 0.6) {
      strong.push(req.substring(0, 60) + (req.length > 60 ? '...' : ''));
    } else if (matches.length > 0) {
      partial.push(req.substring(0, 60) + (req.length > 60 ? '...' : ''));
    } else {
      missing.push(req.substring(0, 60) + (req.length > 60 ? '...' : ''));
    }
  });

  results.innerHTML = `
    <div class="gap-result-card">
      <div class="gap-result-title">${resume.name} → ${jd.title}</div>
      ${strong.length > 0 ? `
        <div class="jd-section-title">Strong matches — already in your resume</div>
        ${strong.map(s => `<div class="gap-item"><div class="gap-dot strong"></div>${s}</div>`).join('')}
      ` : ''}
      ${partial.length > 0 ? `
        <div class="jd-section-title">Partial matches — worth strengthening</div>
        ${partial.map(s => `<div class="gap-item"><div class="gap-dot partial"></div>${s}</div>`).join('')}
      ` : ''}
      ${missing.length > 0 ? `
        <div class="jd-section-title">Gaps — not found in resume</div>
        ${missing.map(s => `<div class="gap-item"><div class="gap-dot missing"></div>${s}</div>`).join('')}
      ` : ''}
    </div>
    <p class="tools-note">Green = strong match · Amber = partial match · Red = not found. Use these gaps to guide which bullets to update or add.</p>
  `;
}

// --- Bullet Workshop (Claude API) ---
async function runBulletWorkshop() {
  const jdIdx = document.getElementById('bullet-jd-select').value;
  const bullet = document.getElementById('bullet-input').value.trim();
  const context = document.getElementById('bullet-context').value.trim();
  if (!bullet || jdIdx === '') return;

  const jd = savedJDs[jdIdx];
  const results = document.getElementById('bullet-results');
  results.innerHTML = '<p class="loading-state">Generating alternatives — this takes about 10 seconds...</p>';

  const prompt = `You are helping a sustainability professional tailor their resume for a specific job application.

Job title: ${jd.title}
Key requirements: ${jd.mustHave.slice(0, 5).join('; ')}
Keywords to include where relevant: ${jd.keywords.slice(0, 10).join(', ')}

Original resume bullet:
"${bullet}"

${context ? `Additional context about this bullet: ${context}` : ''}

Generate exactly 3 alternative versions of this bullet point. Each version should:
- Keep the same factual content and not fabricate any details
- Be more targeted to the job requirements above
- Incorporate relevant keywords naturally where they genuinely apply
- Stay in the candidate's voice — professional but not stiff
- Be a single sentence or two short sentences maximum

Format your response as JSON only, no other text:
{
  "alternatives": [
    {"label": "Emphasizes [key aspect]", "text": "bullet text here"},
    {"label": "Emphasizes [key aspect]", "text": "bullet text here"},
    {"label": "Emphasizes [key aspect]", "text": "bullet text here"}
  ]
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (data.error) {
      results.innerHTML = `<p class="loading-state">API error: ${data.error.message}. Check your API key in Netlify environment variables.</p>`;
      return;
    }

    const text = data.content[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    results.innerHTML = `
      <div class="bullet-result-card">
        <div class="bullet-result-title">Original bullet</div>
        <div class="bullet-option" style="border-color:rgba(26,26,46,0.15);cursor:default;">${bullet}</div>
        <div class="bullet-result-title" style="margin-top:1rem;">Alternatives — click to copy</div>
        ${parsed.alternatives.map(alt => `
          <div class="bullet-option" onclick="copyBullet(this, '${alt.text.replace(/'/g, "\\'")}')">
            <div class="bullet-option-label">${alt.label}</div>
            ${alt.text}
          </div>
        `).join('')}
      </div>
      <p class="tools-note">Review each option carefully. These are suggestions — edit freely before using.</p>
    `;
  } catch (err) {
    results.innerHTML = `<p class="loading-state">Something went wrong: ${err.message}</p>`;
  }
}

function copyBullet(el, text) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = el.style.borderColor;
    el.style.borderColor = '#1e3d1e';
    el.style.background = '#e8f4ec';
    setTimeout(() => {
      el.style.borderColor = orig;
      el.style.background = '#f5f0e4';
    }, 1000);
  });
}

// Initialize tools on load
function initTools() {
  renderVault();
  renderSavedJDs();
  updateSelects();
}