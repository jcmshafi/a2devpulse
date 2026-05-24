import type { Response } from "express";

interface IResponse<T> {
  success: boolean;

  statusCode: number;

  message: string;

  data?: T;

  errors?: unknown;
}

export const sendResponse = <T>(
  res: Response,
  payload: IResponse<T>
) => {

  res.status(payload.statusCode).json({
    success: payload.success,

    message: payload.message,

    data: payload.data,

    errors: payload.errors,
  });

};