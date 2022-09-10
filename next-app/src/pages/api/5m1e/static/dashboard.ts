import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { errorResponse } from "../../common";

export default async function getStaticDashboard(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await axios
      .get(`${process.env.NEXT_PUBLIC_BASE_URL_BACKEND}/static/5m1e/dashboard`)
      .then((resp) => res.json(resp.data));
  } catch (error) {
    errorResponse(res, error);
  }
}
