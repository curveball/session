export class CsrfError extends Error {

  type = 'https://curveball.org/errors/csrf-error';
  title = 'CSRF Error';
  detail: string;
  httpStatus = 403;
  instance = null;
  
  constructor(message: string) {
    super();
    this.detail = message;
  }   

}
