import { Application, Response } from '@curveball/kernel';
import session from '../src/index.js';
import { expect } from 'chai';
import problem from '@curveball/problem';
import bodyParser from '@curveball/bodyparser';

describe('CSRF tokens', () => {

  it('should be generated', async() => {

    const app = getApp();

    const response:any = await app.subRequest('GET', '/get-csrf');
    expect(response.body.csrf).to.not.equal(null);

  });
  it('should generate a stable token for a request', async() => {

    const app = getApp();

    const response:any = await app.subRequest('GET', '/get-csrf-twice');
    expect(response.body.csrf1).to.equal(response.body.csrf2);

  });
  it('should generate a stable token for a session', async() => {

    const app = getApp();

    const response1:any = await app.subRequest('GET', '/get-csrf');
    const token1:any = response1.body.csrf;

    const response2:any = await app.subRequest('GET', '/get-csrf', { 'Cookie': `CB=${getSessionId(response1)}`});
    const token2 = response2.body.csrf;

    expect(token1).to.equal(token2);

  });

  it('should error when validating a token and no token was ever generated', async() => {

    const app = getApp();
    const response = await app.subRequest(
      'POST',
      '/check-token',
      {
        'Content-Type': 'application/json',
      },
      JSON.stringify({ 'csrf-token': 'fafafa' }),
    );
    expect(response.status).to.equal(403);

  });
  it('should error when validating a token and no token was provided', async() => {

    const app = getApp();
    const response1 = await app.subRequest('GET', '/get-csrf');
    const response2 = await app.subRequest('POST', '/check-token', { 'Cookie': `CB=${getSessionId(response1)}`});
    expect(response2.status).to.equal(403);

  });
  it('should error when validating a token and an incorrect token was provided', async() => {

    const app = getApp();
    const response1 = await app.subRequest('GET', '/get-csrf');
    const response2 = await app.subRequest(
      'POST',
      '/check-token',
      {
        'Cookie': `CB=${getSessionId(response1)}`,
        'Content-Type': 'application/json',
      },
      JSON.stringify({ 'csrf-token': 'fafafa' }),
    );
    expect(response2.status).to.equal(403);

  });
  it('should not error when a correct token is given', async() => {

    const app = getApp();
    const response1 = await app.subRequest('GET', '/get-csrf');
    const response2 = await app.subRequest(
      'POST',
      '/check-token',
      {
        'Cookie': `CB=${getSessionId(response1)}`,
        'Content-Type': 'application/json',
      },
      JSON.stringify({ 'csrf-token': (response1.body as any).csrf }),
    );
    expect(response2.status).to.equal(200);

  });

});


function getApp(options?: any) {

  if (!options) {
    options = {
      store: 'memory'
    };
  }

  const app = new Application();
  app.use(problem());
  app.use(bodyParser());
  app.use(session(options));

  app.use( async ctx => {

    if (ctx.path === '/get-csrf') {
      ctx.session.foo = 'bar';
      ctx.response.body = {
        csrf: await ctx.getCsrf()
      };
    }
    if (ctx.path === '/get-csrf-twice') {
      ctx.session.foo = 'bar';
      ctx.response.body = {
        csrf1: await ctx.getCsrf(),
        csrf2: await ctx.getCsrf()
      };
    }
    if (ctx.path === '/check-token') {
      ctx.validateCsrf();
      return;
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
