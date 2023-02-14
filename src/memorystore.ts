import { randomBytes as rb } from 'crypto';
import { promisify } from 'util';
import { SessionStore, SessionValues } from './types.js';

type SessionData = [
  number,
  SessionValues
];

const randomBytes = promisify(rb);

/**
 * The in-memory session store keeps every session into memory.
 *
 * This has a few major effects:
 *
 * 1. If the server restarts, all sessions are gone.
 * 2. This only ever works with one server. If you need to scale, you need
 *    a different store.
 * 3. It's also leaky in terms of memory. Many active sessions means higher
 *    memory usage.
 *
 * This session store is great for very small scales and testing. You can
 * easily get going with the memory store, and upgrade to a different one
 * when you need it.
 */
export default class MemoryStore implements SessionStore {

  /**
   * Data goes here
   */
  store: Map<string, SessionData>;

  /** Stores the timeout ID for the garbage collector */
  timeoutId: NodeJS.Timeout | null = null;

  constructor() {

    this.store = new Map();
    this.scheduleGc();

  }

  async set(id: string, values: SessionValues, expire: number): Promise<void> {

    this.store.set(id, [expire, values]);

  }

  async get(id: string): Promise<SessionValues | null> {

    const rightNow = Math.floor(Date.now() / 1000);
    const result = this.store.get(id);
    if (!result) {
      return null;
    }
    if (result[0] < rightNow) {
      await this.delete(id);
      return null;
    }
    return result[1];

  }

  async delete(id: string): Promise<void> {

    this.store.delete(id);

  }

  async newSessionId(): Promise<string> {

    const bytes = await randomBytes(32);
    return bytes.toString('base64');

  }

  /**
   * Garbage collector.
   *
   * Loops through sessions and removes all expired sessions.
   */
  gc() {

    const rightNow = Math.floor(Date.now() / 1000);

    for (const [key, value] of this.store.entries()) {
      if (value[0] < rightNow) {
        this.store.delete(key);
      }
    }

  }

  /**
   * Schedules the garbage collector.
   *
   * By default it runs every 600 seconds.
   */
  scheduleGc(interval = 600) {

    this.timeoutId = setTimeout(() => {
      this.gc();
      this.scheduleGc(interval);
    }, interval * 1000);

  }

  /**
   * Cancels the garbage collection scheduler
   */
  close() {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
    }
  }

}
