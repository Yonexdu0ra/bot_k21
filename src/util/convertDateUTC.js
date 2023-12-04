import { config } from "dotenv";
config();
export default function () {
  if (process.env.IS_PRODUCTION === "production") {
    const utc_plus_7 = 7;
    
    const date = new Date();
    date.setHours(date.getHours() + utc_plus_7);
    return date;
  } else {
    return new Date();
  }
}
