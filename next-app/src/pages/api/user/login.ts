import type { User } from "@/types/static";

import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@/lib/session";
import { ErrorDetail } from "@/lib/fetchJson";
import { errorResponse } from "../common";

export default withIronSessionApiRoute(loginRoute, sessionOptions);

async function loginRoute(req: NextApiRequest, res: NextApiResponse) {
  const { user_id, user_pass } = await req.body;

  try {
    const { data } = await axios.post(
      `${process.env.BASE_URL_BACKEND}/users/login`,
      {
        user_id: user_id,
        user_pass: user_pass,
      }
    );

    const user = {
      isLoggedIn: true,
      user_uuid: data.user_uuid,
      user_id: data.user_id,
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      position_id: data.position_id,
      section_id: data.section_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      is_active: data.is_active,
      is_admin: data.is_admin,
      is_viewer: data.is_viewer,
      is_recorder: data.is_recorder,
      is_checker: data.is_checker,
      is_approver: data.is_approver,
      qar_recorder: data.qar_recorder,
      qar_editor: data.qar_editor,

      avatarUrl: "",
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    } as User;
    req.session.user = user;
    await req.session.save();
    res.json(user);
  } catch (error) {
    errorResponse(res, error);
  }
}
