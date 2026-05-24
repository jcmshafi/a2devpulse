import type { NextFunction, Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { AppError } from "../utils/AppError.js";

export const authorize =
  (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {

    const user = req.user;
    
    if (!user) {
      return next(
        new AppError(StatusCodes.UNAUTHORIZED, "Unauthorized access"),
      );
    }

    if (!roles.includes(user.role)) {
      return next(new AppError(StatusCodes.FORBIDDEN, "Forbidden access"));
    }

    next();
  };
