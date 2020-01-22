Curveball Session Middleware
============================

This package adds support for sessions to the [Curveball][1] framework.

Features:

* It's lazy. It will only start a session if there is something in the store.
* It will also automatically wipe the session data if session data was emptied.

Installation
------------

    npm install @curveball/session


Getting started
---------------

### Adding the middleware

```typescript
import session from '@curveball/session';

app.use(session({
  store: 'memory',
});
```

This will add the in-memory session store to curveball. This store is mostly
meant for testing.

Here is another example with more options:

```typescript
import session from '@curveball/session';

app.use(session({
  store: 'memory',
  cookieName: 'MY_SESSION',
  expiry: 7200,
  cookieOptions: {
    secure: true,
    path: '/',
    sameSite: true,
  },
});
```

* `cookieName` - Updates the name of the HTTP Cookie. It's `CBSESS` by default.
* `expiry` - The number of seconds of inactivity before the session disappears.
  this is 3600 seconds by default. It only pertains to the longevity of the
  session in the store, it doesn't influence cookie parameters.
* `cookieOptions` - If set, override cookie options from the default. The list
  of supported options can be found in the documentation of the [cookie
  package][3].

### Using the session store

In your own controllers and middlewares, you can set and update session data
via the `ctx.state.session` property.

```typescript
app.use( ctx => {

  // Running this will create the session
  ctx.state.session = { userId: 5 };
  ctx.response.body = 'Hello world';

});
```

### Deleting a session

To delete an open session, just clear the session data:

```typescript
app.use( ctx => {

  // Running this will create the session
  ctx.state.session = null;

});
```

### Re-generate a session id.

If you clear the session id, but there is still data, the middleware will
remove the old session and automatically create a new session id:

```typescript
app.use( ctx => {

  // This will kill the old session and start a new one with the same data.
  ctx.state.sessionId = null;

});
```

API
---

It's desirable to create your own stores for product usage. Eventually this
project will probably add a few more default stores.

Until then, you must implement the following interface:

```typescript
interface SessionStore {

  set(id: string, values: SessionValues, expire: number): Promise<void>;
  get(id: string): Promise<SessionValues>,
  delete(id: string): Promise<void>,
  newSessionId(): Promise<string>,

}
```

`SessionValues` is simply a key->value object. `expire` is expressed as a unix
timestamp.

[1]: https://github.com/curveball/
[2]: https://www.npmjs.com/package/cookie
