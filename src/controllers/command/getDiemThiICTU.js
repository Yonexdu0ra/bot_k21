import puppeteer from "puppeteer";
import checkRedundantCommand from "../../util/checkRedundantCommand.js";
import loginDKTC from "../../util/loginDKTC.js";
import checkSetAccount from "../../util/checkSetAccount.js";
import typingMessage from "../../util/tyingMessage.js";
async function getDiemThiICTU(msg, match) {
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
    const isSetAccount = await checkSetAccount(chat_id);
    if (!isSetAccount.status) {
      await this.sendMessage(chat_id, isSetAccount.message, {
        reply_message_id: message_id,
      });
      return;
    }
    const { deleteMessage } = await typingMessage(this, { chat_id });
    const browser = await puppeteer.launch({
      args: ["--no-sandbox"],
    });
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
    const isLich = await page.evaluate(() => {
      return [...document.querySelectorAll(".cssListItem")][0] ? true : false;
    });
    if (!isLich) {
      await selectSemester(page, 1);
      await page.waitForNavigation();
      await selectSemester(page, 2);
      await page.waitForNavigation();
    }
    const tableData = await page.evaluate(() => {
      // crawl dữ liệu table trong dktc
      const listData = [];
      const table = document.querySelector("#tblStudentMark");
      if (table) {
        const [head, ...body] = table.children[0].children;
        body.pop();
        if (body.length < 1) {
          return listData;
        }
        body.forEach((trElement) => {
          var _danhGia$innerText,
            _diemCC$innerText,
            _diemThi$innerText,
            _diemTongKet$innerTex,
            _tich$innerText;
          const tenHocPhan = trElement.children[2];
          const soTC = trElement.children[3];
          const lanHoc = trElement.children[4];
          const lanThi = trElement.children[5];
          const diemThu = trElement.children[6];
          const laDiemTongKetMon = trElement.children[7];
          const danhGia = trElement.children[8];
          const diemCC = trElement.children[10];
          const diemThi = trElement.children[11];
          const diemTongKet = trElement.children[12];
          const tich = trElement.children[13];
          const obj = {};
          obj["tenHocPhan"] =
            tenHocPhan === null || tenHocPhan === void 0
              ? void 0
              : tenHocPhan.innerText;
          obj["soTC"] =
            soTC === null || soTC === void 0 ? void 0 : soTC.innerText;
          obj["lanHoc"] =
            lanHoc === null || lanHoc === void 0 ? void 0 : lanHoc.innerText;
          obj["lanThi"] =
            lanThi === null || lanThi === void 0 ? void 0 : lanThi.innerText;
          obj["diemThu"] =
            diemThu === null || diemThu === void 0 ? void 0 : diemThu.innerText;
          obj["laDiemTongKetMon"] =
            laDiemTongKetMon === null || laDiemTongKetMon === void 0
              ? void 0
              : laDiemTongKetMon.innerText;
          obj["danhGia"] =
            (danhGia === null ||
            danhGia === void 0 ||
            (_danhGia$innerText = danhGia.innerText) === null ||
            _danhGia$innerText === void 0
              ? void 0
              : _danhGia$innerText.trim()) == ""
              ? "chưa có"
              : danhGia === null || danhGia === void 0
              ? void 0
              : danhGia.innerText.trim();
          obj["diemCC"] =
            (diemCC === null ||
            diemCC === void 0 ||
            (_diemCC$innerText = diemCC.innerText) === null ||
            _diemCC$innerText === void 0
              ? void 0
              : _diemCC$innerText.trim()) == ""
              ? "chưa có"
              : diemCC === null || diemCC === void 0
              ? void 0
              : diemCC.innerText.trim();
          obj["diemThi"] =
            (diemThi === null ||
            diemThi === void 0 ||
            (_diemThi$innerText = diemThi.innerText) === null ||
            _diemThi$innerText === void 0
              ? void 0
              : _diemThi$innerText.trim()) == ""
              ? "chưa có"
              : diemThi === null || diemThi === void 0
              ? void 0
              : diemThi.innerText.trim();
          obj["diemTongKet"] =
            (diemTongKet === null ||
            diemTongKet === void 0 ||
            (_diemTongKet$innerTex = diemTongKet.innerText) === null ||
            _diemTongKet$innerTex === void 0
              ? void 0
              : _diemTongKet$innerTex.trim()) == ""
              ? "chưa có"
              : diemTongKet === null || diemTongKet === void 0
              ? void 0
              : diemTongKet.innerText.trim();
          obj["tich"] =
            (tich === null ||
            tich === void 0 ||
            (_tich$innerText = tich.innerText) === null ||
            _tich$innerText === void 0
              ? void 0
              : _tich$innerText.trim()) == ""
              ? "chưa có"
              : tich === null || tich === void 0
              ? void 0
              : tich.innerText.trim();
          listData.push(obj);
        });
        return listData;
      } else {
        return listData;
      }
    });
    await browser.close();
    if (tableData.length < 1) {
      await deleteMessage();
      await this.sendMessage(chat_id, "Không lấy được thông tin T_T", {
        reply_message_id: message_id,
      });
      return;
    }
    await deleteMessage()
    let text = "Thông tin điểm thi của bạn: ";
    for await (const data of tableData) {
      text += `Môn: <strong>${data.tenHocPhan}</strong>\nCC: <strong>${data.diemCC}</strong>\nĐiểm Thi: <strong>${data.diemThi}</strong>\nĐiểm tổng kết: <strong>${data.diemTongKet}</strong>\nTích: <strong>${data.tich}</strong>\nĐánh giá: <strong>${data.danhGia}</strong>\nLần thi: <strong>${data.lanThi}</strong>\nĐiểm thứ: <strong>${data.diemThu}</strong>\nLà điểm tổng kết môn: <strong>${data.laDiemTongKetMon}</strong>\nLần học: <strong>${data.lanHoc}</strong>\n\n`;
      if (text.length > 1300) {
        this.sendMessage(chat_id, text, {
          parse_mode: "HTML",
        });
        text = "";
      }
    }
    if (text.length > 1) {
      await this.sendMessage(chat_id, text, {
        parse_mode: "HTML",
      });
    }
  } catch (error) {
    console.error(error);
  }
}
export default getDiemThiICTU;
