import { NextApiResponse } from "next";
import { AxiosError } from "axios";
import { ErrorDetail } from "@/lib/fetchJson";

export function errorResponse(res: NextApiResponse, error: any) {
  const errorData = (error as AxiosError).response?.data as ErrorDetail;
  res
    .status(500)
    .json({
      message: (error as Error).message,
      detail: errorData?.detail || "Connection refused (Error connection)",
    });
}
