import checkRedundantCommand from "../../util/checkRedundantCommand.js";
import listUser from "../../config/listUser.js";
async function setUsername(msg, match) {
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
    const { value, command } = isRedundantCommand
    if (!value.trim()) {
      await this.sendMessage(
        chat_id,
        `Vui lòng điền theo cú pháp: ${command} <strong>Username</strong>`,
        {
          parse_mode: "HTML",
          reply_to_message_id: message_id,
        }
      );
      return;
    }
    const isHasAccount = chat_id in listUser;
    if (!isHasAccount) {
      listUser[chat_id] = {}
    }
    listUser[chat_id]["username"] = value.trim()
    await this.sendMessage(
      chat_id,
      `set <strong>Username</strong> thành công`,
      {
        parse_mode: "HTML",
        reply_to_message_id: message_id,
      }
    );
  } catch (error) {
    console.log(error);
  }
}

export default setUsername;
