global.API_TOKEN_OPENAI = process.env.API_TOKEN_OPENAI;
import telegramBot from "node-telegram-bot-api";
import express from "express";
import handleCommand from "./util/handleCommand.js";
import listCommand from "./util/listCommand.js";
import connectDB from "./model/index.js";
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

connectDB(
  `mongodb+srv://${process.env.USERNAME_DB}:${encodeURI(
    process.env.PASSWORD_DB
  )}@bot.utkbgol.mongodb.net/?retryWrites=true&w=majority`,
  {  }
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
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("server running");
});
