import express from "express";
import { pool } from "./config/db.js";



const app = express();

app.use(express.json());


app.get("/", async(_req, res) => {
  res.json({
    success: true,
    message: "DevPulse API Running",
  });
});


app.get("/test-db", async (_req, res) => {

  const result =
    await pool.query(
      "SELECT NOW()"
    );

  res.json({
    success: true,
    time: result.rows[0],
  });

});


export default app;