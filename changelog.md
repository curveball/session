Changelog
=========

0.4.0 (2019-11-11)
------------------

* Allow cookieOptions to be overridden.


0.3.3 (2019-09-12)
------------------

* Update to Curveball 0.9 API

0.3.2 (2019-03-26)
------------------

* Stricter typescript errors.

0.3.1 (2019-03-26)
------------------

* Update to latest dependencies.


0.3.0 (2018-10-04)
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
