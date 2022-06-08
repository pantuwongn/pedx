import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export default async function fetchJson<JSON = unknown>(
  config: AxiosRequestConfig
): Promise<JSON> {
  const response = await axios(config).then((resp) => resp);
  const data = response.data;

  if (response.status === 200) {
    return data;
  }
  // const json = `{"status_code": ${response.status},"message": "${data.message}"}`;

  // return JSON.parse(json);
  // TODO check status of expired token
  console.log(response.status);
  console.log(data);
  throw new FetchError({
    message: response.statusText,
    response,
    data,
  });
}

export async function fetchJsonByFetch<JSON = unknown>(
  input: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  const response = await fetch(input, init);
  const data = await response.json();

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
  response: AxiosResponse;
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
    response: AxiosResponse;
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
