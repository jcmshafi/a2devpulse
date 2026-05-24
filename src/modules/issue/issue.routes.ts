import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { authorize } from "../../middlewares/authorize.js";
import {
  createIssue,
  deleteIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
} from "./issue.controller.js";

const router = Router();

router.post("/", auth, authorize("contributor", "maintainer"), createIssue);
router.get("/", getAllIssues);
router.get("/:id", getSingleIssue);

router.patch("/:id", auth, authorize("contributor", "maintainer"), updateIssue);

router.delete("/:id", auth, authorize("maintainer"), deleteIssue);
export const IssueRoutes = router;
