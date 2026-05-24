import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { authorize } from "../../middlewares/authorize.js";
import {
  createIssue,
  getAllIssues,
  getSingleIssue,
} from "./issue.controller.js";

const router = Router();

router.post("/", auth, authorize("contributor", "maintainer"), createIssue);
router.get("/", getAllIssues);
router.get("/:id", getSingleIssue);
export const IssueRoutes = router;
