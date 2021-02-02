import { Application, Response } from '@curveball/core';
import session from '../src';
import { expect } from 'chai';
import MemoryStore from '../src/memorystore';

describe('Session middleware', () => {

  it('should set the correct Set-Cookie header', async() => {

    const app = getApp();
    const response = await app.subRequest('GET', '/first-request');
    const header = response.headers.get('Set-Cookie');
    expect(header).to.match(/^CB=([0-9A-Za-z%]+); Path=\/; HttpOnly; SameSite=Lax/);

  });

  it('should generally work', async () => {

    const app = getApp();
    const response1 = await app.subRequest('GET', '/first-request');
    const cookieHeader1 = response1.headers.get('Set-Cookie');
    const cookieValue = cookieHeader1!.split(';')[0];

    const response2 = await app.subRequest('GET', '/second-request', {
      Cookie: cookieValue
    });

    expect(response2.body).to.equal('bar');
    const cookieHeader2 = response2.headers.get('Set-Cookie');
    expect(cookieHeader2).to.equal(cookieHeader1);

  });

  it('should allow providing custom session stores.', async () => {

    const app = getApp({
      store: new MemoryStore()
    });
    const response1 = await app.subRequest('GET', '/first-request');
    const cookieHeader1 = response1.headers.get('Set-Cookie');
    const cookieValue = cookieHeader1!.split(';')[0];

    const response2 = await app.subRequest('GET', '/second-request', {
      Cookie: cookieValue
    });

    expect(response2.body).to.equal('bar');
    const cookieHeader2 = response2.headers.get('Set-Cookie');
    expect(cookieHeader2).to.equal(cookieHeader1);

  });

  it('should allow overriding the cookie name.', async () => {

    const app = getApp({
      store: 'memory',
      cookieName: 'FOOBAR',
    });
    const response1 = await app.subRequest('GET', '/first-request');
    const cookieHeader1 = response1.headers.get('Set-Cookie');
    const cookieValue = cookieHeader1!.split(';')[0];

    const response2 = await app.subRequest('GET', '/second-request', {
      Cookie: cookieValue
    });

    expect(response2.body).to.equal('bar');
    const cookieHeader2 = response2.headers.get('Set-Cookie');
    expect(cookieHeader2).to.equal(cookieHeader1);

  });

  it('should correctly set the expiry timestamp.', async () => {

    const store = new MemoryStore();
    const app = getApp({
      store: store,
    });
    const response1 = await app.subRequest('GET', '/first-request');
    const sessionId = getSessionId(response1);

    const expire = Math.floor(Date.now()) / 1000;

    // Giving it a 5 second window
    expect(store.store.get(sessionId)![0]).to.be.above(expire + 3600 - 5);
    expect(store.store.get(sessionId)![0]).to.be.below(expire + 3600 + 5);

  });

  it('should allow overriding the expiry', async () => {

    const store = new MemoryStore();
    const app = getApp({
      store: store,
      expiry: 1000,
    });
    const response1 = await app.subRequest('GET', '/first-request');
    const sessionId = getSessionId(response1);

    const expire = Math.floor(Date.now() / 1000);

    // Giving it a 5 second window
    expect(store.store.get(sessionId)![0]).to.be.above(expire + 1000 - 5);
    expect(store.store.get(sessionId)![0]).to.be.below(expire + 1000 + 5);

  });

  it('should respect the expiry', async () => {

    const store = new MemoryStore();
    const app = getApp({
      store: store,
      expiry: 0,
    });
    const response1 = await app.subRequest('GET', '/first-request');
    const sessionId = getSessionId(response1);

    await (new Promise(res => {
      setTimeout(res, 1000);
    }));

    const response2 = await app.subRequest('GET', '/second-request', {
      Cookie: 'CB=' + sessionId
    });

    expect(response2.body).to.equal(undefined);

  });

  it('should ignore unknown session ids and generate new ones', async() => {

    const app = getApp({
      store: new MemoryStore()
    });
    const response1 = await app.subRequest('GET', '/first-request');
    const cookieHeader1 = response1.headers.get('Set-Cookie');

    let cookieValue = cookieHeader1!.split(';')[0];
    cookieValue+='garbage';

    const response2 = await app.subRequest('GET', '/second-request', {
      Cookie: cookieValue
    });

    expect(response2.body).to.equal(undefined);

    const cookieHeader2 = response2.headers.get('Set-Cookie');
    expect(cookieHeader2).to.not.equal(cookieHeader1);

  });

  it('should ignore unrelated cookies', async() => {

    const app = getApp({
      store: new MemoryStore()
    });
    const response1 = await app.subRequest('GET', '/first-request');
    const sessionId1 = getSessionId(response1);

    const response2 = await app.subRequest('GET', '/second-request', {
      Cookie: 'IGNOREME=' + sessionId1
    });

    expect(response2.body).to.equal(undefined);

  });

  it('should wipe out old sessions if the id was removed', async() => {

    const store = new MemoryStore();
    const app = getApp({
      store
    });
    const response1 = await app.subRequest('GET', '/first-request');
    const sessionId1 = getSessionId(response1);

    expect(await store.get(sessionId1)).to.not.equal(null);

    const response2 = await app.subRequest('GET', '/remove-session-id', {
      Cookie: 'CB=' + sessionId1
    });

    expect(response2.body).to.equal(null);

    const sessionId2 = getSessionId(response2);
    expect(sessionId2).to.not.equal(sessionId1);

    expect(await store.get(sessionId1)).to.equal(null);

  });

  it('should wipe out the old session and not create a new one if data was removed', async() => {

    const store = new MemoryStore();
    const app = getApp({
      store
    });
    const response1 = await app.subRequest('GET', '/first-request');
    const sessionId1 = getSessionId(response1);

    expect(await store.get(sessionId1)).to.not.equal(null);

    const response2 = await app.subRequest('GET', '/remove-session-data', {
      Cookie: 'CB=' + sessionId1
    });

    expect(response2.body).to.equal(null);

    expect(response2.headers.get('Set-Cookie')).to.equal(null);
    expect(await store.get(sessionId1)).to.equal(null);

  });
});


function getApp(options?: any) {

  if (!options) {
    options = {
      store: 'memory'
    };
  }

  const app = new Application();
  app.use(session(options));

  app.use( ctx => {

    if (ctx.path === '/first-request') {
      ctx.session.foo = 'bar';
    }

    if (ctx.path === '/second-request') {
      ctx.response.body = ctx.session.foo;
    }
    if (ctx.path === '/remove-session-id') {
      ctx.sessionId = null;
    }
    if (ctx.path === '/remove-session-data') {
      ctx.session = {};
    }
    ctx.status = 200;

  });

  return app;

}

function getSessionId(response: Response) {

  const header = response.headers.get('Set-Cookie');
  const cookieParts = header!.match(/^CB=([A-Za-z0-9%]+);/)![1];
  return decodeURIComponent(cookieParts);

}
