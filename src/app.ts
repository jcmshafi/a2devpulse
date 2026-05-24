import express from "express";
import { auth } from "./middlewares/auth.js";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";
import { AuthRoutes } from "./modules/auth/auth.routes.js";

const app = express();

app.use(express.json());

app.get("/", async (_req, res) => {
  res.json({
    success: true,
    message: "DevPulse API Running",
  });
});

app.use("/api/auth", AuthRoutes);


//test Protected route
app.get("/api/issues", auth, (req, res) => {
  res.json({
    success: true,
    message: "Protected route accessed",
  });
});

app.use(globalErrorHandler);
export default app;
