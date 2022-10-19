import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { errorResponse } from "../../common";

export default async function getRequestDataDashboard(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { t,t_name, access_token } = req.body;
  try {
    await axios
      .get(
        `${process.env.NEXT_PUBLIC_BASE_URL_BACKEND}/request/get/allrequests?t=${t}&t_name=${t_name}`,
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      )
      .then((resp) => res.json(resp.data));
  } catch (error) {
    errorResponse(res, error);
  }
}
