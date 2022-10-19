import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { errorResponse } from "../../common";

export default async function getSummaryRequest(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { product_id, start_date, end_date, access_token } = req.body;
  try {
    await axios
      .get(
        `${process.env.NEXT_PUBLIC_BASE_URL_BACKEND}/request/get/summaryrequests?product_id=${product_id}&start_date=${start_date}&end_date=${end_date}`,
        { headers: { Authorization: `Bearer ${access_token}` } }
      )
      .then((resp) => res.json(resp.data));
  } catch (error) {
    errorResponse(res, error);
  }
}
