import getTimeTable from "../controllers/command/getTimeTable.js";
import getTimeNow from "../controllers/command/getTimeNow.js";
import translate from "../controllers/command/translate.js";
import getWeather from "../controllers/command/getWeather.js";
import setUsername from "../controllers/command/setUsername.js";
import setPassword from "../controllers/command/setPassword.js";
import getLichHocICTU from "../controllers/command/getLichHocICTU.js";
import getLichThiICTU from "../controllers/command/getLichThiICTU.js";
import askGPT from "../controllers/command/askGPT.js";
import help from "../controllers/command/help.js";
import getDiemThiICTU from "../controllers/command/getDiemThiICTU.js";
import skipVideoLMS from "../controllers/command/skipVideoLMS.js";
const handleCommand = [
  {
    regex: /\/ask/,
    handler: askGPT,
  },
  {
    regex: /\/time_table/,
    handler: getTimeTable,
  },
  {
    regex: /\/time_now/,
    handler: getTimeNow,
  },
  {
    regex: /\/dich/,
    handler: translate,
  },
  {
    regex: /\/weather/,
    handler: getWeather,
  },
  {
    regex: /\/set_user/,
    handler: setUsername,
  },
  ,
  {
    regex: /\/set_pass/,
    handler: setPassword,
  },
  {
    regex: /\/lich_hoc/,
    handler: getLichHocICTU,
  },
  {
    regex: /\/lich_thi/,
    handler: getLichThiICTU,
  },
  {
    regex: /\/diem_thi/,
    handler: getDiemThiICTU,
  },
  {
    regex: /\/help/,
    handler: help,
  },
  {
    regex: /\/start/,
    handler: help,
  },
  {
    regex: /\/skip_video_lms/,
    handler: skipVideoLMS,
  },
];

export default handleCommand;
