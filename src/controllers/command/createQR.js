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
      message: "Đang tạo mã QR code...",
    });
    if (!value.trim() || value.length < 1) {
      await editMessage(
        `Vui lòng nhập theo cú pháp: \`${command}\` *Nội dung bạn muốn chuyển đổi thành mã QR code*`
      );
      return;
    }
    await deleteMessage();
    const inline_keyboard = [
      [
        {
          text: "Close",
          callback_data: "CLOSE",
        },
      ],
    ];
    await this.sendPhoto(
      chat_id,
      `https://api.qrserver.com/v1/create-qr-code/?data=${value.trim()}&size=500x500`,
      {
        caption: `\`${value.trim()}\``,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard,
        },
      }
    );
  } catch (error) {
    console.log(error);
    await this.sendMessage(chat_id, `Huhu lỗi rồi thử lại sau ít phút nhé`)
    return
  }
}

export default createQR;
