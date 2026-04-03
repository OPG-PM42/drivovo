import { AppError } from './app.error';

export class RepositoryError extends AppError {
  constructor(message, cause) {
    super('REPOSITORY_ERROR', message, cause);
  }
}
