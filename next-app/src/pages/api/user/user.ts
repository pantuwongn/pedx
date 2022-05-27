import { sessionOptions } from "@/lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

export type User = {
  isLoggedIn: boolean;
  username: string;
  avatarUrl: string;
  access_token: string;
  refresh_token: string;
};

export default withIronSessionApiRoute(userRoute, sessionOptions);

async function userRoute(req: NextApiRequest, res: NextApiResponse<User>) {
  if (req.session.user) {
    // TODO check expire time interval and check access token expire
    res.json({ ...req.session.user, isLoggedIn: true });
  } else {
    res.json({
      isLoggedIn: false,
      username: "",
      avatarUrl: "",
      access_token: "",
      refresh_token: ""
    });
  }
}
