import checkSetAccount from "../../util/checkSetAccount.js";
import typingMessage from "../../util/tyingMessage.js";
import Key from "../../model/Key.js";
import dataConfig from "../../config/data.js";
async function newKey({ data, message }) {
  // const timeStartSkip = new Date();
  const json = JSON.parse(data);
  const chat_id = message.chat.id;
  const message_id = message.message_id;
  try {
    const isSetAccount = await checkSetAccount(chat_id);
    if (!isSetAccount.status) {
      await this.sendMessage(chat_id, isSetAccount.message, {
        reply_to_message_id: message_id,
      });
      return;
    }
    const { editMessage } = await typingMessage(this, {
      chat_id,
      message: "Đang tạo mới key",
    });

    function generateUniqueId(sign) {
      // Lấy số miliseconds tính từ 1/1/1970
      const timestamp = Date.now().toString(36);
      // Tạo một chuỗi ngẫu nhiên
      const randomString = Math.random().toString(36).substring(2, 15);
      // Kết hợp chuỗi miliseconds và chuỗi ngẫu nhiên
      // để tạo ra chuỗi có khả năng duy nhất cao
      return `${sign}_${timestamp}${randomString}`.toLocaleUpperCase();
    }

    const newKey = generateUniqueId(`${dataConfig.sign}_${json.type}`);

    const keyData = await Key.create({
      key: newKey,
      count: json.count,
      type: json.type,
    });

    await editMessage(
      `*Key*:  \`${keyData.key}\`\n\n*Loại*: ${keyData.type}\n\n*Số lượt còn lại*: ${keyData.count}`
    );
  } catch (error) {
    console.error(error);
    await this.sendMessage(chat_id, `Huhu lỗi rồi thử lại sau ít phút nhé`, {
      reply_to_message_id: message_id,
    });
    return;
  }
}
export default newKey;
