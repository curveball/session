export type SessionOptions = {

  store: SessionStore | 'memory',
  cookieName?: string

};

export type SessionValues = {
  [s: string]: any
};

export interface SessionStore {

  set(id: string, values: SessionValues): Promise<void>;
  get(id: string): Promise<SessionValues>;
  delete(id: string): Promise<void>;
  newSessionId(): Promise<string>;

}
