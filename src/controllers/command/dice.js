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
    const { value } = isRedundantCommand;
    const inline_keyboard = [
      // [
      //   {
      //     text: `LESSON`,
      //     callback_data: `NEW_KEY-${JSON.stringify({
      //       type: "LESSON",
      //       count: isNaN(parseInt(value)) ? 1 : parseInt(value),
      //     })}`,
      //   },
      //   {
      //     text: `TEST`,
      //     callback_data: `NEW_KEY-${JSON.stringify({
      //       type: "TEST",
      //       count: isNaN(parseInt(value)) ? 1 : parseInt(value),
      //     })}`,
      //   },
      //   {
      //     text: "Close",
      //     callback_data: "CLOSE",
      //   },
      // ],
    ];
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
    // const results = await this.sendDice(chat_id);
    // if(value.trim() == results.dice.value) {
    //   return await this.sendMessage(chat_id, `${results.dice.value} Ping Pong chính xác !`);
    // }
    // return await this.sendMessage(chat_id, `${results.dice.value} Ôi không sai rồi !`);
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
