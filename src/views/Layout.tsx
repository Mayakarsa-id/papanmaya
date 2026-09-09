import { html } from 'hono/html';

export const Layout = (props: { title: string; children: any }) => html`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${props.title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0B0B0E;
      --bg-grid: #1A1A1F;
      --surface: #18181B;
      --surface-raised: #202023;
      --surface-hover: #232328;
      --border: #27272A;
      --border-strong: #3F3F46;
      --text: #FAFAFA;
      --text-muted: #A1A1AA;
      --text-faint: #71717A;
      --lime: #E9FF70;
      --lime-deep: #D6F000;
      --violet: #A78BFA;
      --violet-deep: #8B5CF6;
      --cyan: #22D3EE;
      --pink: #FB7185;
      --amber: #FACC15;
      --emerald: #34D399;
      --todo: #FB7185;
      --todo-soft: #2D1518;
      --todo-border: #3A1E22;
      --progress: #FACC15;
      --progress-soft: #2B2512;
      --progress-border: #3A2F14;
      --done: #34D399;
      --done-soft: #132A22;
      --done-border: #1E3328;
      --radius-xl: 20px;
      --radius-lg: 16px;
      --radius-md: 12px;
      --radius-sm: 10px;
      --shadow-hard: 5px 5px 0px #000;
      --shadow-hard-lg: 8px 8px 0px #000;
      --shadow-soft: 0 10px 30px rgba(0,0,0,0.45);
    }
    * { box-sizing: border-box; }
    html { scrollbar-gutter: stable; }
    body {
      background-color: var(--bg);
      background-image: radial-gradient(circle at 1px 1px, #1E1E24 1px, transparent 0);
      background-size: 28px 28px;
      color: var(--text);
      font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      margin: 0;
      padding: 28px 20px 40px;
      min-height: 100vh;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    ::selection { background: var(--lime); color: #0A0A0F; }
    a { color: var(--violet); text-decoration: none; font-weight: 500; }
    a:hover { color: var(--cyan); text-decoration: underline; text-underline-offset: 3px; }
    /* Headings - Space Grotesk for brutalist but refined */
    h1 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(1.9rem, 4vw, 2.6rem);
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 0.95;
      text-transform: uppercase;
      background: var(--lime);
      color: #0A0A0F;
      padding: 12px 18px;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      border: 2px solid #0A0A0F;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-hard);
      margin: 0 0 28px;
      transform: rotate(-0.4deg);
    }
    h1::before {
      content: '';
      width: 10px; height: 10px;
      background: #0A0A0F;
      border-radius: 50%;
      display: inline-block;
      box-shadow: inset 0 0 0 2px var(--lime);
    }
    h2 {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 600;
      letter-spacing: -0.02em;
      margin: 0;
    }
    /* Layout shell */
    .app-shell {
      max-width: 1280px;
      margin: 0 auto;
    }
    /* Boxes - auth cards etc */
    .box {
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 28px;
      box-shadow: var(--shadow-hard), var(--shadow-soft);
      max-width: 480px;
      position: relative;
    }
    .box::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: var(--radius-lg);
      pointer-events: none;
      border: 1px solid rgba(255,255,255,0.04);
    }
    .box h1 { transform: none; margin-bottom: 20px; font-size: 1.7rem; }
    /* Inputs */
    input[type="text"], input[type="password"], input[type="datetime-local"], textarea {
      width: 100%;
      padding: 13px 14px;
      font-size: 0.95rem;
      font-family: 'Inter', sans-serif;
      background: #0F0F12;
      border: 1.5px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text);
      transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
      outline: none;
    }
    input::placeholder, textarea::placeholder { color: var(--text-faint); }
    input:focus, textarea:focus {
      border-color: var(--violet);
      box-shadow: 0 0 0 3px rgba(167,139,250,0.15);
      background: #0A0A0F;
    }
    label {
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 6px;
      display: block;
      font-family: 'JetBrains Mono', monospace;
    }
    /* Buttons - brutalist but tidy */
    button {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.92rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      padding: 12px 16px;
      border-radius: var(--radius-sm);
      border: 1.5px solid #0A0A0F;
      cursor: pointer;
      transition: transform 0.1s, box-shadow 0.1s, background 0.15s, border-color 0.15s;
      box-shadow: 3px 3px 0px #000;
      background: var(--surface-raised);
      color: var(--text);
    }
    button:hover { transform: translate(-1px, -1px); box-shadow: 4px 4px 0px #000; }
    button:active { transform: translate(2px, 2px); box-shadow: 1px 1px 0px #000; }
    button[type="submit"], .btn-primary {
      background: var(--lime);
      color: #0A0A0F;
      border-color: #0A0A0F;
    }
    button[type="submit"]:hover { background: var(--lime-deep); }
    .btn-violet { background: var(--violet); color: #0A0A0F; }
    .btn-cyan { background: var(--cyan); color: #0A0A0F; }
    .btn-pink { background: var(--pink); color: #0A0A0F; }
    .btn-ghost {
      background: transparent;
      color: var(--text-muted);
      border: 1.5px solid var(--border);
      box-shadow: none;
    }
    .btn-ghost:hover { border-color: var(--border-strong); color: var(--text); background: var(--surface-raised); transform: none; box-shadow: none; }
    /* Board */
    .board {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
      align-items: start;
    }
    @media (max-width: 1020px) { .board { grid-template-columns: 1fr; gap: 16px; } }
    .col {
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 16px;
      min-height: 420px;
      box-shadow: var(--shadow-hard);
      position: relative;
      overflow: hidden;
    }
    .col::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      opacity: 0.9;
    }
    .col#todo::before, .col#col-todo::before { background: var(--todo); }
    .col#inprogress::before, .col#col-inprogress::before { background: var(--progress); }
    .col#done::before, .col#col-done::before { background: var(--done); }
    .col h2 {
      font-size: 0.84rem;
      letter-spacing: 0.08em;
      padding: 10px 12px;
      border-radius: var(--radius-sm);
      border: 1.5px solid var(--border);
      background: var(--surface-raised);
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
      font-family: 'JetBrains Mono', monospace;
    }
    .col#todo h2, .col#col-todo h2 { background: var(--todo-soft); border-color: var(--todo-border); color: var(--todo); }
    .col#inprogress h2, .col#col-inprogress h2 { background: var(--progress-soft); border-color: var(--progress-border); color: var(--progress); }
    .col#done h2, .col#col-done h2 { background: var(--done-soft); border-color: var(--done-border); color: var(--done); }
    .col h2 button {
      padding: 6px 10px;
      font-size: 0.8rem;
      border-radius: 8px;
      box-shadow: 2px 2px 0px #000;
      background: var(--text);
      color: #0A0A0F;
      border-color: #0A0A0F;
    }
    /* QR */
    .qr-container {
      background: #FAFAFA;
      border-radius: var(--radius-md);
      padding: 14px;
      display: inline-block;
      border: 1.5px solid #0A0A0F;
      box-shadow: var(--shadow-hard-sm);
      margin: 12px 0 16px;
    }
    .qr-container svg { width: 100%; max-width: 220px; height: auto; display: block; }
    /* Dialogs will be overridden in Kanban but keep base */
    dialog {
      border: none;
      padding: 0;
      background: transparent;
      max-width: 520px;
      width: calc(100% - 32px);
    }
    dialog::backdrop { background: rgba(8,8,10,0.72); backdrop-filter: blur(6px); }
    /* Scrollbar */
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 999px; }
    ::-webkit-scrollbar-track { background: transparent; }
    @media (max-width: 640px) {
      body { padding: 18px 14px 32px; }
      h1 { font-size: 1.7rem; padding: 10px 14px; }
      .box { padding: 20px; }
      .board { gap: 14px; }
    }
  </style>
</head>
<body>
  <div class="app-shell">${props.children}</div>
</body>
</html>
`;