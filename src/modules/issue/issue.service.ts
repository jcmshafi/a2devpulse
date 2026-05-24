import { StatusCodes } from "http-status-codes";
import { pool } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import type {
  ICreateIssue,
  IGetIssuesQuery,
  IUpdateIssue,
} from "./issue.interface.js";

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
  //Detailed explanation of the problem or suggestion, must be provided, minimum 20 characters
  if (payload.description.length < 20) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Detailed explanation of the problem or suggestion, must be provided, minimum 20 characters",
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

export const getSingleIssueFromDB = async (issueId: number) => {
  const issueResult = await pool.query(
    `
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
          WHERE id = $1;
        `,
    [issueId],
  );

  const issue = issueResult.rows[0];

  if (!issue) {
    throw new AppError(StatusCodes.NOT_FOUND, "Issue not found");
  }

  // Fetch Reporter

  const reporterResult = await pool.query(
    `
          SELECT
            id,
            name,
            role
          FROM users
          WHERE id = $1;
        `,
    [issue.reporter_id],
  );

  const reporter = reporterResult.rows[0] || null;

  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };
};

export const updateIssueIntoDB = async (
  issueId: number,
  payload: IUpdateIssue,
  currentUser: {
    id: number;
    role: string;
  },
) => {
  const existingIssueResult = await pool.query(
    `SELECT *
      FROM issues
      WHERE id = $1;
      `,
    [issueId],
  );

  const existingIssue = existingIssueResult.rows[0];

  if (!existingIssue) {
    throw new AppError(StatusCodes.NOT_FOUND, "Issue not found");
  }


  if (currentUser.role === "contributor") {

    if (existingIssue.reporter_id !== currentUser.id) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        "You can only update your own issues",
      );
    }
    //Contributors cannot change non-open status
    if (existingIssue.status !== "open") {
      throw new AppError(
        StatusCodes.CONFLICT,
        "You cannot update non-open issues",
      );
    }
    //Contributors cannot change status
    if (payload.status) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        "Contributors cannot change status",
      );
    }
  }


  if (Object.keys(payload).length === 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, "No update data provided");
  }


  const fields: string[] = [];

  const values: (string | number)[] = [];

  let fieldIndex = 1;

  //title
  if (payload.title) {
    if (payload.title.length > 150) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Title cannot exceed 150 characters",
      );
    }

    fields.push(`title = $${fieldIndex}`);

    values.push(payload.title);

    fieldIndex++;
  }

  //description
  if (payload.description) {
    if (payload.description.length < 20) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Description must be at least 20 characters",
      );
    }

    fields.push(`description = $${fieldIndex}`);

    values.push(payload.description);

    fieldIndex++;
  }

  //type
  if (payload.type) {
    fields.push(`type = $${fieldIndex}`);

    values.push(payload.type);

    fieldIndex++;
  }
  //status
  if (payload.status) {
    fields.push(`status = $${fieldIndex}`);

    values.push(payload.status);

    fieldIndex++;
  }


  fields.push(`updated_at = NOW()`);

  // Update the issue
  const query = `
      UPDATE issues

      SET ${fields.join(", ")}

      WHERE id = $${fieldIndex}

      RETURNING *;
    `;

  values.push(issueId);

  /*
    |--------------------------------------------------------------------------
    | Execute Update
    |--------------------------------------------------------------------------
    */

  const updatedIssueResult = await pool.query(query, values);

  return updatedIssueResult.rows[0];
};
