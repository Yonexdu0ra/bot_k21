import checkRedundantCommand from "../../util/checkRedundantCommand.js";
import Account from "../../model/Account.js";
import tyingMessage from "../../util/tyingMessage.js";
async function setPassword(msg, match) {
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
    const { editMessage } = await tyingMessage(this, { chat_id });
    const { value, command } = isRedundantCommand;
    if (!value.trim()) {
      // await this.sendMessage(
      //   chat_id,
      //   `Vui lòng điền theo cú pháp: ${command} <strong>Password</strong>`,
      //   {
      //     parse_mode: "HTML",
      //     reply_to_message_id: message_id,
      //   }
      // );
      await editMessage(
        `Vui lòng diền theo cú pháp: \`${command} Password\``
      );
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
          password: value.trim(),
        }
      );
      await editMessage(`set *Password* thành công`);
      return;
    }
    await editMessage(`set ~Password thất bại~`);
  } catch (error) {
    console.log(error);
  }
}

export default setPassword;
