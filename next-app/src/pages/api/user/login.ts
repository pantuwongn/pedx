import type { User } from "./user";

import axios, { AxiosError } from "axios";
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@/lib/session";
import { ErrorDetail } from "@/lib/fetchJson";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(loginRoute, sessionOptions);

async function loginRoute(req: NextApiRequest, res: NextApiResponse) {
  const { username, password } = await req.body;

  try {
    const { data } = await axios.post(
      `${process.env.BASE_URL_BACKEND}/users/login`,
      {
        username: username,
        password: password,
      }
    );

    const user = {
      isLoggedIn: true,
      username: data.username,
      avatarUrl: "",
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    } as User;
    req.session.user = user;
    await req.session.save();
    res.json(user);
  } catch (error) {
    const errorData = (error as AxiosError).response?.data as ErrorDetail;
    res
      .status(500)
      .json({ message: (error as Error).message, detail: errorData.detail });
  }
}
