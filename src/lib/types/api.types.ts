export type ApiErrorCode = 
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_SERVER_ERROR';

/**
 * The standard structure for a successful API response.
 */
type SuccessResponse<T> = {
  success: true;
  data: T;
};

/**
 * The standard structure for a failed API response.
 */
type ErrorResponse = {
  success: false;
  error: {
    message: string;
    code: ApiErrorCode;
  };
};

/**
 * A union type representing any possible API response.
 * Any API route must return a Promise that resolves to this type.
 */
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
