import checkRedundantCommand from "../../util/checkRedundantCommand.js";
// import nodeFetch from "node-fetch";
import typingMessage from "../../util/tyingMessage.js";

async function translate(msg, match) {
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
    const { editMessage } = await typingMessage(this, {
      chat_id,
      message: value.trim() || "...",
    });
    if (!value.trim()) {
      await editMessage(
        `Vui lòng điền nội dung theo cú pháp: \`${command} Xin chào [en]\`\n\nTrong đó *Xin chào* là nội dung muốn dịch, *en* là ngôn ngữ muốn dịch sang mặc định không và để trong dấu *[ ]* mặc định sẽ là *[vi]* bạn có thể xem các mã quốc gia [tại đây](https://bankervn.com/ten-quoc-gia-tieng-anh/)`
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

    const res = await fetch(
      `${url}=${options.source}&tl=${options.target}&dt=t&q=${encodeURI(
        options.text
      )}`
    );
    const data = await res.json();
    const text = data[0].reduce((curr, nextData) => curr + nextData[0], "");
    await editMessage(`\`${text}\``);
  } catch (error) {
    console.log(error);
    await this.sendMessage(chat_id, "Huhu lỗi rồi thử lại sau ít phút nhé");
    return;
  }
}

export default translate;
