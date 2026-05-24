import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { loginUserIntoDB, registerUserIntoDB } from "./auth.service.js";

export const signup = catchAsync(async (req, res) => {
  const result = await registerUserIntoDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "User registered successfully",
    data: result,
  });
});

//Login
export const login = catchAsync(async (req, res) => {
  const result = await loginUserIntoDB(req.body);

  sendResponse(res, {
    success: true,

    statusCode: StatusCodes.OK,

    message: "Login successful",

    data: result,
  });
});
