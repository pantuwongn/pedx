import { IronSessionOptions } from "iron-session";
import type { User } from "@/types/static";

export const sessionOptions: IronSessionOptions = {
  password: process.env.NEXT_PUBLIC_SECRET_COOKIE_PASSWORD as string,
  cookieName: "pedx/app",
  cookieOptions: {
    httpOnly:true,
    maxAge: 86400,
    secure: process.env.NODE_ENV === "production",
  },
};

// typing of req.session
declare module "iron-session" {
  interface IronSessionData {
    user?: User;
  }
}
