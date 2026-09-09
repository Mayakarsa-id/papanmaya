import { html } from 'hono/html';

export const Layout = (props: { title: string; children: any }) => html`
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${props.title}</title>
  <style>
    * { box-sizing: border-box; }
    body { background-color: #0f0f0f; color: #f0f0f0; font-family: 'Courier New', Courier, monospace; margin: 0; padding: 40px; }
    h1 { font-size: 3rem; text-transform: uppercase; background: #ccff00; color: #000; padding: 10px 20px; display: inline-block; border: 4px solid #fff; box-shadow: 8px 8px 0px #fff; margin-bottom: 40px; }
    .box { background: #1a1a1a; border: 4px solid #fff; padding: 20px; box-shadow: 8px 8px 0px #00ffff; max-width: 500px; margin-bottom: 20px; }
    input[type="text"], input[type="password"] { width: 100%; padding: 15px; font-size: 1.2rem; background: #0f0f0f; border: 4px solid #fff; color: #fff; font-family: inherit; margin-bottom: 15px; }
    input:focus, textarea:focus { outline: none; border-color: #ff00ff; }
    button { width: 100%; padding: 15px; font-size: 1.2rem; font-weight: bold; font-family: inherit; text-transform: uppercase; border: 4px solid #fff; cursor: pointer; transition: all 0.1s; background: #ff00ff; color: #fff; box-shadow: 6px 6px 0px #fff; margin-bottom: 15px; }
    button:active { transform: translate(6px, 6px); box-shadow: 0px 0px 0px #fff; }
    a { color: #00ffff; text-decoration: none; font-weight: bold; }
    .board { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
    .col { background: #1a1a1a; border: 4px solid #fff; padding: 20px; min-height: 400px; }
    .col h2 { text-transform: uppercase; border-bottom: 4px solid #fff; padding-bottom: 10px; margin-top: 0; }
    .col#todo { box-shadow: 8px 8px 0px #ff3366; }
    .col#inprogress { box-shadow: 8px 8px 0px #ffff00; }
    .col#done { box-shadow: 8px 8px 0px #00ff66; }
    .qr-container svg { width: 100%; max-width: 250px; height: auto; border: 4px solid #fff; margin-bottom: 15px; }
  </style>
</head>
<body>${props.children}</body>
</html>
`;