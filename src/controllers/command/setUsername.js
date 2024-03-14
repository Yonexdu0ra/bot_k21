import checkRedundantCommand from "../../util/checkRedundantCommand.js";
import Account from "../../model/Account.js";
async function setUsername(msg, match) {
  try {
    const chat_id = msg.chat.id;
    const message_id = msg.message_id;
    const a = await Account.find({})
    const isRedundantCommand = await checkRedundantCommand(this, match, {
      chat_id,
      message_id,
    });
    if (!isRedundantCommand) {
      return;
    }
    const { value, command } = isRedundantCommand;
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
      await this.sendMessage(
        chat_id,
        `set <strong>Username</strong> thành công`,
        {
          parse_mode: "HTML",
          reply_to_message_id: message_id,
        }
      );
      return;
    }
    await this.sendMessage(
      chat_id,
      `set <strong>Username</strong> không thành công`,
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
