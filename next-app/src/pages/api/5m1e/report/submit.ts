import type { ReportDataType } from "@/types/5m1e";
import { User } from "@/types/static";

import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { errorResponse } from "../../common";

export default async function submit(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    request_process_id,
    request_process_name,
    state_id,
    category,
    list,
    detail,
    kpi,
    product_id,
    line_id,
    process_id,
    machine_no,
    part_no,
    attachment,
    note,
    user: { user_uuid, access_token },
  }: ReportDataType & { user: User } = await req.body;

  try {
    const body = {
      request_process_name: request_process_name,
      data_value: {
        category: category,
        list: list,
        detail: detail,
        kpi: kpi,
        product_id: product_id,
        process_id: process_id,
        machine_no: machine_no,
        part_no: part_no,
        note: note,
      },
      user_uuid: user_uuid,
      line_id: line_id,
      request_process_id: request_process_id,
      current_state_id: state_id,
    };

    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL_BACKEND}/request/submit`,
      body,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );
    console.log(data.request_id);
    res.json(data);
  } catch (error) {
    errorResponse(res, error);
  }
}
