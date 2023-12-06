import checkRedundantCommand from "../../util/checkRedundantCommand.js";
import nodeFetch from "node-fetch";
async function createQR(msg, match) {
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
    if (!value.trim() || value.length < 1) {
      await this.sendMessage(
        chat_id,
        `Vui lòng điền nội dung theo cú pháp: ${command} <strong>Nội dung bạn muốn đưa thành mã QR code</strong>`,
        {
          parse_mode: "HTML",
          reply_to_message_id: message_id,
        }
      );
      return;
    }
    await this.sendPhoto(
      chat_id,
      `https://chart.googleapis.com/chart?cht=qr&chl=${value.trim()}&chs=360x360&chld=L|0`, {
        caption: value.trim(),
        reply_to_message_id: message_id
      }
    );
  } catch (error) {
    console.log(error);
  }
}

export default createQR;
