import puppeteer from "puppeteer";
import checkRedundantCommand from "../../util/checkRedundantCommand.js";
import loginDKTC from "../../util/loginDKTC.js";
import checkSetAccount from "../../util/checkSetAccount.js";
import selectSemester from "../../util/selectSemester.js";
import typingMessage from "../../util/tyingMessage.js";
import browerConfig from "../../config/browser.js";
import convertDateUTC from "../../util/convertDateUTC.js";
async function getLichHocICTU(msg, match) {
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
    const { deleteMessage } = await typingMessage(this, {
      chat_id,
      message: `Đợi chút nhé...\n\n(sau 18h chủ nhật hàng tuần lịch sẽ là của tuần kế tiếp nhé ^^) `,
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
      "http://220.231.119.171/kcntt/(S(33uxr0lc44m242fbvo0zubml))/Reports/Form/StudentTimeTable.aspx"
    );
    const isLich = await page.evaluate(() => {
      return [...document.querySelectorAll(".cssListItem")][0] ? true : false;
    });
    if (!isLich) {
      await selectSemester(page, 2);
      await page.waitForNavigation();
      await selectSemester(page, 1);
      await page.waitForNavigation();
    }
    const data = await page.evaluate(() => {
      // crawl dữ liệu table trong dktc
      const arr = [];
      const table = document.querySelector("table#gridRegistered");
      const [, ...body] = [...table.querySelectorAll("tr")];
      body.pop();
      body.forEach((tr) => {
        var _listTd$, _listTd$2, _listTd$3, _listTd$4, _listTd$5, _listTd$6;
        let obj = {};
        const listTd = [...tr.children];
        const lopHocPhan =
          (_listTd$ = listTd[1]) === null || _listTd$ === void 0
            ? void 0
            : _listTd$.innerText;
        const hocPhan =
          (_listTd$2 = listTd[2]) === null || _listTd$2 === void 0
            ? void 0
            : _listTd$2.innerText;
        let thoiGian =
          (_listTd$3 = listTd[3]) === null || _listTd$3 === void 0
            ? void 0
            : _listTd$3.innerText;
        const diaDiem =
          (_listTd$4 = listTd[4]) === null || _listTd$4 === void 0
            ? void 0
            : _listTd$4.innerText;
        const giangVien =
          (_listTd$5 = listTd[5]) === null || _listTd$5 === void 0
            ? void 0
            : _listTd$5.innerText;
        const soTC =
          (_listTd$6 = listTd[8]) === null || _listTd$6 === void 0
            ? void 0
            : _listTd$6.innerText;
        const scheduleEntries =
          thoiGian === null || thoiGian === void 0
            ? void 0
            : thoiGian.split("\n");
        obj["lopHocPhan"] = lopHocPhan;
        obj["hocPhan"] = hocPhan;
        obj["giangVien"] = giangVien;
        obj["soTC"] = soTC;
        obj["lichHoc"] = {};
        let tuan;
        for (const entry of scheduleEntries) {
          if (entry.trim() === "") {
            // Bỏ qua các dòng trống
            continue;
          } else if (entry.startsWith("Từ ")) {
            const [, startDate, , endDate, date] = entry.split(" ");
            tuan = date;
            obj["lichHoc"][tuan] = {
              startDate,
              endDate: endDate.split(":")[0],
            };
            if (!("date" in obj["lichHoc"][tuan])) {
              obj["lichHoc"][tuan]["date"] = {};
            }
          } else {
            var _entry$trim;
            let [thu, tiet] =
              entry === null ||
              entry === void 0 ||
              (_entry$trim = entry.trim()) === null ||
              _entry$trim === void 0
                ? void 0
                : _entry$trim.split("tiết");
            obj["lichHoc"][tuan]["date"][
              thu === null || thu === void 0 ? void 0 : thu.trim()
            ] = tiet === null || tiet === void 0 ? void 0 : tiet.trim();
          }
        }
        let text = diaDiem.split("\n").join(" ");
        if (text.includes("(")) {
          while (text.includes("(")) {
            let index = text.indexOf("(");
            let index2 = text.indexOf("(", text.indexOf("(") + 1);
            let data = text.slice(index, index2 === -1 ? text.length : index2);
            text = text.slice(index2);
            let [tuan, ...phong] = data.split(" ");
            phong = phong.join(" ");
            tuan = tuan.replace("(", "").replace(")", "").trim().split(",");
            tuan.forEach((x) => {
              obj.lichHoc[`(${x})`]["diaDiem"] = phong;
            });
          }
        } else {
          for (let tuanHoc in obj.lichHoc) {
            if (!obj.lichHoc[tuanHoc]["diaDiem"]) {
              obj.lichHoc[tuanHoc]["diaDiem"] = text;
            }
          }
        }
        arr.push(obj);
      });
      return arr;
    });
    await browser.close();
    const array = [];
    let today = convertDateUTC();
    const convertDate = (dateString) => {
      const parts = dateString.split("/");
      const formattedDate = `${parts[1]}/${parts[0]}/${parts[2]}`;
      return formattedDate;
    };
    let text = "";
    // kiểm tra nếu đây là chủ nhật và sau khi hét giờ học thì sẽ lấy ra lịch của tuần sau
    if (today.getDay() == 0 && today.getHours() >= 18) {
      await deleteMessage();
      text += "Đây là lịch học tuần sau: \n\n";
      today.setDate(today.getDate() + 1);
    }
    data.forEach((obj) => {
      let newObj = {
        ...obj,
        lichHoc: {},
      };
      for (let lich in obj.lichHoc) {
        const dateStart = new Date(convertDate(obj.lichHoc[lich].startDate));
        const dateEnd = new Date(convertDate(obj.lichHoc[lich].endDate));
        if (dateStart <= today && dateEnd >= today) {
          newObj.lichHoc = obj.lichHoc[lich].date;
          newObj["diaDiem"] = obj.lichHoc[lich].diaDiem;
          array.push(newObj);
        }
      }
    });
    let thuTrongTuan = {
      "Thứ 2": 2,
      "Thứ 3": 3,
      "Thứ 4": 4,
      "Thứ 5": 5,
      "Thứ 6": 6,
      "Thứ 7": 7,
      "Chủ nhật": 8,
    };

    //sắp xếp lịch
    array.sort((a, b) => {
      let thuA = Object.keys(a.lichHoc)[0];
      let thuB = Object.keys(b.lichHoc)[0];
      return thuTrongTuan[thuA] - thuTrongTuan[thuB];
    });
    if (data.length < 1) {
      await deleteMessage();
      await this.sendMessage(chat_id, "Tuần này bạn không có lịch học 🥰", {
        reply_to_message_id: message_id,
      });
      return;
    }
    for (let obj of array) {
      text += `Môn Học: <strong>${
        obj.lopHocPhan
      }</strong>\nGiảng viên: <strong>${
        obj.giangVien
      }</strong>\nLịch Học: <strong>${
        JSON.stringify(obj.lichHoc).replace(/[{}]/g, "").replace(/"/g, " ") ||
        "không xác định"
      }</strong>\nĐịa Điểm: <strong>${
        obj.diaDiem || "không xác định"
      }</strong>\n\n`;
    }
    await deleteMessage();
    await this.sendMessage(chat_id, text, {
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_to_message_id: message_id,
    });
  } catch (error) {
    console.error(error);
    await this.sendMessage(chat_id, `Huhu lỗi rồi thử lại sau ít phút nhé`, {
      reply_to_message_id: message_id,
    });
  }
}
export default getLichHocICTU;
