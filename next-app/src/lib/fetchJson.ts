export default async function fetchJson<JSON = unknown>(
  input: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  const response = await fetch(input, init);

  const data = await response.json();

  if (response.ok) {
    return data;
  }
  // const json = `{"status_code": ${response.status},"message": "${data.message}"}`;
  
  // return JSON.parse(json);
  // TODO check status of expired token
  console.log(response.status)
  console.log(data)
  throw new FetchError({
    message: response.statusText,
    response,
    data,
  });
}

export class FetchError extends Error {
  response: Response;
  data: {
    message: string;
    detail: string
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
      detail: string
    };
  }) {
    super(message);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FetchError);
    }
    (this.name = "FetchError"), (this.response = response);
    this.data = data ?? { message: message };
  }
}


export interface ErrorDetail {
  detail: string
}