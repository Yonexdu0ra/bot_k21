import checkRedundantCommand from "../../util/checkRedundantCommand.js";
import typingMessage from "../../util/tyingMessage.js";
import Key from "../../model/Key.js";
import dataConfig from "../../config/data.js";
import Account from "../../model/Account.js";
import "dotenv/config";
async function thiA2(msg, match) {
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
      message: "Chờ tý nhé...",
    });
    if (!value.trim()) {
      await editMessage(
        `Vui lòng điền nội dung theo cú pháp \`${command} email thi a2 của bạn cần lấy đáp án (email ictu)\`\n\n⚠️ *Lưu ý*:  Vui lòng nhập đúng thông tin để tránh bị mất lượt sử dụng của key không mong muốn nhé`
      );
      return;
    }
    if (!value.includes("@")) {
      await editMessage(`Vui lòng điền đúng định dạng email`);
      return;
    }

    const accountData = await Account.findOne({
      chat_id,
    });
    if (!accountData) {
      await editMessage("Vui lòng set key bạn có để sử dụng chức năng này");
      return;
    }
    const isKey = await Key.findOne({ key: accountData.key });
    if (!isKey) {
      // await this.deleteMessage(chat_id, message_id);
      await editMessage(
        `Hmm... key bạn hết lượt sử dụng rồi liên hệ [${dataConfig.admin_name}](${dataConfig.contact_url}) để lấy key nhé`
      );
      return;
    }
    if (isKey.type !== "THIA2") {
      await editMessage("KEY của bạn không dùng được chức năng này");
      return;
    }
    if (isKey.count < 1) {
      await editMessage(
        `Hmm... key bạn hết lượt sử dụng rồi liên hệ [${dataConfig.admin_name}](${dataConfig.contact_url}) để mua thêm lượt nhé`
      );
      return;
    }

    await editMessage(`Đang lấy thông tin...`);
    const res = await fetch(
      `${process.env.URL_SERVER_GLITCH}/api/v1/thia2/?secret_key=${process.env.SECRET_KEY}&email=${value}`
    );
    const data = await res.json();
    if (data.status === "error") {
      await Key.findOneAndUpdate(
        {
          key: accountData.key,
        },
        {
          count: isKey.count,
        }
      );
      await editMessage(`*Lỗi:* ${data.message}`);
      return;
    }

    const inline_keyboard = [];
    const testInfo = data.data.testInfo;
    let text = "Hãy chọn ca thi mà bạn muốn lấy đáp án:";
    let isHasTest = false;
    global.temp_email = value;
    global.access_token_thia2 = data.data.access_token;
    for (const info of testInfo) {
      isHasTest = true;
      inline_keyboard.push([
        {
          text: info.name,
          callback_data: `THIA2-${JSON.stringify({
            value: info.shift_test_id,
          })}`,
        },
      ]);
    }
    if (!isHasTest) {
      await editMessage("Không có ca thi nào sắp tới");
      return;
    }
    inline_keyboard.push([{
      text: 'Close',
      callback_data: 'CLOSE'
    }])
    await editMessage(text, {
      reply_markup: {
        inline_keyboard,
      },
      parse_mode: "Markdown",
    });
  } catch (error) {
    console.log(error);
    await this.sendMessage(chat_id, `Thử lại sau nhé`);
    return;
  }
}

export default thiA2;
