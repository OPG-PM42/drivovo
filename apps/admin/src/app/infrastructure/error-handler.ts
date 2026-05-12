import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class AdminErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    console.error('[AdminErrorHandler]', error);
  }
}
