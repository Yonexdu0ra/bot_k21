import puppeteer from "puppeteer";
import checkRedundantCommand from "../../util/checkRedundantCommand.js";
import loginDKTC from "../../util/loginDKTC.js";
import checkSetAccount from "../../util/checkSetAccount.js";
import typingMessage from "../../util/tyingMessage.js";
import browerConfig from "../../config/browser.js";
import getLichThi from "../../util/getLichThi.js";
async function getLichThiICTU(msg, match) {
  const chat_id = msg.chat.id;
  const message_id = msg.message_id;
  try {
    const isRedundantCommand = await checkRedundantCommand(this, match, {
      chat_id,
      message_id,
    });
    if (!isRedundantCommand) {
      return;
    }
    const isSetAccount = await checkSetAccount(chat_id);
    if (!isSetAccount.status) {
      await this.sendMessage(chat_id, isSetAccount.message, {
        reply_to_message_id: message_id,
      });
      return;
    }
    const { editMessage, deleteMessage } = await typingMessage(this, {
      chat_id,
      message: "Vui lòng đợi trong giây lát...",
    });
    const isData = getLichThi(isSetAccount.username, isSetAccount.password);
    let newData = await isData.next();
    await editMessage(await newData.value.message);
    while (newData.done === false) {
      newData = await isData.next();
      if (
        newData.value.status === "error" ||
        newData.value.status === "success"
      ) {
        break;
      }
      await editMessage(await newData.value.message);
    }
    if (newData.value.status === "error") {
      await editMessage(await newData.value.message);
      return;
    }
    if (newData.value.data.length < 1) {
      await editMessage("Hiện bạn không có lịch thi của bạn");
      return;
    }
    let text = "Lịch thi của bạn là:\n";
    for (const data of newData.value.data) {
      text += `Môn: *${data.hocPhan}*\nHình thức thi: *${data.hinhThucThi}*\nNgày thi: *${data.ngayThi}*\nCa thi: *${data.caThi}*\nSố báo danh: *${data.soBaoDanh}*\nĐịa điểm: *${data.diaDiem}*\n\n\n`;
    }
    text += "*Chúc bạn may mắn !* 🍀";
    const MAX_LENGTH = 4096;
    if (text.length < MAX_LENGTH) {
      await editMessage(text);
      return;
    }
    await this.sendMessage(chat_id, text, {
      parse_mode: "Markdown",
    });
    await deleteMessage();
  } catch (error) {
    console.error(error);
    await this.sendMessage(chat_id, `Huhu lỗi rồi thử lại sau ít phút nhé`);
    return;
  }
}
export default getLichThiICTU;
