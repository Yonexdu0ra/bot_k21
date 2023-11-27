import checkRedundantCommand from "../../util/checkRedundantCommand.js";
import nodeFetch from "node-fetch";
async function translate(msg, match) {
  try {
    const chat_id = msg.chat.id;
    const message_id = msg.message_id;
    const isRedundantCommand = await checkRedundantCommand(this, match, {
      chat_id,
      message_id,
    });
    if (!isRedundantCommand) {
      return;
    }
    const { value, command } = isRedundantCommand;
    if (!value.trim()) {
      await this.sendMessage(
        chat_id,
        `Vui lòng điền nội dung theo cú pháp: ${command} <strong>fuck you</strong> <strong>[vi]</strong>\nTrong đó <strong>[vi]</strong> là viết tắt của ngôn ngữ muốn dịch sang tiếng anh sẽ là <strong>[en]</strong> nên để ở cuối văn bản`,
        {
          parse_mode: "HTML",
          reply_to_message_id: message_id,
        }
      );
      return;
    }
    const options = {
      source: "auto",
      target: "vi",
      text: value,
    };
    const regex = /\[([^\]]+)\]/g;
    const matchesTranslate = value.match(regex);
    if (matchesTranslate) {
      const matchTranslate = matchesTranslate[matchesTranslate.length - 1];
      options.target = matchTranslate.slice(1, -1);
      options.text = value.slice(0, value.lastIndexOf(options.target) - 1);
    }
    if (!options.text) {
      return "Vui lòng điền nội dung cần dịch";
    }
    if (!options.target) {
      return "vui lòng điền ngôn ngữ bạn muốn dịch sang";
    }
    const url =
      "https://translate.googleapis.com/translate_a/single?client=gtx&sl";

    const res = await nodeFetch(
      `${url}=${options.source}&tl=${options.target}&dt=t&q=${encodeURI(
        options.text
      )}`
    );
    const data = await res.json();
    const text = data[0].reduce((curr, nextData) => curr + nextData[0], "");
    await this.sendMessage(chat_id, `<code>${text}</code>`, {
      parse_mode: "HTML",
      reply_to_message_id: message_id,
    });
  } catch (error) {
    console.log(error);
  }
}

export default translate;
