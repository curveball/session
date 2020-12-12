import { Context, Middleware } from '@curveball/core';
import * as cookie from 'cookie';
import MemoryStore from './memorystore';
import { SessionOptions, SessionStore, SessionValues } from './types';

export { default as MemoryStore } from './memorystore';

/**
 * This function returns a middleware function.
 */
export default function(options: SessionOptions): Middleware {

  const cookieName = options.cookieName ? options.cookieName : 'CBSESS';

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

    ctx.state.session = {};
    ctx.state.sessionId = null;

    if (sessionId) {
      sessionValues = await store.get(sessionId);

      // Nothing was stored for sessions
      if (!sessionValues) {
        // Wiping out sessionId, we need a new one for security reasons
        sessionId = null;
      } else {
        ctx.state.session = sessionValues;
        ctx.state.sessionId = sessionId;
      }

    }

    // Run all middlewares
    await next();


    if (sessionId && !ctx.state.sessionId) {
      // The session id was removed from the context, wipe out old session.
      await store.delete(sessionId);
    }

    const hasData = ctx.state.session && Object.keys(ctx.state.session).length > 0;

    if (sessionId && !hasData) {

      // There was a session, but there's no session data anymore. We remove
      // the session
      await store.delete(sessionId);

    } else if (hasData) {

      if (!ctx.state.sessionId) {

        // Create a new session id.
        sessionId = await store.newSessionId();

      }

      await store.set(sessionId!, ctx.state.session, Math.floor(Date.now() / 1000) + expiry);

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
