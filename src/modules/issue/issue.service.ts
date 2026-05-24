import { StatusCodes } from "http-status-codes";
import { pool } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import type { ICreateIssue } from "./issue.interface.js";

export const createIssueIntoDB = async (
  payload: ICreateIssue,
  reporterId: number,
) => {


  //Short descriptive headline, must be provided, maximum 150 characters
  if (payload.title.length > 150) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Short descriptive headline, must be provided, maximum 150 characters");
  }


  //check if reporter exists
  const reporter = await pool.query(
    `
          SELECT id
          FROM users
          WHERE id = $1;
        `,
    [reporterId],
  );

  if (reporter.rows.length === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, "Reporter not found");
  }


  const query = `
      INSERT INTO issues (
        title,
        description,
        type,
        reporter_id
      )

      VALUES ($1, $2, $3, $4)

      RETURNING
        id,
        title,
        description,
        type,
        status,
        reporter_id,
        created_at,
        updated_at;
    `;

  const values = [payload.title, payload.description, payload.type, reporterId];

  const result = await pool.query(query, values);

  return result.rows[0];
};
