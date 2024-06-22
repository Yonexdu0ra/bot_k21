import { config } from "dotenv";
import getUrlByUsername from "./getUrlByUsername.js";
config();
const loginLMS = async ({ username, password }) => {
  try {
    const {
      url,  appId, origin
    } = getUrlByUsername(username);
    const res = await fetch(`${url}/${process.env.LOGIN_LMS}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-App-Id": appId,
        origin,
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default loginLMS;
