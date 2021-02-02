Changelog
=========

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
