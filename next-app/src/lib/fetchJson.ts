import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export async function fetchJson<JSON = unknown>(
  input: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  // console.log("in fetchJSON") //OK
  const response = await fetch(input, init);
  // console.log("response = ", response) //Error status 500
  const data = await response.json();
  // console.log("data = ", data)
  if (response.ok) {
    return data;
  }

  // TODO check status of expired token
  throw new FetchErrorByFetch({
    message: response.statusText,
    response,
    data,
  });
}

export class FetchError extends Error {
  response: Response;
  data: {
    message: string;
    detail: string;
  };
  constructor({
    message,
    response,
    data,
  }: {
    message: string;
    response: Response;
    data: {
      message: string;
      detail: string;
    };
  }) {
    super(message);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FetchError);
    }
    this.name = "FetchError";
    this.response = response;
    this.data = data ?? { message: message };
  }
}

export class FetchErrorByFetch extends Error {
  response: Response;
  data: {
    message: string;
    detail: string;
  };
  constructor({
    message,
    response,
    data,
  }: {
    message: string;
    response: Response;
    data: {
      message: string;
      detail: string;
    };
  }) {
    super(message);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FetchError);
    }
    this.name = "FetchError";
    this.response = response;
    this.data = data ?? { message: message };
  }
}

export interface ErrorDetail {
  detail: string;
}
