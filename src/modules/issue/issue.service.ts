import { StatusCodes } from "http-status-codes";
import { pool } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import type { ICreateIssue, IGetIssuesQuery } from "./issue.interface.js";

export const createIssueIntoDB = async (
  payload: ICreateIssue,
  reporterId: number,
) => {
  //Short descriptive headline, must be provided, maximum 150 characters
  if (payload.title.length > 150) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Short descriptive headline, must be provided, maximum 150 characters",
    );
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

export const getAllIssuesFromDB = async (queryParams: IGetIssuesQuery) => {
  //Build Query
  let query = `
      SELECT
        id,
        title,
        description,
        type,
        status,
        reporter_id,
        created_at,
        updated_at
      FROM issues
    `;

  const conditions: string[] = [];

  const values: string[] = [];

  //Filtering
  if (queryParams.type) {
    values.push(queryParams.type);
    conditions.push(`type = $${values.length}`);
  }

  if (queryParams.status) {
    values.push(queryParams.status);
    conditions.push(`status = $${values.length}`);
  }

  if (conditions.length > 0) {
    query += `
        WHERE ${conditions.join(" AND ")}
      `;
  }

  //Sorting
  const sortOrder = queryParams.sort === "oldest" ? "ASC" : "DESC";

  query += `
      ORDER BY created_at ${sortOrder}
    `;

  const issuesResult = await pool.query(query, values);

  const issues = issuesResult.rows;

  if (issues.length === 0) {
    return [];
  }

  //Get Reporter Ids
  const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id))];

  const placeholders = reporterIds
    .map((_, index) => `$${index + 1}`)
    .join(", ");

  //Fetch Reporters
  const usersQuery = `
      SELECT
        id,
        name,
        role
      FROM users
      WHERE id IN (${placeholders});
    `;

  const usersResult = await pool.query(usersQuery, reporterIds);

  const users = usersResult.rows;

  //Create Reporter 
  const reporterMap = new Map();
  users.forEach((user) => {
    reporterMap.set(user.id, {
      id: user.id,
      name: user.name,
      role: user.role,
    });
  });

  //Format Issues
  const formattedIssues = issues.map((issue) => {
    return {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter: reporterMap.get(issue.reporter_id) || null,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
    };
  });

  return formattedIssues;
};
