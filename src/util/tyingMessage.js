const typing_message = async (bot, { chat_id, message = "Đợi chút nhé"}) => {
  try {
    const msg = await bot.sendMessage(chat_id, message);
    return {
      deleteMessage: async () => {
        try {
          await bot.deleteMessage(msg.chat.id, msg.message_id);
        } catch (error) {
          console.log(error);
        }
      },
      editMessage: async (text) => {
        try {
          await bot.editMessageText(text, {
            chat_id: msg.chat.id,
            message_id: msg.message_id,
            parse_mode: "Markdown",
          });
        } catch (error) {
          console.log(error);
        }
      },
    };
  } catch (error) {
    console.log(error);
  }
};

export default typing_message;
