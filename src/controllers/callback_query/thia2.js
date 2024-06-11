import typingMessage from "../../util/tyingMessage.js";
import Account from "../../model/Account.js";
import Key from "../../model/Key.js";
import dataConfig from "../../config/data.js";
async function thiA2({ data, message }) {
  const json = JSON.parse(data);
  const chat_id = message.chat.id;
  const message_id = message.message_id;
  try {
    const { editMessage } = await typingMessage(this, {
      chat_id,
      message: "Đợi chút nhé",
    });

    const accountData = await Account.findOne({
      chat_id,
    });
    if (!accountData) {
      await editMessage(`Vui lòng set key bạn có để sử dụng chức năng này`);
      return;
    }
    const isKey = await Key.findOne({ key: accountData.key });
    if (!isKey) {
      await editMessage(
        `Hmm... key bạn hết lượt sử dụng rồi liên hệ [${dataConfig.admin_name}](${dataConfig.contact_url}) để lấy key nhé`
      );
      return;
    }
    if (isKey.type !== "THIA2") {
      await editMessage(`*KEY* của bạn không thể dùng được chức năng này`);
      return;
    }
    if (isKey.count < 1) {
      await editMessage(
        `Hmm... key bạn hết lượt sử dụng rồi liên hệ [${dataConfig.admin_name}](${dataConfig.contact_url}) để mua thêm lượt nhé`
      );
      return;
    }
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
                  msg.chat.first_name + " " + (msg.chat?.last_name ?? "")
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

    await editMessage(`Đang tiến lấy dữ liệu...`);
    const res = await fetch(
      `${process.env.URL_SERVER_GLITCH}/api/v1/thia2/?secret_key=${process.env.SECRET_KEY}&email=${json.e}&shift_test_id=${json.value}`
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
      await editMessage(`Lấy dữ liệu không thành công x_o`);
      return;
    }

    await editMessage(`Đang tạo liên kết...`);
    const res2 = await fetch(`${process.env.URL_SERVER_GLITCH_2}/api/v1/`, {
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
      `⚠️ Hiệu lực của liên kết này là *dùng 1 lần* và liên kết tồn tại *khoảng 5 phút* hãy nhanh chóng truy cập và lưu lại thông tin nhé\n\n*Đây là liên kết của bạn*: [truy cập bài kiểm tra tại đây](${process.env.URL_SERVER_RENDER}/?url=${data2.data})\n\n💡 *Mẹo*: Ở *Window* có thể dùng tổ hợp phím \`Ctrl + s\`,  *Android* ấn \`...\` chọn nút \`download\` để có thể tải lại file để xem sau\n\nNếu gặp sự cố vui lòng liên hệ [Admin](${dataConfig.contact_url})`,
      {
        parse_mode: "Markdown",
      }
    );
  } catch (error) {
    console.error(error);
    await this.sendMessage(chat_id, `Huhu lỗi rồi thử lại sau ít phút nhé`, {
      reply_to_message_id: message_id,
    });
    return;
  }
}
export default thiA2;
