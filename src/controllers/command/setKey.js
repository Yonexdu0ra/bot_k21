import checkRedundantCommand from "../../util/checkRedundantCommand.js";
import Key from "../../model/Key.js";
import Account from "../../model/Account.js";
import typing_message from "../../util/tyingMessage.js";
async function setKey(msg, match) {
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
    const { editMessage } = await typing_message(this, {
      chat_id,
    });
    if (value.length < 1) {
      await editMessage(
        `Vui lòng nhập theo cúp pháp: *${command}* *key bạn được cung cấp*`
      );
      return;
    }
    await editMessage(`Đợi chút để mình xác thực *key* nhé`);
    const isHasKey = await Key.findOne({
      key: value,
    });
    if (!isHasKey) {
      await editMessage(
        `key không hợp lệ vui lòng liên hệ [Cường](https://t.me/nmcuong04) để lấy key`
      );
      return;
    }
    const isAccount = await Account.findOne({
      chat_id,
    });
    if (!isAccount) {
      await editMessage("Đợi mình một chút nữa nhé");
      await Account.create({
        chat_id,
        key: value,
      });
    } else {
      await Account.findOneAndUpdate(
        { chat_id },
        {
          key: value,
        }
      );
    }
    await editMessage(
      `set key thành công key còn ${isHasKey.count} lần sử dụng nhé [${
        msg.from.first_name
      } ${msg.from.last_name || ""}](tg://user?id=${msg.from.id}) !`
    );
  } catch (error) {
    console.log(error);
  }
}

export default setKey;
