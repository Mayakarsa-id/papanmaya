import { Hono } from 'hono';
import { setCookie, deleteCookie } from 'hono/cookie';
import { sign, verify } from 'hono/jwt';
import { renderSVG } from 'uqr';
import { Env } from '../types';
import { AuthLoginView, AuthRegisterInitView, AuthRegisterVerifyView } from '../views/AuthUI';
import { generateSecret, verifyTOTP } from '../utils/totp';

const authRouter = new Hono<{ Bindings: Env }>();
const getDO = (c: any) => c.env.KANBAN_BOARD.get(c.env.KANBAN_BOARD.idFromName('default-board'));

authRouter.get('/login', (c) => c.html(<AuthLoginView />));
authRouter.get('/register', (c) => c.html(<AuthRegisterInitView />));

authRouter.post('/register/init', async (c) => {
  const { username } = await c.req.parseBody();
  const userExists = await getDO(c).getUser(username as string);
  if (userExists) return c.text('Username already exists', 400);

  const secret = generateSecret(20);
  const otpauthUri = `otpauth://totp/PapanMaya:${encodeURIComponent(username as string)}?secret=${secret}&issuer=PapanMaya`;
  const qrSvg = renderSVG(otpauthUri);
  const pendingToken = await sign({ username, secret }, c.env.JWT_SECRET);

  return c.html(<AuthRegisterVerifyView qrSvg={qrSvg} pendingToken={pendingToken} username={username as string} />);
});

authRouter.post('/register/verify', async (c) => {
  const { code, pending_token } = await c.req.parseBody();
  try {
    const decoded = await verify(pending_token as string, c.env.JWT_SECRET, 'HS256') as { username: string, secret: string };
    const isValid = await verifyTOTP(decoded.secret, code as string);
    if (!isValid) return c.text('Invalid TOTP Code', 401);

    await getDO(c).createUser(decoded.username, decoded.secret);

    const authToken = await sign({ username: decoded.username }, c.env.JWT_SECRET);
    // 24 HOURS
    setCookie(c, 'auth', authToken, { httpOnly: true, secure: true, maxAge: 86400, path: '/' });
    return c.redirect('/');
  } catch (e) {
    return c.text('Session expired or invalid', 400);
  }
});

authRouter.post('/login', async (c) => {
  const { username, code } = await c.req.parseBody();
  const user = await getDO(c).getUser(username as string);
  if (!user) return c.text('User not found', 404);

  const isValid = await verifyTOTP(user.totp_secret, code as string);
  if (!isValid) return c.text('Invalid TOTP Code', 401);

  const authToken = await sign({ username: user.username }, c.env.JWT_SECRET);
  // 24 HOURS
  setCookie(c, 'auth', authToken, { httpOnly: true, secure: true, maxAge: 86400, path: '/' });
  return c.redirect('/');
});

authRouter.get('/logout', (c) => {
  deleteCookie(c, 'auth', { path: '/' });
  return c.redirect('/auth/login');
});

export default authRouter;