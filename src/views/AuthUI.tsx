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
  <Layout title="LOGIN - PAPANMAYA">
    <div style="min-height:68vh; display:flex; align-items:center; justify-content:center; padding:18px 0;">
      <div class="box" style="width:100%; max-width:420px;">
        <BrandBadge />
        <h2 style="font-size:1.45rem; margin:4px 0 6px;">Masuk</h2>
        <p style="color:var(--text-muted); font-size:0.9rem; margin:0 0 18px; line-height:1.5;">Gunakan kode 6-digit dari aplikasi Authenticator kamu.</p>
        <form action="/auth/login" method="POST" style="display:flex; flex-direction:column; gap:12px;">
          <div>
            <label for="username">Username</label>
            <input type="text" id="username" name="username" placeholder="contoh: naveta" required autocomplete="username" />
          </div>
          <div>
            <label for="code">Kode TOTP</label>
            <input type="text" id="code" name="code" placeholder="• • • • • •" required autocomplete="off" inputmode="numeric" pattern="[0-9]*" maxlength={6} style="letter-spacing:0.28em; font-family:'JetBrains Mono',monospace; font-weight:600; text-align:center;" />
            <div style="font-size:0.73rem; color:var(--text-faint); margin-top:6px; text-align:center;">Berubah tiap 30 detik — pastikan jam sinkron</div>
          </div>
          <button type="submit" style="margin-top:6px;">Masuk →</button>
        </form>
        <p style="text-align:center; margin:16px 0 0; font-size:0.88rem; color:var(--text-muted);">Belum punya akun? <a href="/auth/register" style="font-weight:600;">Daftar sekarang</a></p>
      </div>
    </div>
  </Layout>
);

export const AuthRegisterInitView = () => (
  <Layout title="REGISTER - PAPANMAYA">
    <div style="min-height:68vh; display:flex; align-items:center; justify-content:center; padding:18px 0;">
      <div class="box" style="width:100%; max-width:420px;">
        <BrandBadge />
        <h2 style="font-size:1.45rem; margin:4px 0 6px;">Buat Akun</h2>
        <p style="color:var(--text-muted); font-size:0.9rem; margin:0 0 18px; line-height:1.5;">Pilih username, kami akan buat secret TOTP untukmu.</p>
        <form action="/auth/register/init" method="POST" style="display:flex; flex-direction:column; gap:14px;">
          <div>
            <label for="username">Username Baru</label>
            <input type="text" id="username" name="username" placeholder="min. 3 karakter, tanpa spasi" required pattern="[A-Za-z0-9_.-]{3,}" />
            <div style="font-size:0.74rem; color:var(--text-faint); margin-top:6px;">Huruf, angka, <code style="background:var(--surface-raised); padding:1px 5px; border-radius:5px; border:1px solid var(--border);">_ . -</code> diperbolehkan</div>
          </div>
          <button type="submit">Generate TOTP →</button>
        </form>
        <p style="text-align:center; margin:16px 0 0; font-size:0.88rem; color:var(--text-muted);">Sudah punya akun? <a href="/auth/login" style="font-weight:600;">Masuk</a></p>
      </div>
    </div>
  </Layout>
);

export const AuthRegisterVerifyView = ({ qrSvg, pendingToken, username }: any) => (
  <Layout title="VERIFY - PAPANMAYA">
    <div style="min-height:68vh; display:flex; align-items:center; justify-content:center; padding:18px 0;">
      <div class="box" style="width:100%; max-width:460px; text-align:center;">
        <BrandBadge />
        <div style="display:inline-flex; align-items:center; gap:8px; background:var(--surface-raised); border:1px solid var(--border); padding:6px 10px; border-radius:999px; font-size:0.78rem; margin:6px 0 12px;">
          <span style="width:7px; height:7px; background:var(--emerald); border-radius:50%; box-shadow:0 0 0 4px rgba(52,211,153,0.18);"></span>
          <span style="font-family:'JetBrains Mono',monospace; color:var(--text-muted);">Akun:</span>
          <strong style="font-family:'Space Grotesk',sans-serif;">{username}</strong>
        </div>
        <h2 style="font-size:1.3rem; margin:0 0 6px;">Scan QR di Authenticator</h2>
        <p style="color:var(--text-muted); font-size:0.88rem; margin:0 auto 14px; max-width:36ch; line-height:1.5;">Buka Google Authenticator / Authy / 1Password, pilih <em style="color:var(--text); font-style:normal; font-weight:600;">Tambah akun</em> → Scan QR.</p>
        <div class="qr-container" dangerouslySetInnerHTML={{ __html: qrSvg }}></div>
        <div style="font-family:'JetBrains Mono',monospace; font-size:0.68rem; letter-spacing:0.06em; color:var(--text-faint); margin-bottom:14px;">QR berlaku untuk <strong style="color:var(--lime);">{username}</strong> di PapanMaya</div>
        <form action="/auth/register/verify" method="POST" style="text-align:left; display:flex; flex-direction:column; gap:12px;">
          <input type="hidden" name="pending_token" value={pendingToken} />
          <div>
            <label for="code">Kode Verifikasi 6-Digit</label>
            <input type="text" id="code" name="code" placeholder="• • • • • •" required autocomplete="off" inputmode="numeric" pattern="[0-9]*" maxlength={6} style="letter-spacing:0.28em; font-family:'JetBrains Mono',monospace; font-weight:600; text-align:center; font-size:1.15rem;" />
          </div>
          <button type="submit">Verifikasi & Daftar →</button>
          <a href="/auth/register" style="text-align:center; font-size:0.84rem; color:var(--text-muted);">← Ganti username</a>
        </form>
      </div>
    </div>
  </Layout>
);