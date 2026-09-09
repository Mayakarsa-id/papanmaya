import { Layout } from './Layout';

export const AuthLoginView = () => (
  <Layout title="LOGIN - PAPANMAYA">
    <h1>LOGIN</h1>
    <div class="box">
      <form action="/auth/login" method="POST">
        <input type="text" name="username" placeholder="USERNAME" required />
        <input type="text" name="code" placeholder="6-DIGIT TOTP CODE" required autocomplete="off" />
        <button type="submit">MASUK</button>
      </form>
      <p>Belum punya akun? <a href="/auth/register">Daftar</a></p>
    </div>
  </Layout>
);

export const AuthRegisterInitView = () => (
  <Layout title="REGISTER - PAPANMAYA">
    <h1>REGISTER</h1>
    <div class="box">
      <form action="/auth/register/init" method="POST">
        <input type="text" name="username" placeholder="BUAT USERNAME" required />
        <button type="submit">GENERATE TOTP</button>
      </form>
    </div>
  </Layout>
);

export const AuthRegisterVerifyView = ({ qrSvg, pendingToken, username }: any) => (
  <Layout title="VERIFY - PAPANMAYA">
    <h1>VERIFY TOTP</h1>
    <div class="box">
      <p>Scan QR ini di Authenticator untuk <strong>{username}</strong>:</p>
      <div class="qr-container" dangerouslySetInnerHTML={{ __html: qrSvg }}></div>
      <form action="/auth/register/verify" method="POST">
        <input type="hidden" name="pending_token" value={pendingToken} />
        <input type="text" name="code" placeholder="MASUKKAN 6 DIGIT" required autocomplete="off" />
        <button type="submit">VERIFIKASI & DAFTAR</button>
      </form>
    </div>
  </Layout>
);