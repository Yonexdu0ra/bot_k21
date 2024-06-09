import checkRedundantCommand from "../../util/checkRedundantCommand.js";
import listCommand from "../../util/listCommand.js";
import tyingMessage from "../../util/tyingMessage.js";
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
    const { editMessage } = await tyingMessage(
      this,
      {
        chat_id,
        message: `_Danh sách cac lệnh tương tác với Bot_:...`,
      },
      {},
      false
    );
    let text = "_Danh sách các lệnh tương tác với Bot_:\n";
    for await (const { command, description } of listCommand) {
      text += `\`${command}\`:  *${description}*\n`;
    }

    await editMessage(text);
  } catch (error) {
    console.log(error);
    return;
  }
}

export default help;
