// equivalent of typescript-angular generator output — hand-authored fallback
export interface ValidationErrorResponseErrorsInner {
  path?: string;
  message?: string;
}

export interface ValidationErrorResponse {
  code: string;
  error: string;
  errors?: Array<ValidationErrorResponseErrorsInner>;
}
