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
import autoCompleteTestLMS from "../controllers/command/autoCompleteTest.js";
import createQR from "../controllers/command/createQR.js";
import newKey from '../controllers/command/newKey.js'
import setKey from '../controllers/command/setKey.js'
import getKey from '../controllers/command/getKey.js'
import dice from '../controllers/command/dice.js'
import thiA2 from '../controllers/command/thiA2.js'
const handleCommand = [
  {
    regex: /\/ask/,
    handler: askGPT,
  },
  {
    regex: /\/thia2/,
    handler: thiA2,
  },
  {
    regex: /\/timetables/,
    handler: getTimeTable,
  },
  {
    regex: /\/time_now/,
    handler: getTimeNow,
  },
  {
    regex: /\/qr/,
    handler: createQR,
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
    regex: /\/lms_video/,
    handler: skipVideoLMS,
  },
  {
    regex: /\/lms_exercise/,
    handler: autoCompleteTestLMS,
  },
  {
    regex: /\/new_key/,
    handler: newKey,
  },
  {
    regex: /\/set_key/,
    handler: setKey,
  },
  {
    regex: /\/get_key/,
    handler: getKey,
  },
  {
    regex: /\/dice/,
    handler: dice,
  },
];

export default handleCommand;
