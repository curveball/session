import crypto from 'crypto';
import { promisify } from 'util';
import { SessionStore, SessionValues } from './types';

export default class MemoryStore implements SessionStore {

  store: Map<string, SessionValues>;

  constructor() {

    this.store = new Map();

  }

  async set(id: string, values: SessionValues): Promise<void> {

    this.store.set(id, values);
  }

  async get(id: string): Promise<SessionValues> {

    return this.store.get(id);

  }

  async delete(id: string): Promise<void> {

    this.store.delete(id);

  }

  async newSessionId(): Promise<string> {

    const randomBytes = promisify(crypto.randomBytes);
    const bytes = await randomBytes(32);

    return bytes.toString('base64');

  }

}
