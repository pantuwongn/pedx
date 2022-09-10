import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { sessionOptions } from "@/lib/session";
import { errorResponse } from "../common";

export default withIronSessionApiRoute(getCurrentUser, sessionOptions);

async function getCurrentUser(req: NextApiRequest, res: NextApiResponse) {
  if (req.session.user) {
    try {
      const { access_token } = req.session.user;
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL_BACKEND}/users/me`,
        {
          ...req.headers,
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );
      res.json(data);
    } catch (error) {
      errorResponse(res, error);
    }
  }
}
