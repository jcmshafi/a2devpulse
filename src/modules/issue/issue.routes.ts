import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { authorize } from "../../middlewares/authorize.js";
import { createIssue } from "./issue.controller.js";

const router = Router();

router.post("/", auth, authorize("contributor", "maintainer"), createIssue);

export const IssueRoutes = router;
