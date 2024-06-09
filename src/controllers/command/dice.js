import checkRedundantCommand from "../../util/checkRedundantCommand.js";

async function dice(msg, match) {
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
    const inline_keyboard = [];
    let i = 1;
    while (i <= 6) {
      inline_keyboard.push([
        {
          text: i,
          callback_data: `DICE-${JSON.stringify({
            data: i,
          })}`,
        },
      ]);
      i++;
    }
    inline_keyboard.push([
      {
        text: "Close",
        callback_data: "CLOSE",
      },
    ]);
    await this.sendMessage(chat_id, "Chọn số muốn đoán", {
      reply_markup: {
        inline_keyboard,
      },
    });
  } catch (error) {
    console.log(error);
    return;
  }
}

export default dice;
