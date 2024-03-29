import { config } from "dotenv";
config();
const loginLMS = async ({ username, password }) => {
  try {
    const res = await fetch(process.env.URL_LOGIN_LMS, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-App-Id": process.env.APP_ID_LMS,
        origin: process.env.URL_LMS,
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
