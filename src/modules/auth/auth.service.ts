import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { pool } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import type { ILoginUser, IRegisterUser } from "./auth.interface.js";
export const registerUserIntoDB = async (payload: IRegisterUser) => {
  //check if user already exists
  const existingUser = await pool.query(
    `
          SELECT *
          FROM users
          WHERE email = $1;
        `,
    [payload.email],
  );

  if (existingUser.rows.length > 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  // Insert the new user into the database
  const query = `
      INSERT INTO users (
        name,
        email,
        password,
        role
      )

      VALUES ($1, $2, $3, $4)

      RETURNING
        id,
        name,
        email,
        role,
        created_at,
        updated_at;
    `;

  const values = [
    payload.name,

    payload.email,

    hashedPassword,

    payload.role || "contributor",
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

// Login
export const loginUserIntoDB = async (payload: ILoginUser) => {
  const result = await pool.query(
    `
          SELECT *
          FROM users
          WHERE email = $1;
        `,
    [payload.email],
  );

  const user = result.rows[0];

  if (!user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordValid) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
  }

  //Generate JWT token
  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "7d",
    },
  );
  delete user.password;

  return { token, user };
};
