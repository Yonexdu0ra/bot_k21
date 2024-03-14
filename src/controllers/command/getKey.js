import checkRedundantCommand from "../../util/checkRedundantCommand.js";
import Key from "../../model/Key.js";
import typing_message from "../../util/tyingMessage.js";
async function getKey(msg, match) {
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
    const { value } = isRedundantCommand;
    const { editMessage } = await typing_message(this, {
      chat_id,
    });
    const listAllowId = [5460411588, 5998381242];

    if (!listAllowId.includes(msg.from.id)) {
      await editMessage(
        `Rất tiếc bạn không có quyền sử dụng chức năng nay liên hệ [Cường](https://t.me/nmcuong04) để lấy key nhé`
      );
      return;
    }
    editMessage(`Danh sách key:`);
    if (!value.trim()) {
      const listKey = await Key.find({});
      if (!listKey) {
        editMessage(`Chưa có key nào 👀 ! `);
      }
      for (const keyData of listKey) {
        await this.sendMessage(
          chat_id,
          `\n ${"```" + keyData.key + "```"}\nLoại Key: ${
            keyData.type
          }\nSố lượt còn lại: *${keyData.count}*`,
          {
            parse_mode: "Markdown",
            message_id,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: `Tăng lượt`,
                    callback_data: `ADD_KEY-${JSON.stringify({
                      key: keyData.key,
                    })}`,
                  },
                  {
                    text: `Giảm lượt`,
                    callback_data: `REDUCE_KEY-${JSON.stringify({
                      key: keyData.key,
                    })}`,
                  },
                  {
                    text: `Xóa Key`,
                    callback_data: `REMOVE_KEY-${JSON.stringify({
                      key: keyData.key,
                    })}`,
                  },
                  {
                    text: "Close",
                    callback_data: "CLOSE",
                  },
                ],
              ],
            },
          }
        );
      }
      return;
    }
  } catch (error) {
    console.log(error);
  }
}

export default getKey;
