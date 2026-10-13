/* ============ AssetTrack · Application Logic ============ */
(() => {
  'use strict';

  /* ---------- Constants ---------- */
  const STORAGE_KEY = 'assettrack_v1';
  const THEME_KEY = 'assettrack_theme';
  const STATUSES = ['Available', 'Assigned', 'Damaged', 'Missing', 'Maintenance', 'Retired'];
  const TYPES = ['Laptop', 'Monitor', 'Phone', 'Tablet', 'Keyboard', 'Headset', 'Other'];
  const TYPE_ICON = { Laptop: '💻', Monitor: '🖥️', Phone: '📱', Tablet: '📲', Keyboard: '⌨️', Headset: '🎧', Other: '📦' };
  const STATUS_COLOR = { Available: '#34d399', Assigned: '#60a5fa', Damaged: '#fb923c', Missing: '#f87171', Maintenance: '#c084fc', Retired: '#94a3b8' };

  /* ---------- Helpers ---------- */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = (p) => p + Math.random().toString(36).slice(2, 8).toUpperCase();
  const today = () => new Date().toISOString().slice(0, 10);
  const initials = (n) => n.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
  const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeAgo = (iso) => {
    const s = (Date.now() - new Date(iso)) / 1000;
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + ' min ago';
    if (s < 86400) return Math.floor(s / 3600) + ' hr ago';
    if (s < 86400 * 30) return Math.floor(s / 86400) + ' days ago';
    return fmtDate(iso);
  };
  const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

  /* ---------- Data ---------- */
  function seed() {
    const employees = [
      { id: 'E1', name: 'Aarav Sharma', dept: 'Engineering', email: 'aarav@company.com' },
      { id: 'E2', name: 'Priya Verma', dept: 'Design', email: 'priya@company.com' },
      { id: 'E3', name: 'Rohan Gupta', dept: 'Sales', email: 'rohan@company.com' },
      { id: 'E4', name: 'Sneha Iyer', dept: 'HR', email: 'sneha@company.com' },
      { id: 'E5', name: 'Vikram Singh', dept: 'Finance', email: 'vikram@company.com' },
    ];
    const assets = [
      { id: 'A1', tag: 'LT-1001', name: 'MacBook Pro 14"', type: 'Laptop', serial: 'C02XK1', status: 'Assigned', assignedTo: 'E1', value: 189900, date: '2025-02-10' },
      { id: 'A2', tag: 'LT-1002', name: 'Dell XPS 15', type: 'Laptop', serial: 'DX15A9', status: 'Assigned', assignedTo: 'E2', value: 145000, date: '2025-03-22' },
      { id: 'A3', tag: 'LT-1003', name: 'Lenovo ThinkPad T14', type: 'Laptop', serial: 'TP14B7', status: 'Available', assignedTo: null, value: 98000, date: '2025-06-05' },
      { id: 'A4', tag: 'MN-2001', name: 'LG UltraFine 27"', type: 'Monitor', serial: 'LG27U1', status: 'Assigned', assignedTo: 'E1', value: 32000, date: '2025-02-10' },
      { id: 'A5', tag: 'MN-2002', name: 'Dell U2723QE', type: 'Monitor', serial: 'DU27Q3', status: 'Damaged', assignedTo: 'E3', value: 41000, date: '2024-11-18' },
      { id: 'A6', tag: 'PH-3001', name: 'iPhone 15', type: 'Phone', serial: 'IP15F4', status: 'Assigned', assignedTo: 'E3', value: 79900, date: '2025-04-01' },
      { id: 'A7', tag: 'PH-3002', name: 'Samsung Galaxy S24', type: 'Phone', serial: 'SG24K8', status: 'Missing', assignedTo: 'E5', value: 74999, date: '2025-01-15' },
      { id: 'A8', tag: 'TB-4001', name: 'iPad Air', type: 'Tablet', serial: 'IA5M22', status: 'Available', assignedTo: null, value: 59900, date: '2025-07-09' },
      { id: 'A9', tag: 'KB-5001', name: 'Logitech MX Keys', type: 'Keyboard', serial: 'LK8801', status: 'Maintenance', assignedTo: null, value: 9500, date: '2024-09-12' },
      { id: 'A10', tag: 'HS-6001', name: 'Sony WH-1000XM5', type: 'Headset', serial: 'SW5X91', status: 'Assigned', assignedTo: 'E4', value: 29990, date: '2025-05-30' },
      { id: 'A11', tag: 'LT-1004', name: 'HP EliteBook 840', type: 'Laptop', serial: 'HP840C', status: 'Retired', assignedTo: null, value: 85000, date: '2021-08-14' },
      { id: 'A12', tag: 'MN-2003', name: 'Samsung Odyssey 32"', type: 'Monitor', serial: 'SO32G5', status: 'Available', assignedTo: null, value: 38000, date: '2025-08-20' },
    ];
    const issues = [
      { id: 'I1', assetId: 'A5', kind: 'Damaged', desc: 'Cracked screen after fall from desk.', reportedBy: 'Rohan Gupta', date: daysAgo(3), status: 'Open' },
      { id: 'I2', assetId: 'A7', kind: 'Missing', desc: 'Phone not found after client visit in Noida.', reportedBy: 'Vikram Singh', date: daysAgo(1), status: 'Open' },
    ];
    const activity = [
      { id: 'L1', text: 'Reported <b>Samsung Galaxy S24</b> as Missing', color: STATUS_COLOR.Missing, date: daysAgo(1) },
      { id: 'L2', text: 'Reported <b>Dell U2723QE</b> as Damaged', color: STATUS_COLOR.Damaged, date: daysAgo(3) },
      { id: 'L3', text: 'Assigned <b>Sony WH-1000XM5</b> to Sneha Iyer', color: STATUS_COLOR.Assigned, date: daysAgo(6) },
      { id: 'L4', text: 'Added <b>iPad Air</b> to inventory', color: STATUS_COLOR.Available, date: daysAgo(9) },
    ];
    return { employees, assets, issues, activity };
  }

  let db = load();
  function load() {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) return JSON.parse(raw); } catch (e) { /* ignore */ }
    return seed();
  }
  function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); } catch (e) { /* ignore */ } updateBadge(); }
  const getAsset = (id) => db.assets.find((a) => a.id === id);
  const getEmp = (id) => db.employees.find((e) => e.id === id);
  function log(text, color) {
    db.activity.unshift({ id: uid('L'), text, color: color || 'var(--primary)', date: new Date().toISOString() });
    db.activity = db.activity.slice(0, 60);
  }

  /* ---------- State ---------- */
  const state = { view: 'dashboard', search: '', statusFilter: 'All', typeFilter: 'All', issueFilter: 'All' };
  const viewEl = $('#view');

  /* ---------- Toasts ---------- */
  function toast(msg, color = 'var(--green)', icon = '✅') {
    const t = document.createElement('div');
    t.className = 'toast';
    t.style.setProperty('--c', color);
    t.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
    $('#toasts').appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, 3200);
  }

  /* ---------- Modal ---------- */
  let modalSubmit = null;
  function openModal({ title, fields = [], note = '', submit = 'Save', danger = false, onSubmit }) {
    $('#modalTitle').textContent = title;
    $('#modalSubmit').textContent = submit;
    $('#modalSubmit').className = 'btn ' + (danger ? 'danger' : 'primary');
    const body = $('#modalBody');
    body.innerHTML = (note ? `<p class="modal-note">${note}</p>` : '') + fields.map((f) => {
      const cls = 'field' + (f.half ? ' half' : '');
      let input;
      if (f.type === 'select') {
        input = `<select name="${f.name}" ${f.required ? 'required' : ''}>${f.options.map(([v, l]) => `<option value="${esc(v)}" ${String(f.value) === String(v) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
      } else if (f.type === 'textarea') {
        input = `<textarea name="${f.name}" rows="3" placeholder="${esc(f.placeholder || '')}" ${f.required ? 'required' : ''}>${esc(f.value || '')}</textarea>`;
      } else {
        input = `<input type="${f.type || 'text'}" name="${f.name}" value="${esc(f.value ?? '')}" placeholder="${esc(f.placeholder || '')}" ${f.required ? 'required' : ''} />`;
      }
      return `<div class="${cls}"><label>${f.label}${f.required ? ' *' : ''}</label>${input}</div>`;
    }).join('');
    modalSubmit = onSubmit;
    $('#modalBackdrop').classList.add('open');
    setTimeout(() => { const first = body.querySelector('input,select,textarea'); first && first.focus(); }, 300);
  }
  function closeModal() { $('#modalBackdrop').classList.remove('open'); modalSubmit = null; }
  $('#modalClose').onclick = closeModal;
  $('#modalCancel').onclick = closeModal;
  $('#modalBackdrop').addEventListener('mousedown', (e) => { if (e.target.id === 'modalBackdrop') closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  $('#modalForm').addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    $$('.field', e.target).forEach((f) => {
      const inp = f.querySelector('input,select,textarea');
      const bad = inp && inp.required && !inp.value.trim();
      f.classList.toggle('invalid', !!bad);
      if (bad) ok = false;
    });
    if (!ok) return;
    const data = Object.fromEntries(new FormData(e.target).entries());
    if (modalSubmit) modalSubmit(data);
    closeModal();
  });

  /* ---------- Actions ---------- */
  function assetForm(asset) {
    const edit = !!asset;
    openModal({
      title: edit ? 'Edit Asset' : 'Add New Asset',
      submit: edit ? 'Save Changes' : 'Add Asset',
      fields: [
        { name: 'name', label: 'Asset name', required: true, value: asset?.name, placeholder: 'e.g. MacBook Air M3' },
        { name: 'type', label: 'Type', type: 'select', half: true, value: asset?.type || 'Laptop', options: TYPES.map((t) => [t, TYPE_ICON[t] + ' ' + t]) },
        { name: 'tag', label: 'Asset tag', half: true, required: true, value: asset?.tag || autoTag(), placeholder: 'LT-1005' },
        { name: 'serial', label: 'Serial number', half: true, required: true, value: asset?.serial, placeholder: 'SN12345' },
        { name: 'value', label: 'Value (₹)', type: 'number', half: true, value: asset?.value ?? '', placeholder: '75000' },
        { name: 'date', label: 'Purchase date', type: 'date', value: asset?.date || today() },
      ],
      onSubmit: (d) => {
        if (edit) {
          Object.assign(asset, { name: d.name.trim(), type: d.type, tag: d.tag.trim(), serial: d.serial.trim(), value: +d.value || 0, date: d.date });
          log(`Updated details of <b>${esc(asset.name)}</b>`, 'var(--primary-2)');
          toast('Asset updated');
        } else {
          db.assets.unshift({ id: uid('A'), name: d.name.trim(), type: d.type, tag: d.tag.trim(), serial: d.serial.trim(), value: +d.value || 0, date: d.date, status: 'Available', assignedTo: null });
          log(`Added <b>${esc(d.name)}</b> to inventory`, STATUS_COLOR.Available);
          toast('Asset added to inventory');
        }
        save(); render();
      },
    });
  }
  function autoTag() { return 'AS-' + (1000 + db.assets.length + 1); }

  function assignAsset(asset) {
    if (!db.employees.length) return toast('Add an employee first', 'var(--orange)', '⚠️');
    openModal({
      title: 'Assign Asset',
      submit: 'Assign',
      note: `Assign <b>${esc(asset.name)}</b> (${esc(asset.tag)}) to an employee.`,
      fields: [{ name: 'emp', label: 'Employee', type: 'select', required: true, options: db.employees.map((e) => [e.id, `${e.name} · ${e.dept}`]) }],
      onSubmit: (d) => {
        asset.status = 'Assigned'; asset.assignedTo = d.emp;
        log(`Assigned <b>${esc(asset.name)}</b> to ${esc(getEmp(d.emp).name)}`, STATUS_COLOR.Assigned);
        save(); render(); toast(`Assigned to ${getEmp(d.emp).name}`, 'var(--blue)', '🔗');
      },
    });
  }
  function returnAsset(asset) {
    const who = getEmp(asset.assignedTo)?.name || 'employee';
    asset.status = 'Available'; asset.assignedTo = null;
    log(`<b>${esc(asset.name)}</b> returned by ${esc(who)}`, STATUS_COLOR.Available);
    save(); render(); toast('Asset returned to stock');
  }
  function reportIssue(asset, kind) {
    openModal({
      title: 'Report Missing / Damaged',
      submit: 'Submit Report',
      danger: true,
      fields: [
        { name: 'assetId', label: 'Asset', type: 'select', required: true, value: asset?.id, options: db.assets.filter((a) => a.status !== 'Retired').map((a) => [a.id, `${a.tag} · ${a.name}`]) },
        { name: 'kind', label: 'Issue type', type: 'select', value: kind || 'Damaged', options: [['Damaged', '🛠️ Damaged'], ['Missing', '❓ Missing']] },
        { name: 'desc', label: 'What happened?', type: 'textarea', required: true, placeholder: 'Describe the damage or the circumstances of the loss…' },
      ],
      onSubmit: (d) => {
        const a = getAsset(d.assetId);
        const reporter = getEmp(a.assignedTo)?.name || 'Admin';
        a.status = d.kind;
        db.issues.unshift({ id: uid('I'), assetId: a.id, kind: d.kind, desc: d.desc.trim(), reportedBy: reporter, date: new Date().toISOString(), status: 'Open' });
        log(`Reported <b>${esc(a.name)}</b> as ${d.kind}`, STATUS_COLOR[d.kind]);
        save(); render(); toast(`${a.name} flagged as ${d.kind}`, STATUS_COLOR[d.kind], '🚨');
      },
    });
  }
  function resolveIssue(issue) {
    const a = getAsset(issue.assetId);
    openModal({
      title: 'Resolve Issue',
      submit: 'Resolve',
      note: `<b>${esc(a?.name || 'Asset')}</b> was reported <b>${issue.kind}</b>. Choose the outcome:`,
      fields: [{ name: 'outcome', label: 'Outcome', type: 'select', options: [['Available', '✅ Repaired / Recovered — back in stock'], ['Assigned', '🔗 Recovered — still with employee'], ['Maintenance', '🔧 Send to maintenance'], ['Retired', '🗄️ Write-off / Retire']] }],
      onSubmit: (d) => {
        issue.status = 'Resolved'; issue.resolvedOn = new Date().toISOString();
        if (a) {
          if (d.outcome === 'Assigned' && !a.assignedTo) a.status = 'Available';
          else a.status = d.outcome;
          if (['Available', 'Maintenance', 'Retired'].includes(a.status)) a.assignedTo = null;
          log(`Resolved ${issue.kind.toLowerCase()} report for <b>${esc(a.name)}</b> → ${a.status}`, STATUS_COLOR[a.status]);
        }
        save(); render(); toast('Issue resolved');
      },
    });
  }
  function deleteAsset(asset) {
    openModal({
      title: 'Delete Asset', submit: 'Delete', danger: true,
      note: `Permanently delete <b>${esc(asset.name)}</b> (${esc(asset.tag)})? This also removes its issue reports.`,
      onSubmit: () => {
        db.assets = db.assets.filter((a) => a.id !== asset.id);
        db.issues = db.issues.filter((i) => i.assetId !== asset.id);
        log(`Deleted <b>${esc(asset.name)}</b>`, STATUS_COLOR.Retired);
        save(); render(); toast('Asset deleted', 'var(--red)', '🗑️');
      },
    });
  }
  function addEmployee() {
    openModal({
      title: 'Add Employee', submit: 'Add Employee',
      fields: [
        { name: 'name', label: 'Full name', required: true, placeholder: 'e.g. Neha Kapoor' },
        { name: 'dept', label: 'Department', half: true, required: true, placeholder: 'Marketing' },
        { name: 'email', label: 'Email', type: 'email', half: true, required: true, placeholder: 'neha@company.com' },
      ],
      onSubmit: (d) => {
        db.employees.push({ id: uid('E'), name: d.name.trim(), dept: d.dept.trim(), email: d.email.trim() });
        log(`Added employee <b>${esc(d.name)}</b>`, 'var(--primary)');
        save(); render(); toast('Employee added');
      },
    });
  }
  function exportCSV() {
    const rows = [['Tag', 'Name', 'Type', 'Serial', 'Status', 'Assigned To', 'Value', 'Purchase Date']];
    db.assets.forEach((a) => rows.push([a.tag, a.name, a.type, a.serial, a.status, getEmp(a.assignedTo)?.name || '', a.value, a.date]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = 'assets-report.csv'; a.click(); URL.revokeObjectURL(url);
    toast('CSV exported', 'var(--primary-2)', '📥');
  }

  /* ---------- Views ---------- */
  const pill = (s) => `<span class="pill st-${s}">${s}</span>`;

  function viewDashboard() {
    const count = (s) => db.assets.filter((a) => a.status === s).length;
    const total = db.assets.length;
    const stats = [
      ['📦', 'Total Assets', total, '#7c6cff'],
      ['🔗', 'Assigned', count('Assigned'), STATUS_COLOR.Assigned],
      ['✅', 'Available', count('Available'), STATUS_COLOR.Available],
      ['🛠️', 'Damaged', count('Damaged'), STATUS_COLOR.Damaged],
      ['❓', 'Missing', count('Missing'), STATUS_COLOR.Missing],
    ];
    const open = db.issues.filter((i) => i.status === 'Open');
    const typeCounts = TYPES.map((t) => [t, db.assets.filter((a) => a.type === t).length]).filter((x) => x[1] > 0);
    const maxT = Math.max(1, ...typeCounts.map((x) => x[1]));
    const totalValue = db.assets.filter((a) => a.status !== 'Retired').reduce((s, a) => s + (+a.value || 0), 0);
    const atRisk = db.assets.filter((a) => ['Missing', 'Damaged'].includes(a.status)).reduce((s, a) => s + (+a.value || 0), 0);

    return `
      <div class="page-head">
        <div><h2>Welcome back, Admin 👋</h2><p>Portfolio value <b>${money(totalValue)}</b> · Value at risk <b style="color:var(--red)">${money(atRisk)}</b></p></div>
        <div class="head-actions"><button class="btn ghost" data-act="report">🚨 Report issue</button><button class="btn primary" data-act="add">＋ New Asset</button></div>
      </div>
      <div class="stats stagger">
        ${stats.map(([ico, l, n, c], i) => `<div class="stat glass tilt" style="--c:${c};--i:${i}"><div class="s-ico">${ico}</div><div class="s-num" data-count="${n}">0</div><div class="s-label">${l}</div></div>`).join('')}
      </div>
      <div class="grid-2 stagger">
        <div class="card glass" style="--i:5"><h3>Asset status <small>${total} total</small></h3>
          <div class="donut-wrap">
            <div class="donut"><svg viewBox="0 0 200 200" id="donut"><circle class="track" cx="100" cy="100" r="80"/></svg><div class="donut-center"><b>${total}</b><span>assets</span></div></div>
            <div class="legend">${STATUSES.map((s) => `<div><i style="background:${STATUS_COLOR[s]}"></i>${s}<b>${count(s)}</b></div>`).join('')}</div>
          </div>
        </div>
        <div class="card glass" style="--i:6"><h3>Assets by type</h3>
          <div class="bars">${typeCounts.map(([t, n]) => `<div class="bar-row"><span>${TYPE_ICON[t]} ${t}</span><div class="bar-track"><div class="bar-fill" data-w="${(n / maxT) * 100}"></div></div><b>${n}</b></div>`).join('') || '<div class="empty">No assets yet</div>'}</div>
        </div>
      </div>
      <div class="grid-2b stagger">
        <div class="card glass" style="--i:7"><h3>Open issues <small>${open.length} need attention</small></h3>
          <div class="list">${open.map((i) => issueItem(i)).join('') || '<div class="empty"><span class="e-ico">🎉</span>All clear — no open issues</div>'}</div>
        </div>
        <div class="card glass" style="--i:8"><h3>Recent activity</h3>
          <div class="list">${db.activity.slice(0, 6).map((a) => `<div class="list-item"><div class="li-ico" style="background:color-mix(in srgb, ${a.color} 22%, transparent)">•</div><div class="li-main"><strong style="white-space:normal">${a.text}</strong><small>${timeAgo(a.date)}</small></div></div>`).join('')}</div>
        </div>
      </div>`;
  }
  function issueItem(i) {
    const a = getAsset(i.assetId);
    return `<div class="list-item"><div class="li-ico">${i.kind === 'Missing' ? '❓' : '🛠️'}</div><div class="li-main"><strong>${esc(a?.name || 'Deleted asset')}</strong><small>${esc(i.desc)} · ${timeAgo(i.date)}</small></div>${pill(i.kind)}</div>`;
  }

  function viewAssets() {
    const q = state.search.toLowerCase();
    const list = db.assets.filter((a) => {
      if (state.statusFilter !== 'All' && a.status !== state.statusFilter) return false;
      if (state.typeFilter !== 'All' && a.type !== state.typeFilter) return false;
      if (!q) return true;
      return [a.name, a.tag, a.serial, a.type, a.status, getEmp(a.assignedTo)?.name].join(' ').toLowerCase().includes(q);
    });
    return `
      <div class="page-head"><div><h2>Assets</h2><p>${list.length} of ${db.assets.length} assets shown</p></div>
        <div class="head-actions"><button class="btn ghost" data-act="export">📥 Export CSV</button><button class="btn primary" data-act="add">＋ New Asset</button></div></div>
      <div class="toolbar">
        <div class="chips">${['All', ...STATUSES].map((s) => `<button class="chip ${state.statusFilter === s ? 'active' : ''}" data-status="${s}">${s}</button>`).join('')}</div>
        <select class="select" id="typeFilter"><option value="All">All types</option>${TYPES.map((t) => `<option ${state.typeFilter === t ? 'selected' : ''}>${t}</option>`).join('')}</select>
      </div>
      <div class="glass table-wrap"><table>
        <thead><tr><th>Asset</th><th>Serial</th><th>Status</th><th>Assigned to</th><th>Value</th><th>Actions</th></tr></thead>
        <tbody>${list.map((a, i) => `
          <tr style="--i:${Math.min(i, 14)}">
            <td><div class="asset-cell"><div class="li-ico">${TYPE_ICON[a.type]}</div><div><strong>${esc(a.name)}</strong><small>${esc(a.tag)} · ${esc(a.type)}</small></div></div></td>
            <td>${esc(a.serial)}</td>
            <td>${pill(a.status)}</td>
            <td>${a.assignedTo ? esc(getEmp(a.assignedTo)?.name || '—') : '<span style="color:var(--muted)">—</span>'}</td>
            <td>${money(a.value)}</td>
            <td><div class="row-actions">
              ${a.status === 'Available' ? `<button class="mini" data-row="assign" data-id="${a.id}">Assign</button>` : ''}
              ${a.status === 'Assigned' ? `<button class="mini" data-row="return" data-id="${a.id}">Return</button>` : ''}
              ${['Available', 'Assigned', 'Maintenance'].includes(a.status) ? `<button class="mini warn" data-row="report" data-id="${a.id}">Report</button>` : ''}
              <button class="mini" data-row="edit" data-id="${a.id}">Edit</button>
              <button class="mini del" data-row="delete" data-id="${a.id}">✕</button>
            </div></td>
          </tr>`).join('') || `<tr><td colspan="6"><div class="empty"><span class="e-ico">🔍</span>No assets match your filters</div></td></tr>`}
        </tbody></table></div>`;
  }

  function viewEmployees() {
    const q = state.search.toLowerCase();
    const list = db.employees.filter((e) => !q || [e.name, e.dept, e.email].join(' ').toLowerCase().includes(q));
    return `
      <div class="page-head"><div><h2>Employees</h2><p>${db.employees.length} team members and their equipment</p></div>
        <div class="head-actions"><button class="btn primary" data-act="addEmp">＋ Add Employee</button></div></div>
      <div class="emp-grid stagger">${list.map((e, i) => {
        const items = db.assets.filter((a) => a.assignedTo === e.id);
        return `<div class="emp glass tilt" style="--i:${i}">
          <div class="emp-top"><div class="avatar">${initials(e.name)}</div><div><strong>${esc(e.name)}</strong><small>${esc(e.dept)} · ${esc(e.email)}</small></div></div>
          <div class="tags">${items.map((a) => `<span class="tag">${TYPE_ICON[a.type]} ${esc(a.name)}</span>`).join('') || '<span class="tag" style="color:var(--muted)">No assets assigned</span>'}</div>
        </div>`;
      }).join('') || '<div class="empty glass card">No employees found</div>'}</div>`;
  }

  function viewReports() {
    const f = state.issueFilter;
    const list = db.issues.filter((i) => f === 'All' || i.status === f || i.kind === f);
    return `
      <div class="page-head"><div><h2>Issue Reports</h2><p>Track missing and damaged equipment</p></div>
        <div class="head-actions"><button class="btn primary" data-act="report">🚨 New report</button></div></div>
      <div class="toolbar"><div class="chips">${['All', 'Open', 'Resolved', 'Missing', 'Damaged'].map((s) => `<button class="chip ${f === s ? 'active' : ''}" data-issue="${s}">${s}</button>`).join('')}</div></div>
      <div class="glass table-wrap"><table>
        <thead><tr><th>Asset</th><th>Type</th><th>Description</th><th>Reported by</th><th>Date</th><th>Status</th><th></th></tr></thead>
        <tbody>${list.map((i, n) => {
          const a = getAsset(i.assetId);
          return `<tr style="--i:${Math.min(n, 14)}">
            <td><div class="asset-cell"><div class="li-ico">${a ? TYPE_ICON[a.type] : '❔'}</div><div><strong>${esc(a?.name || 'Deleted asset')}</strong><small>${esc(a?.tag || '')}</small></div></div></td>
            <td>${pill(i.kind)}</td><td style="max-width:260px">${esc(i.desc)}</td><td>${esc(i.reportedBy)}</td><td>${fmtDate(i.date)}</td><td>${pill(i.status)}</td>
            <td>${i.status === 'Open' ? `<button class="mini" data-row="resolve" data-id="${i.id}">Resolve</button>` : ''}</td></tr>`;
        }).join('') || `<tr><td colspan="7"><div class="empty"><span class="e-ico">🎉</span>No reports here</div></td></tr>`}</tbody></table></div>`;
  }

  function viewActivity() {
    return `<div class="page-head"><div><h2>Activity Log</h2><p>Every change, in order</p></div></div>
      <div class="timeline stagger">${db.activity.map((a, i) => `<div class="t-item" style="--i:${Math.min(i, 14)};--c:${a.color}"><div>${a.text}</div><small>${timeAgo(a.date)} · ${fmtDate(a.date)}</small></div>`).join('') || '<div class="empty">No activity yet</div>'}</div>`;
  }

  const VIEWS = { dashboard: viewDashboard, assets: viewAssets, employees: viewEmployees, reports: viewReports, activity: viewActivity };

  /* ---------- Render + post-render effects ---------- */
  function render() {
    viewEl.innerHTML = VIEWS[state.view]();
    afterRender();
    updateBadge();
  }
  function afterRender() {
    // count-up numbers
    $$('[data-count]', viewEl).forEach((el) => {
      const target = +el.dataset.count; const dur = 1100; const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    // bars
    setTimeout(() => $$('.bar-fill', viewEl).forEach((b) => (b.style.width = b.dataset.w + '%')), 250);
    // donut
    const donut = $('#donut', viewEl);
    if (donut) {
      const total = db.assets.length || 1; const C = 2 * Math.PI * 80; let offset = 0;
      STATUSES.forEach((s) => {
        const n = db.assets.filter((a) => a.status === s).length; if (!n) return;
        const len = (n / total) * C;
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', 100); c.setAttribute('cy', 100); c.setAttribute('r', 80);
        c.setAttribute('stroke', STATUS_COLOR[s]);
        c.style.strokeDasharray = `0 ${C}`; c.style.strokeDashoffset = -offset;
        donut.appendChild(c);
        setTimeout(() => (c.style.strokeDasharray = `${Math.max(0, len - 3)} ${C}`), 300);
        offset += len;
      });
    }
  }

  /* ---------- Navigation ---------- */
  function moveIndicator() {
    const active = $('.nav-item.active'); const ind = $('#navIndicator');
    if (active) { ind.style.height = active.offsetHeight + 'px'; ind.style.transform = `translateY(${active.offsetTop}px)`; }
  }
  function navigate(view) {
    if (view === state.view && viewEl.innerHTML) return;
    state.view = view;
    $$('.nav-item').forEach((n) => n.classList.toggle('active', n.dataset.view === view));
    moveIndicator();
    viewEl.classList.add('leaving');
    setTimeout(() => {
      viewEl.classList.remove('leaving');
      viewEl.style.animation = 'none'; void viewEl.offsetWidth; viewEl.style.animation = '';
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 230);
    $('#sidebar').classList.remove('open');
  }
  function updateBadge() {
    const n = db.issues.filter((i) => i.status === 'Open').length;
    const b = $('#issueBadge'); b.textContent = n; b.classList.toggle('zero', !n);
  }

  /* ---------- Events ---------- */
  $('#nav').addEventListener('click', (e) => { const b = e.target.closest('.nav-item'); if (b) navigate(b.dataset.view); });
  $('#addAssetBtn').onclick = () => assetForm();
  $('#menuBtn').onclick = () => $('#sidebar').classList.toggle('open');
  $('#resetBtn').onclick = () => openModal({
    title: 'Reset demo data', submit: 'Reset', danger: true,
    note: 'This replaces all current data with the original demo data.',
    onSubmit: () => { db = seed(); save(); render(); toast('Demo data restored', 'var(--primary-2)', '↺'); },
  });

  $('#globalSearch').addEventListener('input', (e) => {
    state.search = e.target.value;
    if (!['assets', 'employees'].includes(state.view)) { navigate('assets'); return; }
    render();
    $('#globalSearch').focus();
  });

  viewEl.addEventListener('click', (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'add') return assetForm();
    if (act === 'report') return reportIssue();
    if (act === 'export') return exportCSV();
    if (act === 'addEmp') return addEmployee();
    const status = e.target.closest('[data-status]')?.dataset.status;
    if (status) { state.statusFilter = status; return render(); }
    const issue = e.target.closest('[data-issue]')?.dataset.issue;
    if (issue) { state.issueFilter = issue; return render(); }
    const row = e.target.closest('[data-row]');
    if (row) {
      const id = row.dataset.id; const a = getAsset(id);
      ({
        assign: () => assignAsset(a), return: () => returnAsset(a), report: () => reportIssue(a),
        edit: () => assetForm(a), delete: () => deleteAsset(a),
        resolve: () => resolveIssue(db.issues.find((i) => i.id === id)),
      })[row.dataset.row]();
    }
  });
  viewEl.addEventListener('change', (e) => { if (e.target.id === 'typeFilter') { state.typeFilter = e.target.value; render(); } });

  // Ripple effect on buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn'); if (!btn) return;
    const r = btn.getBoundingClientRect(); const s = Math.max(r.width, r.height);
    const span = document.createElement('span'); span.className = 'ripple';
    span.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    btn.appendChild(span); setTimeout(() => span.remove(), 600);
  });

  // 3D tilt on cards
  viewEl.addEventListener('mousemove', (e) => {
    const c = e.target.closest('.tilt'); if (!c) return;
    const r = c.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    c.style.transform = `perspective(700px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg) translateY(-6px)`;
  });
  viewEl.addEventListener('mouseout', (e) => { const c = e.target.closest('.tilt'); if (c && !c.contains(e.relatedTarget)) c.style.transform = ''; });

  // Theme
  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    $('#themeBtn').textContent = t === 'dark' ? '🌙' : '☀️';
    try { localStorage.setItem(THEME_KEY, t); } catch (e) { /* ignore */ }
  }
  $('#themeBtn').onclick = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  let savedTheme = 'dark'; try { savedTheme = localStorage.getItem(THEME_KEY) || 'dark'; } catch (e) { /* ignore */ }
  setTheme(savedTheme);

  window.addEventListener('resize', moveIndicator);

  /* ---------- Init ---------- */
  render();
  requestAnimationFrame(moveIndicator);
  setTimeout(moveIndicator, 400);
})();
