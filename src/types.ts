export type SessionOptions = {

  store: SessionStore | 'memory';
  cookieName?: string;
  expiry?: number;
  cookieOptions?: CookieOptions;
};

export type CookieOptions = {
  domain?: string;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  secure?: boolean;
  sameSite: boolean | 'strict' | 'none' | 'lax';
};

export type SessionValues = {
  [s: string]: any;
};

export interface SessionStore {

  /**
   * Creates or updates a session.
   *
   * @param {string} expire UNIX timestamp of when the entry should expire (in seconds).
   */
  set(id: string, values: SessionValues, expire: number): Promise<void>;

  get(id: string): Promise<SessionValues | null>;
  delete(id: string): Promise<void>;
  newSessionId(): Promise<string>;

}
