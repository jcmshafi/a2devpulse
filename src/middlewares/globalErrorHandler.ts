import type {
    NextFunction,
    Request,
    Response,
  } from "express";
  
  import { StatusCodes }
  from "http-status-codes";
  
  import { AppError }
  from "../utils/AppError.js";
  
  export const globalErrorHandler = (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
  
    let statusCode =
      StatusCodes.INTERNAL_SERVER_ERROR;
  
    let message =
      "Something went wrong";
  
    if (error instanceof AppError) {
  
      statusCode =
        error.statusCode;
  
      message =
        error.message;
  
    }
  
    res.status(statusCode).json({
      success: false,
      message,
      errors: error,
    });
  
  };