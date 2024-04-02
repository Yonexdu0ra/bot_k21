import checkSetAccount from "../../util/checkSetAccount.js";
import typingMessage from "../../util/tyingMessage.js";
import Key from "../../model/Key.js";
async function responseMessage({ data, message }) {
  const json = JSON.parse(data);
  const chat_id = message.chat.id;
  const message_id = message.message_id;
  try {
    await this.sendMessage(chat_id, `Nhập nội dung muốn gửi tới `);
    await this.once("message", async (msg) => {
      this.sendMessage(parseInt(json.chat_id), msg.text || "👀");
    });
  } catch (error) {
    console.error(error);
    await this.sendMessage(
      parseInt(json.chat_id) || chat_id,
      `Huhu lỗi rồi thử lại sau ít phút nhé`,
    );
    return;
  }
}
export default responseMessage;
