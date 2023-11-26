global.API_TOKEN_OPENAI = process.env.API_TOKEN_OPENAI
import telegramBot from "node-telegram-bot-api";
import express from "express";
import getTimeTable from "./controllers/command/getTimeTable.js";
import getTimeNow from "./controllers/command/getTimeNow.js";
import translate from "./controllers/command/translate.js";
import getWeather from "./controllers/command/getWeather.js";
import setUsername from "./controllers/command/setUsername.js";
import setPassword from "./controllers/command/setPassword.js";
import getLichHocICTU from "./controllers/command/getLichHocICTU.js";
import getLichThiICTU from "./controllers/command/getLichThiICTU.js";
import askGPT from "./controllers/command/askGPT.js";
const app = express();
const listCommnad = [
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
];

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const bot = new telegramBot(process.env.ACCESS_TOKEN_TELEGRAM, {
  polling: true,
});

bot.setMyCommands([
  
    { command: '/ask', description: 'chat với ChatGPT' },
    { command: '/time_now', description: 'Xem thời gian ra vào của tiết học hiện tại (ICTU)' },
    { command: '/time_table', description: 'Xem thời gian ra vào các tiết học (ICTU)' },
    { command: '/weather', description: 'Xem dự báo thời tiết hiện tại' },
    { command: '/dich', description: 'Dịch văn bản sang ngôn ngữ khác' },
    { command: '/dich', description: 'Dịch văn bản sang ngôn ngữ khác' },
    { command: '/lich_hoc', description: 'Xem lịch học của bạn trong tuần (ICTU)' },
    { command: '/lich_thi', description: 'Xem lịch thi của bạn (ICTU)' },
    { command: '/set_user', description: 'Thiết lập Username' },
    { command: '/set_pass', description: 'Thiết lập Password' },
  
])

listCommnad.forEach((obj) => {
  bot.onText(obj.regex, obj.handler.bind(bot));
});

bot.on("error", () => {
  console.log("Bot error ");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("server running");
});
