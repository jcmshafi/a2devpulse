import type { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";

import { StatusCodes } from "http-status-codes";

import { AppError } from "../utils/AppError.js";

export const auth = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as Request["user"];

    req.user = decoded;

    next();
  } catch (_error) {
    next(new AppError(StatusCodes.UNAUTHORIZED, "Invalid or expired token"));
  }
};
