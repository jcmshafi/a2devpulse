export type TRole = "contributor" | "maintainer";

export interface IRegisterUser {
  name: string;
  email: string;
  password: string;
  role?: TRole;
}

export interface ILoginUser {
  email: string;
  password: string;
}

