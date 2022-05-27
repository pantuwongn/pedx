import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@/lib/session";
import { ErrorDetail } from "@/lib/fetchJson";
import { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosError } from "axios";

export default withIronSessionApiRoute(getCurrentUser, sessionOptions);

async function getCurrentUser(req: NextApiRequest, res: NextApiResponse) {
  if (req.session.user) {
    try {
      const { access_token } = req.session.user;
      const { data } = await axios.get(
        `${process.env.BASE_URL_BACKEND}/users/me`,
        {
          ...req.headers,
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );
      res.json(data);
    } catch (error) {
      const errorData = (error as AxiosError).response?.data as ErrorDetail;
      res
        .status(500)
        .json({ message: (error as Error).message, detail: errorData?.detail || "Connection refused (Error connection)" });
    }
  }
}
