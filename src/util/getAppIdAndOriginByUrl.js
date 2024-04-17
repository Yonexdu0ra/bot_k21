import { config } from "dotenv";

config();
function getDataByUrl(url) {
  if (url.toUpperCase().includes("TUEBA")) {
    return {
      url: process.env.URL_LMS_SERVER_TUEBA,
      appId: process.env.APP_ID_LMS_TUEBA,
      origin: process.env.URL_LMS_TUEBA,
    };
  }
  return {
    url: process.env.URL_LMS_SERVER_ICTU,
    appId: process.env.APP_ID_LMS_ICTU,
    origin: process.env.URL_LMS_ICTU,
  };
}

export default getDataByUrl;
