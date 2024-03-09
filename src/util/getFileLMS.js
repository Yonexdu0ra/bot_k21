import { config } from "dotenv";
config();
async function getFileLMS(
  url,
  token
) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-App-Id": process.env.APP_ID_LMS,
        origin: process.env.URL_LMS,
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
