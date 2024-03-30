import checkRedundantCommand from "../../util/checkRedundantCommand.js";
// import nodeFetch from "node-fetch";
import typingMessage from "../../util/tyingMessage.js";

async function createQR(msg, match) {
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
    const { editMessage, deleteMessage } = await typingMessage(this, {
      chat_id,
      message: value.trim() || "...",
    });
    if (!value.trim() || value.length < 1) {
      await editMessage(
        `Vui lòng nhập theo cú pháp: \`${command}\` *Nội dung bạn muốn chuyển đổi thành mã QR code*`
      );
      return;
    }
    await deleteMessage();
    await this.sendPhoto(
      chat_id,
      `https://chart.googleapis.com/chart?cht=qr&chl=${value.trim()}&chs=360x360&chld=L|0`,
      {
        caption: value.trim(),
        reply_to_message_id: message_id,
      }
    );
  } catch (error) {
    console.log(error);
    await this.sendMessage(chat_id, `Huhu lỗi rồi thử lại sau ít phút nhé`)
    return
  }
}

export default createQR;
