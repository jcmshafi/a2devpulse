import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { createIssueIntoDB, getAllIssuesFromDB } from "./issue.service.js";

export const createIssue = catchAsync(async (req, res) => {
  const result = await createIssueIntoDB(req.body, req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Issue created successfully",
    data: result,
  });
});

export const getAllIssues = catchAsync(async (req, res) => {
  const result = await getAllIssuesFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Issues retrieved successfully",
    data: result,
  });
});
