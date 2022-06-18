import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { errorResponse } from "../../common";

export default async function getRequestDataDashboard(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { t, skip, limit, access_token } = req.body;
  try {
    await axios
      .get(
        `${process.env.BASE_URL_BACKEND}/reuest/get/requests?t=${t}&skip=${skip}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      )
      .then((resp) => res.json(resp.data));
  } catch (error) {
    errorResponse(res, error);
  }
}