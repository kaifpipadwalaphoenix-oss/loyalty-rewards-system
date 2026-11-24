export type ErrorCode =
  | 'VALIDATION'
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'INSUFFICIENT_POINTS'
  | 'NOT_ELIGIBLE'
  | 'STORAGE_UNAVAILABLE'
  | 'STORAGE_QUOTA'
  | 'UNKNOWN';

export interface AppError {
  code: ErrorCode;
  message: string;
  fieldErrors?: Record<string, string>;
  details?: Record<string, unknown>;
}

export function createAppError(
  code: ErrorCode,
  message: string,
  fieldErrors?: Record<string, string>,
  details?: Record<string, unknown>
): AppError {
  return { code, message, fieldErrors, details };
}
