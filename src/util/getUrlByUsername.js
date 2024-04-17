import { config } from 'dotenv'
config()
function getUrlByUsername(username) {
  let url = process.env.URL_LMS_SERVER_ICTU,
    appId = process.env.APP_ID_LMS_ICTU,
  origin = process.env.URL_LMS_ICTU;
  if (username?.toUpperCase()?.includes("DTE")) {
    url = process.env.URL_LMS_SERVER_TUEBA;
    appId = process.env.APP_ID_LMS_TUEBA;
    origin = process.env.URL_LMS_TUEBA;
  }
  return {
    url,
    appId,
    origin,
    university: username?.toUpperCase()?.includes("DTE") ? "TUEBA" : "ICTU"
  };
}

export default getUrlByUsername;
