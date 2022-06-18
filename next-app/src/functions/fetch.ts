import { message } from "antd";

import { fetchJson, FetchError, FetchErrorByFetch } from "@/lib/fetchJson";

export async function fetcher(url: string, options: Object = {}): Promise<any> {
  try {
    console.log('fetcher',url,options)
    const data = await fetchJson(url, options);
    return data;

    // let config: AxiosRequestConfig = {
    //   url: url,
    //   ...options,
    // };
    // const data = await fetchJson(config);
    // return data;
  } catch (error) {
    if (error instanceof FetchError || error instanceof FetchErrorByFetch) {
      let msg: string | Array<string> = error.data.detail;
      if (Array.isArray(msg)) {
        // field required error
        if (typeof msg[0] === "object" && "loc" in msg[0] && "msg" in msg[0]) {
          msg = msg.map((m) => `${m["loc"][1]} is a ${m["msg"]}`);
        }
        msg = msg.toString();
      }
      message.error(msg);
    } else {
      message.error(`An unexpected error happened: ${error}`);
    }
    return null
  }
}
