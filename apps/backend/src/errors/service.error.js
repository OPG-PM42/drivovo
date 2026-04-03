import { AppError } from './app.error';

export class ServiceError extends AppError {
  constructor(code, message, cause) {
    super(code, message, cause);
  }
}
