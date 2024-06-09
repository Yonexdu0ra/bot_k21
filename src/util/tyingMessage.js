const typing_message = async (bot, { chat_id, message = "Đợi chút nhé" }, optionsSendMessgae, isTyping = true) => {
  try {
    const msg = await bot.sendMessage(chat_id, message, {
      parse_mode: "Markdown",
      ...optionsSendMessgae
    });
    if(isTyping) {
      await bot.sendChatAction(chat_id, "typing");
    }
    return {
      deleteMessage: async () => {
        try {
          await bot.deleteMessage(msg.chat.id, msg.message_id);
        } catch (error) {
          console.log(error);
        }
      },
      editMessage: async (text, optionsEditMessage = {}) => {
        try {
          await bot.editMessageText(
            text,
            {
              chat_id: msg.chat.id,
              message_id: msg.message_id,
              parse_mode: "Markdown",
              ...optionsEditMessage
            }
          );
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
