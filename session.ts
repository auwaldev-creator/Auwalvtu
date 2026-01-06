import jwt from "jsonwebtoken";

const SESSION_COOKIE = "auwntech_session";
const TTL_SECONDS = 60 * 60 * 24;

export function createSessionCookie(payload: { id: string; role: string }) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("Missing SESSION_SECRET");
  const token = jwt.sign(payload, secret, { expiresIn: TTL_SECONDS });
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${TTL_SECONDS}`;
}

export function parseSession(token?: string) {
  if (!token) return null;
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("Missing SESSION_SECRET");
  try {
    return jwt.verify(token, secret) as { id: string; role: string };
  } catch (err) {
    return null;
  }
}

export const sessionCookieName = SESSION_COOKIE;
