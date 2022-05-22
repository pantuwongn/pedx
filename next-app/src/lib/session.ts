import type { IronSessionOptions } from "iron-session";
import type { User } from "src/pages/api/user/user";

export const sessionOptions: IronSessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: "pedx/app",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

// typing of req.session
declare module "iron-session" {
  interface IronSessionData {
    user?: User;
  }
}
