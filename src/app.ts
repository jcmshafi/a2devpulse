import express from "express";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";
import { AuthRoutes } from "./modules/auth/auth.routes.js";
import { IssueRoutes } from "./modules/issue/issue.routes.js";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", async (_req, res) => {
  res.json({
    success: true,
    message: "DevPulse API Running",
  });
});

app.use("/api/auth", AuthRoutes);

app.use("/api/issues", IssueRoutes);

app.use(globalErrorHandler);
export default app;
