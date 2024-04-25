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
    const inline_keyboard = [
      [
        {
          text: "Close",
          callback_data: "CLOSE",
        },
      ],
    ];
    await this.sendDice(chat_id)
  } catch (error) {
    console.log(error);
    return;
  }
}

export default dice;
