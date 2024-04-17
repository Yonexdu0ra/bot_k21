import { config } from "dotenv";
import getAppIdAndOriginByUrl from "./getAppIdAndOriginByUrl.js";
config();
async function getFileLMS(
  url,
  token
) {
  try {
    const { appId, origin } = getAppIdAndOriginByUrl(url);
    
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-App-Id": appId,
        origin,
        authorization: `Bearer ${token}`,
      }
    });
  
    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
    return {};
  }
}

export default getFileLMS;
