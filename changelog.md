0.3.0 (2019-10-04)
==================

* Updated to latest Curveball API.


0.2.0 (2018-09-24)
==================

* Expire sessions.
* Add garbage collector to MemoryStore.
* BC break: Now uses `ctx.state.session` and `ctx.state.sessionId` instead of
  `ctx.state.session.data` and `ctx.state.session.id`.


0.1.1 (2018-09-06)
==================

* SameSite and HttpOnly are both turned on.


0.1.0 (2018-09-06)
==================

* First version. Ships with a 'memory store'.
