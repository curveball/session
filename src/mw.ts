import { Context, Middleware } from '@curveball/kernel';
import * as cookie from 'cookie';
import MemoryStore from './memorystore';
import { SessionOptions, SessionStore, SessionValues } from './types';
import { randomBytes } from 'crypto';
import { CsrfError } from './errors';

/**
 * This function returns a middleware function.
 */
export default function(options: SessionOptions): Middleware {

  const cookieName = options.cookieName ? options.cookieName : 'CB';

  const cookieOptions = options.cookieOptions || {
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
  };

  let store: SessionStore;

  if (options.store === 'memory') {
    store = new MemoryStore();
  } else {
    store = options.store;
  }

  /**
   * Expire after 1 hour by default.
   */
  const expiry = options.expiry !== undefined ? options.expiry : 3600;

  return async (ctx, next) => {

    let sessionId = getSessionId(ctx, cookieName);
    let sessionValues: SessionValues | null;

    ctx.session = {};
    ctx.sessionId = null;
    ctx.getCsrf = async() => {
      if (ctx.session['csrf-token']) {
        return ctx.session['csrf-token'];
      }
      const bytes = await randomBytes(32);
      const token = bytes.toString('base64');
      ctx.session['csrf-token'] = token;
      return token;
    };
    ctx.validateCsrf = (token?: string) => {
      if (!token) {
        token = (ctx.request as any).body?.['csrf-token'];
      }
      if (!token) {
        throw new CsrfError('No CSRF token was found in the request body');
      }
      if (!ctx.session['csrf-token']) {
        throw new CsrfError('No CSRF token exists in the session');
      }
      if (ctx.session['csrf-token'] !== token) {
        throw new CsrfError('CSRF token is incorrect');
      }
    };

    if (sessionId) {
      sessionValues = await store.get(sessionId);

      // Nothing was stored for sessions
      if (!sessionValues) {
        // Wiping out sessionId, we need a new one for security reasons
        sessionId = null;
      } else {
        ctx.session = sessionValues;
        ctx.sessionId = sessionId;
      }

    }

    // Run all middlewares
    await next();

    if (sessionId && !ctx.sessionId) {
      // The session id was removed from the context, wipe out old session.
      await store.delete(sessionId);
    }

    const hasData = ctx.session && Object.keys(ctx.session).length > 0;

    if (sessionId && !hasData) {

      // There was a session, but there's no session data anymore. We remove
      // the session
      await store.delete(sessionId);

    } else if (hasData) {

      if (!ctx.sessionId) {

        // Create a new session id.
        sessionId = await store.newSessionId();

      }

      await store.set(sessionId!, ctx.session, Math.floor(Date.now() / 1000) + expiry);

      // Send new cookie
      ctx.response.headers.set('Set-Cookie',
        cookie.serialize(cookieName, sessionId!, cookieOptions)
      );

    }

  };

}

function getSessionId(ctx: Context, cookieName: string): null | string {

  const cookieHeader = ctx.request.headers.get('Cookie');
  if (!cookieHeader) {
    return null;
  }
  const cookies = cookie.parse(cookieHeader);
  if (!cookies[cookieName]) {
    return null;
  }
  return cookies[cookieName];

}
