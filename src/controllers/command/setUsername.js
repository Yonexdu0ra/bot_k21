import checkRedundantCommand from "../../util/checkRedundantCommand.js";
import Account from "../../model/Account.js";
import tyingMessage from "../../util/tyingMessage.js";
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
    const { value, command } = isRedundantCommand;
    const { editMessage } = await tyingMessage(this, {
      chat_id,
      message: "...",
    });
    await this.deleteMessage(chat_id, message_id);
    if (!value.trim()) {
      await editMessage(`Vui lòng diền theo cú pháp: \`${command} Username\``);
      return;
    }
    let acccount = await Account.findOne({ chat_id });
    if (!acccount) {
      acccount = await Account({ chat_id });
      acccount = await acccount.save();
    }
    const isHasAccount = chat_id in acccount;
    if (!isHasAccount) {
      await Account.updateOne(
        { chat_id },
        {
          username: value.trim(),
        }
      );
      await editMessage(`set *Username* thành công`);

      return;
    }
    await editMessage(`set ~Username thất bại~`);
  } catch (error) {
    console.log(error);
  }
}

export default setUsername;
