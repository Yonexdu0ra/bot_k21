const checkRedundantCommand = async function (bot, match, {chat_id, message_id}) {
  try {
    const isCommand = match[0];
    const indexCommand = match.index;
    const redundantCommand = match.input.split(" ")[0].split(isCommand)[1];
    if (redundantCommand && indexCommand === 0) {
      await bot.sendMessage(chat_id, `Có phải ý bạn là <strong>${isCommand}</strong> ?`, {
        parse_mode: "HTML",
        reply_to_message_id: message_id
      });
      return false
    }
    if (indexCommand !== 0) {
      return false
    }
    return {
      status: true,
      value: match.input.split(isCommand)[1]?.trim() || '',
      command: isCommand
    };
  } catch (error) {
    console.log("checkRedundantCommand error: " + JSON.stringify(error));
  }
};

export default checkRedundantCommand;
