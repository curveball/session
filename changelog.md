Changelog
=========

0.10.0 (????-??-??)
-------------------

* The `getCsrf` function is no longer an async function, and returns the token
  immediately.
* A warning is now emitted if `getCsrf` is called after the session has already
  been stored.


0.9.0 (2023-02-14)
------------------

* This package now supports ESM and CommonJS modules.
* No longer supports Node 14. Please use Node 16 or higher.


0.8.1 (2022-10-11)
------------------

* Session data was not stored if a later middleware threw an uncaught
  exception. This middleware now uses `finally` to ensure that session data
  always gets stored, and the `Set-Cookie` header always gets sent.


0.8.0 (2022-09-03)
------------------

* Upgraded from `@curveball/core` to `@curveball/kernel`.


0.7.0 (2022-03-21)
------------------

* Removed `expires` option, and added `maxAge` instead. `expires` never made
  sense, because it represents a fixed point in time. Which means that if
  `expires` was set to 1 hour in the future, the middleware would no longer
  generate valid sessions after the first hour the server is up. (@defrex)
* Dropped Node 12 support. Node 14 is now the minimum version.


0.6.3 (2022-03-09)
------------------

* Added 'close' method to Memory session store, so users may cleanup open
  timeouts. (@defrex)
* Updated everything to latest curveball standards.


0.6.2 (2021-03-01)
------------------

* Export `SessionStore`.


0.6.1 (2021-02-02)
------------------

* Session data should be typed as `Record<string, any>` not `Record<string,
  string>`.


0.6.0 (2021-02-02)
------------------

* Major BC break: session information is now stored in `ctx.session` instead of
  `ctx.state.session`.
* Adding features for CSRF token generation and checking: `ctx.getCsrf` and
  `ctx.validateCsrf`.
* Typescript target is now `es2019` instead of `esnext` to ensure that older
  Node.js versions are supported.
* Switched to eslint.


0.5.0 (2020-01-22)
------------------

* Changed the default setting for `SameSite` to `Lax`.


0.4.2 (2020-01-05)
------------------

* Allow installation on Curveball 0.10.


0.4.1 (2019-11-11)
------------------

* Allow 'sameSite' to be set to cookieOptions.


0.4.0 (2019-11-11)
------------------

* Allow cookieOptions to be overridden.
* Curveball is now a peerDependency


0.3.3 (2019-09-12)
------------------

* Update to Curveball 0.9 API


0.3.2 (2019-03-26)
------------------

* Stricter typescript errors.


0.3.1 (2019-03-26)
------------------

* Update to latest dependencies.


0.3.0 (2019-10-04)
------------------

* Updated to latest Curveball API.


0.2.0 (2018-09-24)
------------------

* Expire sessions.
* Add garbage collector to MemoryStore.
* BC break: Now uses `ctx.state.session` and `ctx.state.sessionId` instead of
  `ctx.state.session.data` and `ctx.state.session.id`.


0.1.1 (2018-09-06)
------------------

* SameSite and HttpOnly are both turned on.


0.1.0 (2018-09-06)
------------------

* First version. Ships with a 'memory store'.
