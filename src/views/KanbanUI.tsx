import { Layout } from './Layout';

export const KanbanUI = ({ username, telegramId, autoDeleteDays }: { username: string, telegramId: string | null, autoDeleteDays: number | null }) => (
  <Layout title="PAPANMAYA">
    {/* Header */}
    <header class="kanban-header">
      <div class="kanban-brand">
        <div class="kanban-logo">PM</div>
        <div class="kanban-brand-text">
          <div class="kanban-title">PAPANMAYA</div>
          <div class="kanban-subtitle">Dark board • <span style="color:var(--text);">@{username}</span></div>
        </div>
        <div class="kanban-user-chip" title="Active user">
          <span class="kanban-user-dot"></span>
          {username}
        </div>
      </div>
      <div class="kanban-actions">
        <button onclick="document.getElementById('settingsModal').showModal()" class="btn-violet" style="padding:9px 14px; font-size:0.82rem;">⚙️ Settings</button>
        <a href="/auth/logout" class="kanban-logout">Logout</a>
      </div>
    </header>

    {/* Board */}
    <div class="board">
      <div class="col" id="col-todo" ondragover="allowDrop(event)" ondrop="drop(event, 'todo')">
        <div class="col-header">
          <div class="col-title">
            <span class="col-dot" style="background:var(--todo);"></span>
            To Do
            <span class="col-count" id="count-todo">0</span>
          </div>
          <button onclick="openModal()" class="col-add" title="Add task">＋</button>
        </div>
        <div id="todo-list" class="list-container"></div>
      </div>
      <div class="col" id="col-inprogress" ondragover="allowDrop(event)" ondrop="drop(event, 'in-progress')">
        <div class="col-header">
          <div class="col-title">
            <span class="col-dot" style="background:var(--progress);"></span>
            In Progress
            <span class="col-count" id="count-inprogress">0</span>
          </div>
        </div>
        <div id="inprogress-list" class="list-container"></div>
      </div>
      <div class="col" id="col-done" ondragover="allowDrop(event)" ondrop="drop(event, 'done')">
        <div class="col-header">
          <div class="col-title">
            <span class="col-dot" style="background:var(--done);"></span>
            Done
            <span class="col-count" id="count-done">0</span>
          </div>
        </div>
        <div id="done-list" class="list-container"></div>
      </div>
    </div>

    {/* Task Modal */}
    <dialog id="taskModal" class="kanban-dialog">
      <div class="dialog-head">
        <h3 id="modalTitle">Task Details</h3>
        <button type="button" onclick="document.getElementById('taskModal').close()" class="dialog-close" aria-label="Close">✕</button>
      </div>
      <input type="hidden" id="taskId" />
      <div class="form-stack">
        <div>
          <label for="mTitle">Title</label>
          <input type="text" id="mTitle" placeholder="e.g. Design new landing page" maxlength={80} />
        </div>
        <div>
          <label for="mDetail">Details</label>
          <textarea id="mDetail" rows={4} placeholder="Description, checklist, links, notes..."></textarea>
        </div>
        <div class="form-grid">
          <div class="date-field"><label for="mStart">Start</label><input type="datetime-local" id="mStart" onclick="try{this.showPicker&&this.showPicker()}catch(e){}" /></div>
          <div class="date-field"><label for="mDeadline">Deadline</label><input type="datetime-local" id="mDeadline" onclick="try{this.showPicker&&this.showPicker()}catch(e){}" /></div>
        </div>
      </div>
      <div class="dialog-actions">
        <button onclick="saveTask()" class="btn-primary" style="flex:1;">Save</button>
        <button onclick="document.getElementById('taskModal').close()" class="btn-ghost">Close</button>
      </div>
      <div id="deleteArea" style="display:none; margin-top:12px; padding-top:12px; border-top:1px dashed var(--border);">
        <button onclick="deleteCurrentTask()" class="btn-danger" style="width:100%; background:var(--todo-soft); color:var(--todo); border-color:var(--todo-border);">🗑️ Delete Task</button>
        <div style="font-size:0.72rem; color:var(--text-faint); text-align:center; margin-top:6px; font-family:'JetBrains Mono',monospace;">This action cannot be undone</div>
      </div>
      <div style="font-size:0.74rem; color:var(--text-faint); margin-top:10px; text-align:center; font-family:'JetBrains Mono',monospace;">Tip: Click card to edit • Drag to change status</div>
    </dialog>

    {/* Settings Modal */}
    <dialog id="settingsModal" class="kanban-dialog">
      <div class="dialog-head">
        <h3>Settings</h3>
        <button type="button" onclick="document.getElementById('settingsModal').close()" class="dialog-close">✕</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:18px;">
        {/* Telegram */}
        <div>
          <p style="color:var(--text-muted); font-size:0.88rem; margin:0 0 10px; line-height:1.5;">Connect your <strong style="color:var(--text);">Telegram ID</strong> for deadline alerts (6h before) & bot commands <code style="background:var(--surface-raised); border:1px solid var(--border); padding:1px 6px; border-radius:6px; font-family:'JetBrains Mono',monospace; font-size:0.78rem;">/info</code> <code style="background:var(--surface-raised); border:1px solid var(--border); padding:1px 6px; border-radius:6px; font-family:'JetBrains Mono',monospace; font-size:0.78rem;">/list</code>.</p>
          <form action="/user/settings/telegram" method="POST" class="form-stack">
            <div>
              <label for="tgId">Telegram Chat ID</label>
              <input type="text" id="tgId" name="telegram_id" value={telegramId || ''} placeholder="e.g. 123456789" inputmode="numeric" />
              <div style="font-size:0.76rem; color:var(--text-faint); margin-top:6px;">Leave empty if you don't need alerts. Find your ID via <span style="color:var(--cyan);">@userinfobot</span>.</div>
            </div>
            <button type="submit" class="btn-primary" style="background:var(--cyan);">Save ID</button>
          </form>
        </div>

        <div style="height:1px; background:var(--border);"></div>

        {/* Auto-delete */}
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
            <span style="width:28px; height:28px; background:var(--todo-soft); border:1px solid var(--todo-border); border-radius:8px; display:grid; place-items:center; font-size:0.9rem;">🗑️</span>
            <div>
              <div style="font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:0.92rem; letter-spacing:-0.01em;">Auto-Delete</div>
              <div style="font-size:0.76rem; color:var(--text-faint);">Automatically delete <strong style="color:var(--done);">DONE</strong> tasks</div>
            </div>
            {autoDeleteDays ? (
              <span style="margin-left:auto; font-family:'JetBrains Mono',monospace; font-size:0.68rem; background:var(--done-soft); color:var(--done); border:1px solid var(--done-border); padding:3px 8px; border-radius:999px;">ACTIVE • {autoDeleteDays} days</span>
            ) : (
              <span style="margin-left:auto; font-family:'JetBrains Mono',monospace; font-size:0.68rem; background:var(--surface-raised); color:var(--text-faint); border:1px solid var(--border); padding:3px 8px; border-radius:999px;">INACTIVE</span>
            )}
          </div>
          <form action="/user/settings/auto-delete" method="POST" class="form-stack">
            <div>
              <label for="autoDeleteSelect">Auto-delete after</label>
              <select id="autoDeleteSelect" name="auto_delete_days" style="width:100%; padding:11px 12px; font-size:0.9rem; font-family:'Inter',sans-serif; background:#0F0F12; border:1.5px solid var(--border); border-radius:10px; color:var(--text);">
                <option value="" selected={!autoDeleteDays}>Disabled</option>
                <option value="1" selected={autoDeleteDays === 1}>1 day — daily cleanup</option>
                <option value="3" selected={autoDeleteDays === 3}>3 days</option>
                <option value="7" selected={autoDeleteDays === 7}>7 days — weekly</option>
                <option value="14" selected={autoDeleteDays === 14}>14 days</option>
                <option value="30" selected={autoDeleteDays === 30}>30 days — monthly</option>
              </select>
              <div style="font-size:0.76rem; color:var(--text-faint); margin-top:6px; line-height:1.4;">Tasks marked <em style="color:var(--done); font-style:normal; font-weight:600;">DONE</em> will be deleted automatically on schedule. Timer starts from last update to DONE.</div>
            </div>
            <div class="dialog-actions" style="margin-top:4px;">
              <button type="submit" class="btn-primary" style="flex:1; background:var(--todo); color:#0A0A0F; border-color:#0A0A0F;">Save Rule</button>
              <button type="button" onclick="document.getElementById('settingsModal').close()" class="btn-ghost">Close</button>
            </div>
          </form>
        </div>
      </div>
    </dialog>

    <style dangerouslySetInnerHTML={{ __html: `
      .kanban-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        background: var(--surface);
        border: 1.5px solid var(--border);
        border-radius: var(--radius-lg);
        padding: 14px 16px;
        box-shadow: var(--shadow-hard);
        margin-bottom: 18px;
        flex-wrap: wrap;
      }
      .kanban-brand { display:flex; align-items:center; gap:14px; min-width: 240px; }
      .kanban-logo {
        width:42px; height:42px;
        background: var(--lime);
        border: 1.5px solid #0A0A0F;
        border-radius: 11px;
        display:grid; place-items:center;
        font-family:'JetBrains Mono',monospace; font-weight:700; font-size:0.9rem; color:#0A0A0F;
        box-shadow: 3px 3px 0px #000;
        flex-shrink:0;
      }
      .kanban-title {
        font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:1.08rem; letter-spacing:-0.02em; line-height:1;
        text-transform: uppercase;
      }
      .kanban-subtitle {
        font-size:0.78rem; color:var(--text-muted); font-family:'Inter',sans-serif; margin-top:2px;
      }
      .kanban-user-chip {
        display:inline-flex; align-items:center; gap:7px;
        background:#0A0A0F; color:var(--text);
        border:1px solid var(--border); padding:6px 10px; border-radius:999px;
        font-family:'JetBrains Mono',monospace; font-size:0.72rem; letter-spacing:0.04em;
        margin-left: 8px;
      }
      .kanban-user-dot { width:7px; height:7px; background:var(--emerald); border-radius:50%; box-shadow:0 0 0 4px rgba(52,211,153,0.18); }
      .kanban-actions { display:flex; align-items:center; gap:10px; margin-left:auto; }
      .kanban-logout {
        display:inline-flex; align-items:center; justify-content:center;
        padding:9px 14px; border-radius:10px;
        background: transparent; color: var(--text-muted);
        border:1.5px solid var(--border); font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:0.82rem; letter-spacing:0.02em; text-transform:uppercase;
        transition: all 0.15s;
      }
      .kanban-logout:hover { color:var(--text); border-color:var(--border-strong); background:var(--surface-raised); text-decoration:none; }

      .col-header {
        display:flex; align-items:center; justify-content:space-between;
        background: var(--surface-raised);
        border:1.5px solid var(--border);
        border-radius: 12px;
        padding: 8px 10px 8px 12px;
        margin-bottom: 12px;
      }
      #col-todo .col-header { background: var(--todo-soft); border-color: var(--todo-border); }
      #col-inprogress .col-header { background: var(--progress-soft); border-color: var(--progress-border); }
      #col-done .col-header { background: var(--done-soft); border-color: var(--done-border); }
      .col-title {
        display:flex; align-items:center; gap:8px;
        font-family:'JetBrains Mono',monospace; font-size:0.74rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;
      }
      #col-todo .col-title { color: var(--todo); }
      #col-inprogress .col-title { color: var(--progress); }
      #col-done .col-title { color: var(--done); }
      .col-dot { width:8px; height:8px; border-radius:50%; display:inline-block; flex-shrink:0; }
      .col-count {
        background:#0A0A0F; color:var(--text); border:1px solid var(--border);
        padding:2px 7px; border-radius:999px; font-size:0.68rem; font-family:'JetBrains Mono',monospace;
        min-width:22px; text-align:center;
      }
      #col-todo .col-count { color: var(--todo); border-color: var(--todo-border); }
      #col-inprogress .col-count { color: var(--progress); border-color: var(--progress-border); }
      #col-done .col-count { color: var(--done); border-color: var(--done-border); }
      .col-add {
        width:28px; height:28px; padding:0; display:grid; place-items:center;
        border-radius:8px; font-size:1rem; line-height:1;
        background: var(--text); color:#0A0A0F; border:1.5px solid #0A0A0F; box-shadow:2px 2px 0px #000;
      }
      .col-add:hover { transform: translate(-1px,-1px); box-shadow:3px 3px 0px #000; }
      .col-add:active { transform: translate(1px,1px); box-shadow:1px 1px 0px #000; }

      .list-container { min-height: 260px; padding-bottom: 8px; display:flex; flex-direction:column; gap:10px; }
      .list-container:empty::after {
        content: 'No tasks yet — click ＋ to add';
        font-size:0.82rem; color:var(--text-faint); text-align:center;
        border:1.5px dashed var(--border); border-radius:12px; padding:24px 14px; margin-top:4px;
        font-family:'JetBrains Mono',monospace;
      }
      #inprogress-list:empty::after { content: 'Drag tasks here to start'; }
      #done-list:empty::after { content: 'Completed tasks will appear here ✓'; }

      .task-card {
        background: var(--surface-raised);
        border: 1.5px solid var(--border);
        border-radius: 14px;
        padding: 14px 14px 12px;
        cursor: grab;
        transition: transform 0.14s, box-shadow 0.14s, border-color 0.14s, background 0.14s;
        box-shadow: 0 2px 12px rgba(0,0,0,0.28);
        position: relative;
      }
      .task-card:hover {
        transform: translateY(-2px);
        border-color: var(--border-strong);
        box-shadow: 0 8px 20px rgba(0,0,0,0.38);
        background: var(--surface-hover);
      }
      .task-card:active { cursor: grabbing; transform: scale(0.99); }
      .task-card::after {
        content:''; position:absolute; inset:0; border-radius:14px; pointer-events:none;
        border:1px solid rgba(255,255,255,0.03);
      }
      .badge {
        display:inline-flex; align-items:center; gap:5px;
        padding:3px 8px; font-size:0.62rem; font-weight:700; letter-spacing:0.07em;
        border-radius:999px; border:1px solid; text-transform:uppercase;
        font-family:'JetBrains Mono',monospace; margin-bottom:9px;
      }
      .badge::before { content:''; width:6px; height:6px; border-radius:50%; background:currentColor; opacity:0.9; }
      .badge.todo { background: var(--todo-soft); color: var(--todo); border-color: var(--todo-border); }
      .badge.in-progress { background: var(--progress-soft); color: var(--progress); border-color: var(--progress-border); }
      .badge.done { background: var(--done-soft); color: var(--done); border-color: var(--done-border); }
      .task-title { font-family:'Space Grotesk',sans-serif; font-size:0.98rem; font-weight:600; letter-spacing:-0.01em; line-height:1.3; margin-bottom:4px; color:var(--text); }
      .task-snippet { font-size:0.82rem; color:var(--text-muted); line-height:1.5; margin-bottom:10px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; min-height:1.2em; }
      .task-dates {
        display:flex; align-items:center; gap:8px; flex-wrap:wrap;
        font-size:0.7rem; font-family:'JetBrains Mono',monospace; color:var(--text-faint);
        border-top:1px solid var(--border); padding-top:8px;
      }
      .task-dates span {
        display:inline-flex; align-items:center; gap:5px;
        background:#0A0A0F; border:1px solid var(--border); padding:3px 7px; border-radius:999px;
      }
      .task-dates span:first-child { color: var(--cyan); }
      .task-dates span:last-child { color: var(--amber); }

      .kanban-dialog {
        background: var(--surface);
        border:1.5px solid var(--border);
        border-radius: 18px;
        padding: 18px;
        box-shadow: var(--shadow-hard-lg), 0 20px 50px rgba(0,0,0,0.5);
        width: min(520px, calc(100% - 24px));
        color: var(--text);
      }
      .kanban-dialog::backdrop { background: rgba(8,8,10,0.68); backdrop-filter: blur(8px); }
      .dialog-head {
        display:flex; align-items:center; justify-content:space-between; gap:12px;
        margin-bottom:14px; padding-bottom:12px; border-bottom:1px solid var(--border);
      }
      .dialog-head h3 {
        font-family:'Space Grotesk',sans-serif; font-size:1.05rem; font-weight:700; letter-spacing:-0.02em; margin:0;
      }
      .dialog-close {
        width:32px; height:32px; padding:0; display:grid; place-items:center;
        border-radius:10px; background:var(--surface-raised); border:1.5px solid var(--border); box-shadow:none; font-size:0.9rem;
      }
      .dialog-close:hover { background:var(--surface-hover); border-color:var(--border-strong); transform:none; box-shadow:none; }
      .form-stack { display:flex; flex-direction:column; gap:12px; }
      .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
      @media (max-width:560px){ .form-grid{ grid-template-columns:1fr; } .kanban-header{ padding:12px; } .kanban-brand{ gap:10px; } }
      .dialog-actions { display:flex; gap:10px; margin-top:14px; }
      .dialog-actions button { flex:1; }
      textarea { resize:vertical; min-height:84px; font-family:'Inter',sans-serif; }
      textarea:focus { border-color:var(--violet); box-shadow:0 0 0 3px rgba(167,139,250,0.15); }
      select:focus { border-color:var(--violet); box-shadow:0 0 0 3px rgba(167,139,250,0.15); outline:none; }
      .btn-danger {
        font-family:'Space Grotesk',sans-serif; font-weight:700; letter-spacing:0.02em; text-transform:uppercase;
        border:1.5px solid var(--todo-border); box-shadow:3px 3px 0px #000;
      }
      .btn-danger:hover { transform: translate(-1px,-1px); box-shadow:4px 4px 0px #000; filter:brightness(1.05); }
      .btn-danger:active { transform: translate(1px,1px); box-shadow:1px 1px 0px #000; }
      /* Drag over feedback */
      .col.drag-over { border-color: var(--violet) !important; box-shadow: 0 0 0 2px rgba(167,139,250,0.2), var(--shadow-hard); }
      .date-field { position: relative; }
      .date-field input[type="datetime-local"] { cursor: pointer; color-scheme: dark; }
      .date-field input[type="datetime-local"]::-webkit-calendar-picker-indicator { cursor: pointer; }
    ` }} />

    <script dangerouslySetInnerHTML={{ __html: `
      let globalTasks = [];
      async function load() {
        const res = await fetch('/api/tasks');
        globalTasks = await res.json();
        render();
      }
      function formatDT(ts) {
        if(!ts) return '-';
        return new Date(ts).toLocaleString('en-US', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'});
      }
      function render() {
        ['todo', 'inprogress', 'done'].forEach(id => document.getElementById(id+'-list').innerHTML = '');
        const counts = { todo:0, 'in-progress':0, done:0 };
        globalTasks.forEach(t => {
          counts[t.status] = (counts[t.status]||0)+1;
          const div = document.createElement('div');
          div.className = 'task-card';
          div.draggable = true;
          div.ondragstart = (e) => e.dataTransfer.setData('id', t.id);
          div.onclick = () => openModal(t.id);
          const detail = t.detail ? (t.detail.length > 90 ? t.detail.slice(0,90)+'…' : t.detail) : 'No details — click to edit.';
          div.innerHTML = \`
            <div class="badge \${t.status}">\${t.status}</div>
            <div class="task-title">\${escapeHtml(t.title)}</div>
            <div class="task-snippet">\${escapeHtml(detail)}</div>
            <div class="task-dates"><span>● S: \${formatDT(t.start_date)}</span><span>◐ D: \${formatDT(t.deadline)}</span></div>
          \`;
          const target = t.status.replace('-', '');
          const list = document.getElementById(target+'-list');
          if(list) list.appendChild(div);
        });
        document.getElementById('count-todo').textContent = counts['todo'];
        document.getElementById('count-inprogress').textContent = counts['in-progress'];
        document.getElementById('count-done').textContent = counts['done'];
      }
      function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
      function allowDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
      }
      document.querySelectorAll('.col').forEach(col=>{
        col.addEventListener('dragleave', e=>{
          if(!col.contains(e.relatedTarget)) col.classList.remove('drag-over');
        });
      });
      async function drop(e, newStatus) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        const id = e.dataTransfer.getData('id');
        if(!id) return;
        const task = globalTasks.find(t => t.id === id);
        if(!task || task.status === newStatus) return;
        task.status = newStatus;
        render();
        await fetch(\`/api/tasks/\${id}\`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }), headers: {'Content-Type': 'application/json'} });
      }
      function openModal(id = null) {
        const modal = document.getElementById('taskModal');
        const task = id ? globalTasks.find(t => t.id === id) : null;
        document.getElementById('modalTitle').textContent = task ? 'Edit Task' : 'New Task';
        document.getElementById('taskId').value = id || '';
        document.getElementById('mTitle').value = task ? task.title : '';
        document.getElementById('mDetail').value = task ? task.detail : '';
        const toLocalStr = (ts) => {
          if(!ts) return '';
          const d = new Date(ts);
          return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,16);
        };
        document.getElementById('mStart').value = task ? toLocalStr(task.start_date) : '';
        document.getElementById('mDeadline').value = task ? toLocalStr(task.deadline) : '';
        document.getElementById('deleteArea').style.display = id ? 'block' : 'none';
        modal.showModal();
      }
      async function saveTask() {
        const id = document.getElementById('taskId').value;
        const payload = {
          title: document.getElementById('mTitle').value.trim(),
          detail: document.getElementById('mDetail').value.trim(),
          start_date: document.getElementById('mStart').value ? new Date(document.getElementById('mStart').value).getTime() : null,
          deadline: document.getElementById('mDeadline').value ? new Date(document.getElementById('mDeadline').value).getTime() : null,
        };
        if(!payload.title) return alert("Title is required!");
        if(id) await fetch(\`/api/tasks/\${id}\`, { method: 'PATCH', body: JSON.stringify(payload), headers: {'Content-Type': 'application/json'} });
        else await fetch('/api/tasks', { method: 'POST', body: JSON.stringify(payload), headers: {'Content-Type': 'application/json'} });
        document.getElementById('taskModal').close();
        load();
      }
      async function deleteCurrentTask(){
        const id = document.getElementById('taskId').value;
        if(!id) return;
        if(!confirm("Delete this task? This cannot be undone.")) return;
        await fetch(\`/api/tasks/\${id}\`, { method: 'DELETE' });
        document.getElementById('taskModal').close();
        load();
      }
      document.querySelectorAll('dialog').forEach(d=>{
        d.addEventListener('click', e=>{
          const rect = d.getBoundingClientRect();
          if(e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) d.close();
        });
      });
      // Klik di mana saja pada input tanggal → buka native picker (tidak hanya ikon/keyboard).
      // didaftarkan sekali via delegasi agar tetap aktif setiap modal dibuka.
      document.addEventListener('click', function(e){
        const t = e.target && e.target.closest ? e.target.closest('input[type="datetime-local"]') : null;
        if(t && t.showPicker) { try { t.showPicker(); } catch(err) {} }
      });
      load();
    ` }} />
  </Layout>
);