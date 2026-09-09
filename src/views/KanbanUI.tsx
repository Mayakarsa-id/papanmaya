import { Layout } from './Layout';

export const KanbanUI = ({ username, telegramId }: { username: string, telegramId: string | null }) => (
  <Layout title="PAPANMAYA">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 4px solid #fff; padding-bottom: 20px; margin-bottom: 30px;">
      <div>
        <h1 style="margin-bottom: 10px;">PAPANMAYA</h1>
        <div style="background: #fff; color: #000; padding: 5px 10px; display: inline-block; font-weight: bold;">
          USER: {username}
        </div>
      </div>
      <div style="text-align: right;">
        <button onclick="document.getElementById('settingsModal').showModal()" style="width: auto; background: #00ffff; color: #000; margin-bottom: 5px;">⚙️ SETTINGS</button>
        <br/><a href="/auth/logout" style="background: #ff3366; color: #fff; padding: 5px 10px; border: 2px solid #fff;">LOGOUT</a>
      </div>
    </div>

    <div class="board">
      <div class="col" id="col-todo" ondragover="allowDrop(event)" ondrop="drop(event, 'todo')">
        <h2 style="background: #ff3366; color: #000; padding: 5px;">TO_DO <button onclick="openModal()" style="float: right; width: auto; padding: 0 10px; margin: 0; background: #fff; color:#000;">+</button></h2>
        <div id="todo-list" class="list-container"></div>
      </div>
      <div class="col" id="col-inprogress" ondragover="allowDrop(event)" ondrop="drop(event, 'in-progress')">
        <h2 style="background: #ffff00; color: #000; padding: 5px;">IN_PROGRESS</h2>
        <div id="inprogress-list" class="list-container"></div>
      </div>
      <div class="col" id="col-done" ondragover="allowDrop(event)" ondrop="drop(event, 'done')">
        <h2 style="background: #00ff66; color: #000; padding: 5px;">DONE</h2>
        <div id="done-list" class="list-container"></div>
      </div>
    </div>

    <dialog id="taskModal" class="neo-dialog">
      <h2 id="modalTitle">DETAIL TUGAS</h2>
      <input type="hidden" id="taskId" />
      <label>Judul:</label>
      <input type="text" id="mTitle" placeholder="Nama Tugas..." />
      <label>Detail Pekerjaan:</label>
      <textarea id="mDetail" rows={4} placeholder="Deskripsi lengkap..." style="width: 100%; background: #000; color: #fff; border: 4px solid #fff; padding: 10px; font-family: inherit; margin-bottom: 15px; resize: vertical;"></textarea>
      <div style="display: flex; gap: 10px; margin-bottom: 15px;">
        <div style="flex:1"><label>Mulai:</label><input type="datetime-local" id="mStart" style="width:100%; background:#000; color:#fff; border: 4px solid #fff; padding: 10px;" /></div>
        <div style="flex:1"><label>Deadline:</label><input type="datetime-local" id="mDeadline" style="width:100%; background:#000; color:#fff; border: 4px solid #fff; padding: 10px;" /></div>
      </div>
      <div style="display: flex; gap: 10px;">
        <button onclick="saveTask()" style="background: #00ff66; color: #000;">SIMPAN</button>
        <button onclick="document.getElementById('taskModal').close()" style="background: #ff3366;">TUTUP</button>
      </div>
    </dialog>

    <dialog id="settingsModal" class="neo-dialog">
      <h2>PENGATURAN</h2>
      <p>ID Telegram digunakan untuk alarm H-6 deadline & Webhook Bot.</p>
      <form action="/user/settings/telegram" method="POST">
        <input type="text" name="telegram_id" value={telegramId || ''} placeholder="Contoh: 123456789" />
        <p style="font-size: 0.8rem; color: #00ffff;">Kosongkan jika tidak butuh alarm.</p>
        <div style="display: flex; gap: 10px;">
          <button type="submit" style="background: #ccff00; color: #000;">SIMPAN ID</button>
          <button type="button" onclick="document.getElementById('settingsModal').close()" style="background: #fff; color: #000;">BATAL</button>
        </div>
      </form>
    </dialog>

    <style dangerouslySetInnerHTML={{ __html: `
      .neo-dialog { background: #1a1a1a; color: #fff; border: 6px solid #fff; box-shadow: 12px 12px 0px #ff00ff; padding: 30px; width: 100%; max-width: 500px; font-family: inherit; }
      .neo-dialog::backdrop { background: rgba(0,0,0,0.8); }
      .list-container { min-height: 300px; padding-bottom: 50px; }
      .task-card { background: #000; border: 3px solid #fff; padding: 15px; margin-bottom: 15px; cursor: grab; transition: transform 0.1s; }
      .task-card:active { cursor: grabbing; transform: scale(0.98); }
      .badge { display: inline-block; padding: 3px 8px; font-size: 0.8rem; font-weight: bold; border: 2px solid #fff; margin-bottom: 10px; text-transform: uppercase; }
      .badge.todo { background: #ff3366; color: #000; }
      .badge.in-progress { background: #ffff00; color: #000; }
      .badge.done { background: #00ff66; color: #000; }
      .task-title { font-size: 1.2rem; font-weight: bold; margin-bottom: 5px; }
      .task-snippet { font-size: 0.9rem; color: #aaa; margin-bottom: 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      .task-dates { font-size: 0.75rem; color: #00ffff; border-top: 1px dashed #fff; padding-top: 5px; }
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
        return new Date(ts).toLocaleString('id-ID', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'});
      }
      function render() {
        ['todo', 'inprogress', 'done'].forEach(id => document.getElementById(id+'-list').innerHTML = '');
        globalTasks.forEach(t => {
          const div = document.createElement('div');
          div.className = 'task-card';
          div.draggable = true;
          div.ondragstart = (e) => e.dataTransfer.setData('id', t.id);
          div.onclick = () => openModal(t.id);
          div.innerHTML = \`
            <div class="badge \${t.status}">\${t.status}</div>
            <div class="task-title">\${t.title}</div>
            <div class="task-snippet">\${t.detail || '...'}</div>
            <div class="task-dates">S: \${formatDT(t.start_date)}<br/>D: \${formatDT(t.deadline)}</div>
          \`;
          document.getElementById(t.status.replace('-', '')+'-list').appendChild(div);
        });
      }
      function allowDrop(e) { e.preventDefault(); }
      async function drop(e, newStatus) {
        e.preventDefault();
        const id = e.dataTransfer.getData('id');
        if(!id) return;
        const task = globalTasks.find(t => t.id === id);
        if(task.status === newStatus) return;
        task.status = newStatus;
        render();
        await fetch(\`/api/tasks/\${id}\`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }), headers: {'Content-Type': 'application/json'} });
      }
      function openModal(id = null) {
        const modal = document.getElementById('taskModal');
        const task = id ? globalTasks.find(t => t.id === id) : null;
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
        modal.showModal();
      }
      async function saveTask() {
        const id = document.getElementById('taskId').value;
        const payload = {
          title: document.getElementById('mTitle').value,
          detail: document.getElementById('mDetail').value,
          start_date: document.getElementById('mStart').value ? new Date(document.getElementById('mStart').value).getTime() : null,
          deadline: document.getElementById('mDeadline').value ? new Date(document.getElementById('mDeadline').value).getTime() : null,
        };
        if(!payload.title) return alert("Judul wajib diisi!");
        if(id) await fetch(\`/api/tasks/\${id}\`, { method: 'PATCH', body: JSON.stringify(payload), headers: {'Content-Type': 'application/json'} });
        else await fetch('/api/tasks', { method: 'POST', body: JSON.stringify(payload), headers: {'Content-Type': 'application/json'} });
        document.getElementById('taskModal').close();
        load();
      }
      load();
    ` }} />
  </Layout>
);
