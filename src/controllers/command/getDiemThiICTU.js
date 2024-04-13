import puppeteer from "puppeteer";
import checkRedundantCommand from "../../util/checkRedundantCommand.js";
import loginDKTC from "../../util/loginDKTC.js";
import checkSetAccount from "../../util/checkSetAccount.js";
import typingMessage from "../../util/tyingMessage.js";
import browerConfig from "../../config/browser.js";
import { text } from "express";

async function getDiemThiICTU(msg, match) {
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
        reply_message_id: message_id,
      });
      return;
    }
    const { deleteMessage, editMessage } = await typingMessage(this, {
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
        reply_message_id: message_id,
      });
      await browser.close();
      await deleteMessage();
      return;
    }
    await page.goto(
      "http://220.231.119.171/kcntt/(S(2o2qniiccej3u3x2pewpijla))/StudentMark.aspx"
    );

    const listHocKy = await page.evaluate(() => {
      const select = document.querySelector("#drpHK");
      if (!select) {
        return [];
      }
      const list = [...select.children].map((op, index) => ({
        value: op.value,
        index,
      }));
      return list;
    });
    // const inline_keyboard = [...(listHocKy.map((item) => [
    //       {
    //         text: item.value,
    //         callback_data: `GET_DIEM_THI-${JSON.stringify({
    //           value: item.value,
    //           index: item.index,
    //         })}`,
    //       },
    //     ])), {
    //       text: "Close",
    //       callback_data: "CLOSE",
    //     }]
    let i = listHocKy.length;
    const inline_keyboard = [];
    while(listHocKy.length > 6) {
      const x = listHocKy.slice(0, 6);
      inline_keyboard.push([
        ...(x.map((item) => ({
          text: item.value,
          callback_data: `GET_DIEM_THI-${JSON.stringify({
            value: item.value,
            index: item.index,
          })}`,
        }))),
      ]);
    }
    if(listHocKy.length > 0) {
      inline_keyboard.push([
        ...listHocKy.map((item) => ({
          text: item.value,
          callback_data: `GET_DIEM_THI-${JSON.stringify({
            value: item.value,
            index: item.index,
          })}`,
        })),
      ]);
    }
    inline_keyboard.push([
      {
        text: "Close",
        callback_data: "CLOSE",
      },
    ]);
    // for (const hocky of listHocKy) {
    //   inline_keyboard.push([
    //     {
    //       text: hocky.value,
    //       callback_data: `GET_DIEM_THI-${JSON.stringify({
    //         value: hocky.value,
    //         index: hocky.index,
    //       })}`,
    //     },
    //   ]);
    // }
    // inline_keyboard.push({
    //   text: "Close",
    //   callback_data: "CLOSE",
    // })
    await editMessage(`Chọn học kỳ bạn muốn xem điểm: `, {
      reply_markup: {
        inline_keyboard: inline_keyboard,
      },
    });
  } catch (error) {
    console.error(error);
    await this.sendMessage(chat_id, `Huhu lỗi rồi thử lại sau ít phút nhé`, {
      reply_message_id: message_id,
    });
  }
}
export default getDiemThiICTU;
