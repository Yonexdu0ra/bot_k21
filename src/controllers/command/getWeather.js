import checkRedundantCommand from "../../util/checkRedundantCommand.js";
// import nodeFetch from "node-fetch";
import tyingMessage from "../../util/tyingMessage.js";

async function getWeather(msg, match) {
  const chat_id = msg.chat.id;
  const message_id = msg.message_id;
  try {
    const isRedundantCommand = await checkRedundantCommand(this, match, {
      chat_id,
      message_id,
    });
    if (!isRedundantCommand) {
      return;
    }
    const { value, command } = isRedundantCommand;
    const { editMessage, deleteMessage } = await tyingMessage(this, {
      chat_id,
      message: `Loading...`,
    });
    if (!value.trim()) {
      await editMessage(
        `Vui lòng điền nội dung theo cú pháp: \`${command} Thai Nguyen\`\n\nTrong đó **Thai Nguyen** là thành phố bạn muốn xem và nhập không dấu`
      );
      return;
    }
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${value.trim()}&appid=c666356ba51a2a95cb41a10e7743bd97&units=metric`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.cod == "200") {
      await this.sendPhoto(
        chat_id,
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
        {
          caption: `<strong>${data.name} (${
            data.sys.country
          })</strong>\n${Math.round(data.main.temp)}°C ${
            data.weather[0].description
          }`,
          parse_mode: "HTML",
          reply_to_message_id: message_id,
        }
      );
      await deleteMessage();
      return;
    }
    if (data.code == "404") {
      await editMessage(data.message);
      return;
    }
  } catch (error) {
    console.log(error);
    await this.sendMessage(chat_id, "Huhu lỗi rồi thử được sau iit phút nhé");
    return;
  }
}

export default getWeather;
