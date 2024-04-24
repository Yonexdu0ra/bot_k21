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
    let text = "_Danh sách các lệnh tương tác với Bot_:\n";
    for await (const { command, description } of listCommand) {
      text += `\`${command}\`:  *${description}*\n`;
    }
    await this.sendMessage(chat_id, text, { parse_mode: "Markdown" });
  } catch (error) {
    console.log(error);
    return
  }
}

export default help;
