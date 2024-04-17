import { config } from "dotenv";
import getAppIdAndOriginByUrl from "./getAppIdAndOriginByUrl.js";
config();
async function updateDataLMS(
  url,
  option = {
    body: {},
    token: "",
    method: "POST",
  }
) {
  try {
    const { appId, origin } = getAppIdAndOriginByUrl(url);
    const res = await fetch(url, {
      method: option.method || "POST",
      headers: {
        "content-type": "application/json",
        "X-App-Id": appId,
        origin,
        authorization: `Bearer ${option.token}`,
      },
      body: JSON.stringify(option.body),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
    return {};
  }
}

export default updateDataLMS;
