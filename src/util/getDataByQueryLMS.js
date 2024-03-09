import { config } from "dotenv";
import queryParams from "./queryParams.js";
config();
async function getDataByQueryLMS(url, options = {
  query: '',
  token: ''
}) {
  try {
    const query = queryParams(options.query);
    const res = await fetch(`${url}?${query}`, {
      headers: {
        "content-type": "application/json",
        "X-App-Id": process.env.APP_ID_LMS,
        origin: process.env.URL_LMS,
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
