process.env.TZ = "Asia/Bangkok"; // set up time zone UTC +7
import telegramBot from "node-telegram-bot-api";
import express from "express";
import handleCommand from "./util/handleCommand.js";
import listCommand from "./util/listCommand.js";
import connectDB from "./model/index.js";
import { config, parse } from "dotenv";
import callback_query from "./controllers/callback_query/index.js";
config();
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

  bot.on("message", async (message) => {
    if (
      (message.video || message.document || message.audio || message.photo) &&
      message.from.id !== 5460411588
    ) {
      await bot.sendMessage(message.chat.id, `👀`, {
        // parse_mode: "Markdown",
        reply_to_message_id: message.message_id,
      });
    }
  });
  bot.on("error", () => {
    console.log("Bot error ");
  });
  bot.on("callback_query", callback_query.bind(bot));
});

app.listen(process.env.PORT || 3000, () => {
  console.log("server running");
});
