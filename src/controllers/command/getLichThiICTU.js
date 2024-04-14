import puppeteer from "puppeteer";
import checkRedundantCommand from "../../util/checkRedundantCommand.js";
import loginDKTC from "../../util/loginDKTC.js";
import checkSetAccount from "../../util/checkSetAccount.js";
import typingMessage from "../../util/tyingMessage.js";
import browerConfig from "../../config/browser.js";
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
    });
    await this.sendChatAction(chat_id, "typing");
    const browser = await puppeteer.launch(browerConfig);
    const page = await browser.newPage();
    page.on("dialog", async (dialog) => {
      await dialog.dismiss(); // Đóng thông báo
    });
    const isLoginDKTC = await loginDKTC(page, {
      username: isSetAccount.username,
      password: isSetAccount.password,
    });
    if (!isLoginDKTC.status) {
      await this.sendMessage(chat_id, isLoginDKTC.message, {
        reply_to_message_id: message_id,
      });
      await browser.close();
      await deleteMessage();
      return;
    }
    await page.goto(
      "http://220.231.119.171/kcntt/(S(ayy1jjjq2yclllwxvh1mgcri))/StudentViewExamList.aspx"
    );
    const tableData = await page.evaluate(() => {
      const table = document.querySelector("table#tblCourseList");
      if (table) {
        const [head, ...body] = [...table.querySelectorAll("tr")];
        body.pop();
        // body mặc định sẽ có 1 element nên phải kiểm tra < 2 thì sẽ coi như là rỗng
        if (body.length < 1) {
          return [];
        }
        const data = [];
        body.forEach((trElement) => {
          var _listTd$,
            _listTd$2,
            _listTd$3,
            _listTd$4,
            _listTd$5,
            _listTd$6,
            _listTd$7;
          const listTd = [...trElement.querySelectorAll("td")];
          const maHocPhan =
            (_listTd$ = listTd[1]) === null || _listTd$ === void 0
              ? void 0
              : _listTd$.innerText;
          const hocPhan =
            (_listTd$2 = listTd[2]) === null || _listTd$2 === void 0
              ? void 0
              : _listTd$2.innerText;
          const ngayThi =
            (_listTd$3 = listTd[4]) === null || _listTd$3 === void 0
              ? void 0
              : _listTd$3.innerText;
          const caThi =
            (_listTd$4 = listTd[5]) === null || _listTd$4 === void 0
              ? void 0
              : _listTd$4.innerText;
          const hinhThucThi =
            (_listTd$5 = listTd[6]) === null || _listTd$5 === void 0
              ? void 0
              : _listTd$5.innerText;
          const soBaoDanh =
            (_listTd$6 = listTd[7]) === null || _listTd$6 === void 0
              ? void 0
              : _listTd$6.innerText;
          const diaDiem =
            (_listTd$7 = listTd[8]) === null || _listTd$7 === void 0
              ? void 0
              : _listTd$7.innerText;
          data.push({
            maHocPhan,
            hocPhan,
            ngayThi,
            caThi,
            hinhThucThi,
            soBaoDanh,
            diaDiem,
          });
        });
        return data;
      } else {
        return [];
      }
    });
    await browser.close();
    if (tableData.length < 1) {
      await editMessage("Hiện bạn không có lịch thi của bạn")
      return;
    }
    let text = "Lịch thi của bạn là:\n";
    for (const data of tableData) {
      text += `Môn: *${data.hocPhan}*\nHình thức thi: *${data.hinhThucThi}*\nNgày thi: *${data.ngayThi}*\nCa thi: *${data.caThi}*\nSố báo danh: *${data.soBaoDanh}*\nĐịa điểm: *${data.diaDiem}*\n\n\n`;
    }
    text += "*Chúc bạn may mắn !* 🍀";
    const MAX_LENGTH = 4096;
    if(text.length < MAX_LENGTH) {
      await editMessage(text);
      return
    }
    await this.sendMessage(chat_id, text, {
      parse_mode: "Markdown",
    });
    await deleteMessage();
  } catch (error) {
    console.error(error);
    await this.sendMessage(chat_id, `Huhu lỗi rồi thử lại sau ít phút nhé`, {
      reply_to_message_id: message_id,
    });
  }
}
export default getLichThiICTU;
