import checkSetAccount from "../../util/checkSetAccount.js";
import typingMessage from "../../util/tyingMessage.js";
import Key from "../../model/Key.js";
import checkPermisson from "../../util/checkPermisson.js";

async function removeKey({ data, message }) {
  // const timeStartSkip = new Date();
  // console.log(data);
  const chat_id = message.chat.id;
  const message_id = message.message_id;
  // console.log(message);
  try {
    const isSetAccount = await checkSetAccount(chat_id);
    if (!isSetAccount.status) {
      await this.sendMessage(chat_id, isSetAccount.message, {
        reply_to_message_id: message_id,
      });
      return;
    }
    const json = JSON.parse(data);
    const { editMessage } = await typingMessage(this, {
      chat_id,
      message: `Đợi chút để mình xóa Key: *${json.key}*`,
    });
    if (!checkPermisson(chat_id)) {
      await editMessage("Bạn không có quyền sử dụng chức năng này");
      return;
    }
    await Key.deleteOne({
      key: json.key,
    });
    await editMessage(`Đã xóa key: *${json.key}*`);
    await this.deleteMessage(chat_id, message_id);
  } catch (error) {
    console.error(error);
    await this.sendMessage(chat_id, `Huhu lỗi rồi thử lại sau ít phút nhé`, {
      reply_to_message_id: message_id,
    });
    return;
  }
}
export default removeKey;
