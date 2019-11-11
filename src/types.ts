export type SessionOptions = {

  store: SessionStore | 'memory',
  cookieName?: string,
  expiry?: number
  cookieOptions?: CookieOptions,
};

export type CookieOptions = {
  domain?: string,
  expires?: Date,
  httpOnly?: boolean,
  path?: string,
  secure?: boolean,
};

export type SessionValues = {
  [s: string]: any
};

export interface SessionStore {

  /**
   * Creates or updates a session.
   */
  set(id: string, values: SessionValues, expire: number): Promise<void>;

  get(id: string): Promise<SessionValues | null>;
  delete(id: string): Promise<void>;
  newSessionId(): Promise<string>;

}
