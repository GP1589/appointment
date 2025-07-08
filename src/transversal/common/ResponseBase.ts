// types/response.types.ts
import { Response } from "express";

// Base response interface
export interface ApiResponse<T = any> {
  data: T;
  isSuccess: boolean;
  message: string;
  // timestamp: string;
}

// Error response interface
export interface ApiErrorResponse<T = any> extends ApiResponse<T> {
  errorCode: string;
  errors?: Record<string, string[]>; // Para errores de validación
}

// Response utility class
export class ResponseBuilder {
  // Success response
  static success<T>(
    res: Response,
    data: T,
    message: string = "Success",
    statusCode: number = 200
  ): Response {
    const response: ApiResponse<T> = {
      data,
      isSuccess: true,
      message,
      // timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  // Error response
  static error<T = null>(
    res: Response,
    message: string,
    errorCode: string,
    statusCode: number = 500,
    data: T = null as T,
    errors?: Record<string, string[]>
  ): Response {
    const response: ApiErrorResponse<T> = {
      data,
      isSuccess: false,
      message,
      errorCode,
      // timestamp: new Date().toISOString(),
      ...(errors && { errors }),
    };

    return res.status(statusCode).json(response);
  }

  // Not found response
  static notFound<T = null>(
    res: Response,
    message: string = "Resource not found",
    data: T = null as T
  ): Response {
    return this.error(res, message, "NOT_FOUND", 404, data);
  }

  // Bad request response
  static badRequest<T = null>(
    res: Response,
    message: string = "Bad request",
    data: T = null as T,
    errors?: Record<string, string[]>
  ): Response {
    return this.error(res, message, "BAD_REQUEST", 400, data, errors);
  }

  // Unauthorized response
  static unauthorized<T = null>(
    res: Response,
    message: string = "Unauthorized",
    data: T = null as T
  ): Response {
    return this.error(res, message, "UNAUTHORIZED", 401, data);
  }

  // Forbidden response
  static forbidden<T = null>(
    res: Response,
    message: string = "Forbidden",
    data: T = null as T
  ): Response {
    return this.error(res, message, "FORBIDDEN", 403, data);
  }

  // Validation error response
  static validationError(
    res: Response,
    message: string = "Validation failed",
    errors: Record<string, string[]>
  ): Response {
    return this.error(res, message, "VALIDATION_ERROR", 422, null, errors);
  }

  // Created response
  static created<T>(
    res: Response,
    data: T,
    message: string = "Created successfully"
  ): Response {
    return this.success(res, data, message, 201);
  }

  // No content response
  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}

// Alternative: Functional approach (si prefieres funciones independientes)
export const createSuccessResponse = <T>(
  data: T,
  message: string = "Success"
): ApiResponse<T> => ({
  data,
  isSuccess: true,
  message,
  // timestamp: new Date().toISOString(),
});

export const createErrorResponse = <T = null>(
  message: string,
  errorCode: string,
  data: T = null as T,
  errors?: Record<string, string[]>
): ApiErrorResponse<T> => ({
  data,
  isSuccess: false,
  message,
  errorCode,
  // timestamp: new Date().toISOString(),
  ...(errors && { errors }),
});

// Utility functions for common responses
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode?: number
) => ResponseBuilder.success(res, data, message, statusCode);

export const sendError = <T = null>(
  res: Response,
  message: string,
  errorCode: string,
  statusCode?: number,
  data?: T,
  errors?: Record<string, string[]>
) => ResponseBuilder.error(res, message, errorCode, statusCode, data, errors);

export const sendNotFound = <T = null>(
  res: Response,
  message?: string,
  data?: T
) => ResponseBuilder.notFound(res, message, data);

export const sendBadRequest = <T = null>(
  res: Response,
  message?: string,
  data?: T,
  errors?: Record<string, string[]>
) => ResponseBuilder.badRequest(res, message, data, errors);
