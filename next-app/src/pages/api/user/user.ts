import { sessionOptions } from "@/lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

import type { User } from "@/types/static";

export default withIronSessionApiRoute(userRoute, sessionOptions);

async function userRoute(req: NextApiRequest, res: NextApiResponse<User>) {
  if (req.session.user) {
    // TODO check expire time interval and check access token expire
    res.json({
      ...req.session.user,
      isLoggedIn: true,
    });
  } else {
    res.json({
      isLoggedIn: false,
      user_uuid: "",
      user_id: "",
      firstname: "",
      lastname: "",
      email: "",
      position_id: 0,
      section_id: 0,
      concern_line: [],
      created_at: "",
      updated_at: "",
      is_active: false,
      is_admin: false,
      is_viewer: false,
      is_recorder: false,
      is_checker: false,
      is_approver: false,
      qar_recorder: false,
      qar_editor: false,
      avatarUrl: "",
      access_token: "",
    });
  }
}
