async function tracking(bot, message, allow_id = []) {
  try {
    if (allow_id.length < 1) {
      return;
    }
    if (
      !allow_id.includes(
        message.chat.type === "private" ? message.chat.id : message?.from?.id
      )
    ) {
      await bot.sendMessage(
        message.chat.id,
        `**Thông báo** 🆕\n**Nội dung**: __Có người lấy đáp án.__\n**Lúc**: __${new Date(
          message.date * 1000
        ).toLocaleString()}__\n**Thông tin chi tiết**:\n\`\`\`json\n${JSON.stringify(
          {
            type: message.chat.type,
            chat_id:
              message.chat.type === "private"
                ? message.chat.id
                : message?.from?.id,
            date: message.date,
            user_by: message.chat.username
              ? `${message.chat.first_name} ${
                  message?.chat?.last_name || ""
                }`.trim()
              : `${message.from.first_name} ${
                  message?.from?.last_name || ""
                }`.trim(),
            username:
              message.chat.type === "private"
                ? message.chat.username
                : message?.from?.username,
            text: message?.text || "",
          },
          null,
          4
        )}\n\`\`\``,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: `Phản hồi ${
                    message.chat.username
                      ? `${message.chat.first_name} ${
                          message?.chat?.last_name || ""
                        }`.trim()
                      : `${message.from.first_name} ${
                          message?.from?.last_name || ""
                        }`.trim()
                  }`,
                  callback_data: `RESPONSE-${JSON.stringify({
                    chat_id:
                      message.chat.type === "private"
                        ? message.chat.id
                        : message?.from?.id,
                  })}`,
                },
              ],
            ],
          },
        }
      );
    }
  } catch (error) {
    console.log(error);
    return;
  }
}

export default tracking;
