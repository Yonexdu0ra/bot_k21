import { config } from "dotenv";
import queryParams from "./queryParams.js";
import getAppIdAndOriginByUrl from "./getAppIdAndOriginByUrl.js";
config();
async function getDataByQueryLMS(
  url,
  options = {
    query: "",
    token: "",
    headers: {}
  }
) {
  try {
    const query = queryParams(options.query);
    const { appId, origin } = getAppIdAndOriginByUrl(url);
    const res = await fetch(`${url}?${query}`, {
      headers: {
        "content-type": "application/json",
        "X-App-Id": appId,
        origin,
        authorization: `Bearer ${options.token}`,
      },
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
    return {};
  }
}

export default getDataByQueryLMS;
