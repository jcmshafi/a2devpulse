export type TIssueType =
  | "bug"
  | "feature_request";

export type TIssueStatus =
  | "open"
  | "in_progress"
  | "resolved";

export interface ICreateIssue {
  title: string;
  description: string;
  type: TIssueType;
}

export interface IGetIssuesQuery {
  sort?: "newest" | "oldest";
  type?: "bug" | "feature_request";
  status?:
    | "open"
    | "in_progress"
    | "resolved";
}