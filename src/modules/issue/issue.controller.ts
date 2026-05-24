import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { createIssueIntoDB } from "./issue.service.js";

export const createIssue = catchAsync(async (req, res) => {

  const result = await createIssueIntoDB(req.body, req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Issue created successfully",
    data: result,
  });
});
