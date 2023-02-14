import MemoryStore from '../src/memorystore.js';
import { expect } from 'chai';

describe('MemoryStore', () => {

  it('should instantiate', () => {

    new MemoryStore();

  });

  it('should not give access to expired items', async () => {

    const ms = new MemoryStore();
    await ms.set('foo', {bar: 'bar'}, Math.floor(Date.now() / 1000)-1);
    expect(await ms.get('foo')).to.equal(null);

  });

  it('should garbage collect expired items when accessed', async () => {

    const ms = new MemoryStore();
    await ms.set('foo', {bar: 'bar'}, Math.floor(Date.now() / 1000)-1);

    // Before
    expect(ms.store.get('foo')).to.not.equal(null);

    // Trying to access
    expect(await ms.get('foo')).to.equal(null);

    // After accessing
    expect(ms.store.get('foo')).to.equal(undefined);

  });

  it('should garbage collect expired items when the GC runs', async () => {

    const ms = new MemoryStore();
    await ms.set('foo', {bar: 'bar'}, Math.floor(Date.now() / 1000)-1);
    await ms.set('not-expire', {bar: 'bar'}, Math.floor(Date.now() / 1000)+1000);

    // Before
    expect(ms.store.get('foo')).to.not.equal(null);

    // GC run
    ms.gc();

    // After GC run
    expect(ms.store.get('foo')).to.equal(undefined);
    expect(ms.store.get('not-expire')).to.not.equal(undefined);

  });

  it('should automatically trigger GC', async function() {

    this.timeout(3000);

    const ms = new MemoryStore();
    await ms.set('foo', {bar: 'bar'}, Math.floor(Date.now() / 1000)-1);

    // GC schedule
    ms.scheduleGc(1);

    // Before
    expect(ms.store.get('foo')).to.not.equal(null);

    // Wait 2 seconds
    await (new Promise(res => {
      setTimeout(res, 2000);
    }));

    // After GC run
    expect(ms.store.get('foo')).to.equal(undefined);

  });

  it('should close the GC scheduler', async function() {

    this.timeout(5000);

    const ms = new MemoryStore();

    // GC schedule
    ms.scheduleGc(1);

    // Before
    expect(ms.store.get('foo')).to.not.equal(null);

    // Wait 2 seconds
    await (new Promise(res => {
      setTimeout(res, 2000);
    }));

    // After GC run
    expect(ms.store.get('foo')).to.equal(undefined);

    ms.close();

    // Before
    expect(ms.store.get('bar')).to.not.equal(null);

    // Wait 2 seconds
    await (new Promise(res => {
      setTimeout(res, 2000);
    }));

    // After GC run
    expect(ms.store.get('bar')).to.not.equal(null);

  });

});
