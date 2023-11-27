import checkRedundantCommand from "../../util/checkRedundantCommand.js";
import listCommand from "../../util/listCommand.js";
async function help(msg, match) {
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
    let text = "Danh sách các lệnh tương tác với Bot:\n";
    for await (const { command, description } of listCommand) {
      text += `<strong>${command}</strong>: <strong>${description}</strong>\n`;
    }
    await this.sendMessage(chat_id, text, { parse_mode: "HTML" });
  } catch (error) {
    console.log(error);
  }
}

export default help;
