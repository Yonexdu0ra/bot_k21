process.env.TZ = "Asia/Bangkok"; // set up time zone UTC +7
import telegramBot from "node-telegram-bot-api";
import express from "express";
import handleCommand from "./util/handleCommand.js";
import listCommand from "./util/listCommand.js";
import connectDB from "./model/index.js";
import { CronJob } from "cron";
import "dotenv/config";
import callback_query from "./controllers/callback_query/index.js";
import getWeather from "./util/getWeather.js";
import Student from "./model/Student.js";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

global.store = {
  access_token_thia2: "",
  access_token_lms: "",
};

connectDB(
  `mongodb+srv://${process.env.USERNAME_DB}:${encodeURI(
    process.env.PASSWORD_DB
  )}@bot.utkbgol.mongodb.net/?retryWrites=true&w=majority`,
  {}
).then(() => {
  const bot = new telegramBot(process.env.ACCESS_TOKEN_TELEGRAM, {
    polling: true,
  });

  bot.setMyCommands(listCommand);
  handleCommand.forEach((obj) => {
    bot.onText(obj.regex, obj.handler.bind(bot));
  });
  bot.on("error", () => {
    console.log("Bot error ");
    return;
  });
  bot.on("polling_error", (error) => {
    console.log(error);
  });
  bot.on("callback_query", callback_query.bind(bot));
  bot.on("inline_query", async (query) => {
    const queryId = query.id;
    const queryText = query.query;

    if (queryText.trim() == "") {
      return;
    }

    const data = await Student.find({
      full_name: { $regex: queryText, $options: "i" },
    }).limit(30);

    const results = data.map((item) => {
      return {
        type: "article",
        id: item._id,
        title: `${item.full_name} - ${item.student_code}`,
        input_message_content: {
          message_text: `Thông tin sinh viên:\n *Họ và tên*: \`${item.full_name}\`\n *Mã sinh viên*: \`${item.student_code}\`\n *Ngày sinh*: \`${item.birthday}\`\n *Email*: \`${item.email}\``,
          parse_mode: "Markdown",
        },
      };
    });
    // Sử dụng phương thức answerInlineQuery để gửi kết quả
    await bot.answerInlineQuery(queryId, results);
  });
  const job = new CronJob(
    "30 6 * * *", // cronTime
    async function () {
      try {
        const listId = [5460411588, 5998381242];
        const value = "Thai Nguyen";
        const data = await getWeather(value);
        if (data.cod == "200") {
          for (const id of listId) {
            await bot.sendPhoto(
              id,
              `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
              {
                caption: `*${data.name} (${data.sys.country})*\n${Math.round(
                  data.main.temp
                )}°C ${data.weather[0].description}`,
                parse_mode: "Markdown",
              }
            );
          }
        }
      } catch (error) {
        console.log(error);
      }
    }, // onTick
    null, // onComplete
    true, // start
    "Asia/Ho_Chi_Minh" // timeZone
  );
});

app.listen(process.env.PORT || 3000, () => {
  console.log("server running");
});
