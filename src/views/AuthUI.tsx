import { Layout } from './Layout';

const BrandBadge = () => (
  <div style="display:flex; align-items:center; gap:10px; margin-bottom:14px;">
    <div style="width:34px; height:34px; background:var(--lime); border:1.5px solid #0A0A0F; border-radius:9px; display:grid; place-items:center; font-family:'JetBrains Mono',monospace; font-weight:700; font-size:0.78rem; color:#0A0A0F; box-shadow:2px 2px 0px #000;">PM</div>
    <div>
      <div style="font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:0.92rem; letter-spacing:-0.02em; line-height:1;">PAPANMAYA</div>
      <div style="font-family:'JetBrains Mono',monospace; font-size:0.62rem; letter-spacing:0.08em; color:var(--text-faint); text-transform:uppercase;">Secure Board • TOTP</div>
    </div>
    <span style="margin-left:auto; font-family:'JetBrains Mono',monospace; font-size:0.62rem; letter-spacing:0.06em; background:#0A0A0F; color:var(--lime); padding:4px 8px; border-radius:999px; border:1px solid var(--border);">DARK NEO</span>
  </div>
);

export const AuthLoginView = () => (
  <Layout title="Sign In - PAPANMAYA">
    <div style="min-height:68vh; display:flex; align-items:center; justify-content:center; padding:18px 0;">
      <div class="box" style="width:100%; max-width:420px;">
        <BrandBadge />
        <h2 style="font-size:1.45rem; margin:4px 0 6px;">Sign In</h2>
        <p style="color:var(--text-muted); font-size:0.9rem; margin:0 0 18px; line-height:1.5;">Enter the 6-digit code from your authenticator app.</p>
        <form action="/auth/login" method="POST" style="display:flex; flex-direction:column; gap:12px;">
          <div>
            <label for="username">Username</label>
            <input type="text" id="username" name="username" placeholder="e.g. alex" required autocomplete="username" />
          </div>
          <div>
            <label for="code">TOTP Code</label>
            <input type="text" id="code" name="code" placeholder="• • • • • •" required autocomplete="off" inputmode="numeric" pattern="[0-9]*" maxlength={6} style="letter-spacing:0.28em; font-family:'JetBrains Mono',monospace; font-weight:600; text-align:center;" />
            <div style="font-size:0.73rem; color:var(--text-faint); margin-top:6px; text-align:center;">Changes every 30 seconds — make sure your clock is in sync</div>
          </div>
          <button type="submit" style="margin-top:6px;">Sign In →</button>
        </form>
        <p style="text-align:center; margin:16px 0 0; font-size:0.88rem; color:var(--text-muted);">Don't have an account? <a href="/auth/register" style="font-weight:600;">Sign up</a></p>
      </div>
    </div>
  </Layout>
);

export const AuthRegisterInitView = () => (
  <Layout title="Sign Up - PAPANMAYA">
    <div style="min-height:68vh; display:flex; align-items:center; justify-content:center; padding:18px 0;">
      <div class="box" style="width:100%; max-width:420px;">
        <BrandBadge />
        <h2 style="font-size:1.45rem; margin:4px 0 6px;">Create Account</h2>
        <p style="color:var(--text-muted); font-size:0.9rem; margin:0 0 18px; line-height:1.5;">Choose a username — we'll generate a TOTP secret for you.</p>
        <form action="/auth/register/init" method="POST" style="display:flex; flex-direction:column; gap:14px;">
          <div>
            <label for="username">New Username</label>
            <input type="text" id="username" name="username" placeholder="min. 3 characters, no spaces" required pattern="[A-Za-z0-9_.-]{3,}" />
            <div style="font-size:0.74rem; color:var(--text-faint); margin-top:6px;">Letters, numbers, <code style="background:var(--surface-raised); padding:1px 5px; border-radius:5px; border:1px solid var(--border);">_ . -</code> allowed</div>
          </div>
          <button type="submit">Generate TOTP →</button>
        </form>
        <p style="text-align:center; margin:16px 0 0; font-size:0.88rem; color:var(--text-muted);">Already have an account? <a href="/auth/login" style="font-weight:600;">Sign in</a></p>
      </div>
    </div>
  </Layout>
);

export const AuthRegisterVerifyView = ({ qrSvg, pendingToken, username }: any) => (
  <Layout title="Verify - PAPANMAYA">
    <div style="min-height:68vh; display:flex; align-items:center; justify-content:center; padding:18px 0;">
      <div class="box" style="width:100%; max-width:460px; text-align:center;">
        <BrandBadge />
        <div style="display:inline-flex; align-items:center; gap:8px; background:var(--surface-raised); border:1px solid var(--border); padding:6px 10px; border-radius:999px; font-size:0.78rem; margin:6px 0 12px;">
          <span style="width:7px; height:7px; background:var(--emerald); border-radius:50%; box-shadow:0 0 0 4px rgba(52,211,153,0.18);"></span>
          <span style="font-family:'JetBrains Mono',monospace; color:var(--text-muted);">Account:</span>
          <strong style="font-family:'Space Grotesk',sans-serif;">{username}</strong>
        </div>
        <h2 style="font-size:1.3rem; margin:0 0 6px;">Scan QR in Authenticator</h2>
        <p style="color:var(--text-muted); font-size:0.88rem; margin:0 auto 14px; max-width:36ch; line-height:1.5;">Open Google Authenticator / Authy / 1Password, tap <em style="color:var(--text); font-style:normal; font-weight:600;">Add account</em> → Scan QR.</p>
        <div class="qr-container" dangerouslySetInnerHTML={{ __html: qrSvg }}></div>
        <div style="font-family:'JetBrains Mono',monospace; font-size:0.68rem; letter-spacing:0.06em; color:var(--text-faint); margin-bottom:14px;">QR for <strong style="color:var(--lime);">{username}</strong> on PapanMaya</div>
        <form action="/auth/register/verify" method="POST" style="text-align:left; display:flex; flex-direction:column; gap:12px;">
          <input type="hidden" name="pending_token" value={pendingToken} />
          <div>
            <label for="code">6-Digit Verification Code</label>
            <input type="text" id="code" name="code" placeholder="• • • • • •" required autocomplete="off" inputmode="numeric" pattern="[0-9]*" maxlength={6} style="letter-spacing:0.28em; font-family:'JetBrains Mono',monospace; font-weight:600; text-align:center; font-size:1.15rem;" />
          </div>
          <button type="submit">Verify & Sign Up →</button>
          <a href="/auth/register" style="text-align:center; font-size:0.84rem; color:var(--text-muted);">← Change username</a>
        </form>
      </div>
    </div>
  </Layout>
);