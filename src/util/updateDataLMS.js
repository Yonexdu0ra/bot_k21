import { config } from "dotenv";
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
    const res = await fetch(url, {
      method: option.method || "POST",
      headers: {
        "content-type": "application/json",
        "X-App-Id": process.env.APP_ID_LMS,
        origin: process.env.URL_LMS,
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
