import '@curveball/kernel';

declare module '@curveball/kernel' {


  interface Context {

    /**
     * An object with session data.
     *
     * Anything put in this object will be stored in the session storage.
     */
    session: Record<string, any>;

    /**
     * The sessionId.
     *
     * This is automatically generated, but it's lazy. A session id and cookie
     * will only be made if something is placed in the session.
     */
    sessionId: string | null;

    /**
     * Return a CSRF token
     *
     * This token should for example be added to a form.
     */
    getCsrf(): Promise<string>;

    /**
     * Validate a CSRF token.
     *
     * If no token is provided to this function, we will check
     * ctx.request.body['csrf-token'] instead/
     *
     * If no token is found, or the token is incorrect, this will emit a
     * an exception.
     */
    validateCsrf(token?: string): void;
  }

}
