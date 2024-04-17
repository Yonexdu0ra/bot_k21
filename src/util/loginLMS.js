import { config } from "dotenv";
config();
const loginLMS = async ({ username, password }) => {
  try {
    console.log(username);
    let url = process.env.URL_LMS_SERVER_ICTU,
      appId = process.env.APP_ID_LMS_ICTU,
      origin = process.env.URL_LMS_ICTU;
    if (username?.toUpperCase()?.includes("DTE")) {
      url = process.env.URL_LMS_SERVER_TUEBA;
      appId = process.env.APP_ID_LMS_TUEBA;
      origin = process.env.URL_LMS_TUEBA;
    }
    console.log(url);
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
