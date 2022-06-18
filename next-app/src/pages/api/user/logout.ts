import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@/lib/session";
import { NextApiRequest, NextApiResponse } from "next";
import type { User } from "@/types/static";

export default withIronSessionApiRoute(logoutRoute, sessionOptions);

function logoutRoute(req: NextApiRequest, res: NextApiResponse<User>) {
  req.session.destroy();
  res.json({
    isLoggedIn: false,
    user_uuid: "",
    user_id: "",
    firstname: "",
    lastname: "",
    email: "",
    position_id: 0,
    section_id: 0,
    concern_section: [],
    is_admin: false,
    is_viewer: false,
    is_recorder: false,
    is_checker: false,
    is_approver: false,
    qar_recorder: false,
    qar_editor: false,
    avatarUrl: "",
    access_token: "",
    refresh_token: "",
  });
}
