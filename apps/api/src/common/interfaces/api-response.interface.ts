/** API Spec v1.0 — §17.7 response envelope */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/** API Spec v1.0 — §17.3 error envelope */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
