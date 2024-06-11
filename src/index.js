process.env.TZ = "Asia/Bangkok"; // set up time zone UTC +7
import telegramBot from "node-telegram-bot-api";
import express from "express";
import handleCommand from "./util/handleCommand.js";
import listCommand from "./util/listCommand.js";
import connectDB from "./model/index.js";
import { CronJob } from "cron";
import { config } from "dotenv";
import callback_query from "./controllers/callback_query/index.js";
import getWeather from "./util/getWeather.js";
import data from './config/data.js'
config();
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

global.store = {
  access_token_thia2: '',
  access_token_lms: '',
}


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
    console.log(error)
  })
  bot.on("callback_query", callback_query.bind(bot));
  bot.on('inline_query', async (query) => {
    const queryId = query.id;
    const queryText = query.query;


    if(queryText.trim() == '') {
      return;
    }
    // Tạo một mảng các InlineQueryResult
    const results = [
      {
        type: "article", // Loại kết quả là 'article'
        id: queryId, // ID duy nhất cho kết quả này
        title: queryText, // Tiêu đề của bài viết
        input_message_content: {
          message_text: `Hmm... mình cũng không rõ bạn muốn search gì mong là [mình](${data.contact_url}) có thể giúp gì cho bạn`,
          parse_mode: "Markdown",
        },
      },
      
    ];

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
