import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { authorize } from "../../middlewares/authorize.js";
import { createIssue, getAllIssues } from "./issue.controller.js";

const router = Router();

router.post("/", auth, authorize("contributor", "maintainer"), createIssue);
router.get("/", getAllIssues);
export const IssueRoutes = router;
