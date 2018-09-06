import { Middleware, Context } from '@curveball/core';
import { SessionOptions, SessionValues } from './types';
import cookie from 'cookie';

export default function(options: SessionOptions): Middleware {

  const cookieName = options.cookieName ? options.cookieName : 'CBSESS';

  return async (ctx, next) => {

    let sessionId = getSessionId(ctx, cookieName);
    let sessionValues:SessionValues;

    ctx.state.session = {
      id: null,
      data: {}
    };

    if (sessionId) {
      sessionValues = await options.store.get(sessionId);

      // Nothing was stored for sessions
      if (!sessionValues) {
        // Wiping out sessionId, we need a new one for security reasons
        sessionId = null;
      } else {
        ctx.state.session = {
          data: sessionValues,
          id: sessionId
        };
      }

    }

    // Run all middlewares
    await next();


    if (sessionId && !ctx.state.session.id) {
      // The session id was removed from the context, wipe out old session.
      options.store.delete(sessionId);
    }

    const hasData = Object.keys(ctx.state.session.data).length > 0;

    if (sessionId && !hasData) {

      // There was a session, but there's no session data anymore. We remove
      // the session
      options.store.delete(sessionId);

    } else {

      if (!ctx.state.session.id) {

        // Create a new session id.
        sessionId = await options.store.newSessionId();

      }

      await options.store.set(sessionId, ctx.state.session.data);

      // Send new cookie
      ctx.response.headers.set('Set-Cookie', cookie.serialize(cookieName, sessionId));

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
