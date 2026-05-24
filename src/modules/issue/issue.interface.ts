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