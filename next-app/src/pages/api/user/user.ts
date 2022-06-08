import { sessionOptions } from "@/lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

export type User = {
  isLoggedIn: boolean;
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  position_id: number;
  section_code: number;
  concern_section: Array<string>;
  is_admin: boolean;
  is_viewer: boolean;
  is_recorder: boolean;
  is_checker: boolean;
  is_approver: boolean;
  qar_recorder: boolean;
  qar_editor: boolean;

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
      user_id: "",
      firstname: "",
      lastname: "",
      email: "",
      position_id: 0,
      section_code: 0,
      concern_section: [],
      is_admin: false,
      is_viewer: false,
      is_recorder: false,
      is_checker:false,
      is_approver:false,
      qar_recorder:false,
      qar_editor:false,
      avatarUrl: "",
      access_token: "",
      refresh_token: "",
    });
  }
}
