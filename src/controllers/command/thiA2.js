import checkRedundantCommand from "../../util/checkRedundantCommand.js";
import typingMessage from "../../util/tyingMessage.js";
import Key from "../../model/Key.js";
import dataConfig from "../../config/data.js";
import Account from "../../model/Account.js";

import { config, parse } from "dotenv";
config();
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
        `Vui lòng điền nội dung theo cú pháp \`${command}\` *Email cần lấy thông tin đáp án bài kiểm tra THI A2*`
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
    if(accountData) {
      await editMessage('Vui lòng set key bạn có để sử dụng chức năng này')
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
    await editMessage(
      `Trước khi thực hiện mình sẽ trừ đi 1 lần sử dụng của key nhé [${
        msg.from.first_name
      } ${msg.from.last_name || ""}](tg://user?id=${msg.from.id})`
    );
    await Key.findOneAndUpdate(
      {
        key: accountData.key,
      },
      {
        count: isKey.count - 1,
      }
    );
    if (msg.chat.id !== 5460411588) {
      // console.log(msg);
      if (msg.chat.type === "group" || msg.chat.type === "supergroup") {
        await this.sendMessage(
          5460411588,
          `Thông báo 🆕\nNội dung: *Có người lấy đáp án THIA2*\nLúc: *${new Date(
            msg.date * 1000
          )}*\nThông tin chi tiết:\n
          ${
            "```json\n" +
            JSON.stringify(
              {
                type: msg.chat.type,
                chat_id: msg.chat.id,
                date: msg.date,
                used_by: `${
                  msg.from.first_name + " " + (msg.from?.last_name ?? "")
                }`,
                username: msg.chat.username,
                // student_name: profile.data.display_name,
                // student_code: accountData.username,
                // key: json.key,
              },
              null,
              2
            ) +
            "```"
          }`,
          {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Phản hồi",
                    callback_data: `RESPONSE-${JSON.stringify({
                      chat_id: chat_id,
                    })}`,
                  },
                ],
              ],
            },
          }
        );
      } else if (msg.chat.type === "private") {
        await this.sendMessage(
          5460411588,
          `Thông báo 🆕\nNội dung: *Có người lấy đáp án THIA2*\nLúc: *${new Date(
            msg.date * 1000
          )}*\nThông tin chi tiết:\n
          ${
            "```json\n" +
            JSON.stringify(
              {
                type: msg.chat.type,
                chat_id: msg.chat.id,
                date: msg.date,
                used_by: `${
                  msg.chat.first_name +
                  " " +
                  (msg.chat?.last_name ?? "")
                }`,
                username: msg.chat.username,
              },
              null,
              2
            ) +
            "```"
          }`,
          {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Phản hồi",
                    callback_data: `RESPONSE-${JSON.stringify({
                      chat_id: chat_id,
                    })}`,
                  },
                ],
              ],
            },
          }
        );
      }
    }
    await editMessage(`Đang lấy thông tin...`);
    const res = await fetch(
      `${process.env.URL_SERVER_GLITCH_THIA2}/api/v1/thia2/?access_token=${process.env.ACCESS_TOKEN_GLITCH}&email=${value}`
    );
    const data = await res.json();
    if (data.status === "error") {
      await editMessage(data.message);
      return;
    }
    await editMessage(`Đang tiến hành đưa thông tin qua server...`);
    const res2 = await fetch(`${process.env.URL_SERVER_GLITCH_STORE}/api/v1/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data,
      }),
    });
    const data2 = await res2.json();
    if (data2.status === "error") {
      await editMessage(data2.message);
      return;
    }
    await editMessage(
      `Hiệu lực của liên kết này là *dùng 1 lần* và liên kết có hiệu lực *khoảng 5 phút* hãy nhanh chóng truy cập và lưu lại thông tin nhé\n\nhttps://quis.id.vn/core?url=${data2.data}`
    , {
      parse_mode: "Markdown",
    });
  } catch (error) {
    console.log(error);
    await this.sendMessage(chat_id, `Thử lại sau nhé`);
    return;
  }
}

export default thiA2;
