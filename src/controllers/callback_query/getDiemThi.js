import puppeteer from "puppeteer";
import loginDKTC from "../../util/loginDKTC.js";
import checkSetAccount from "../../util/checkSetAccount.js";
import typingMessage from "../../util/tyingMessage.js";
import browerConfig from "../../config/browser.js";

async function getDiemThiICTU({ data, message }) {
  const chat_id = message.chat.id;
  const message_id = message.message_id;
  try {
    const json = JSON.parse(data);
    const { editMessage } = await typingMessage(this, {
      chat_id,
      message: `Đang lấy dữ liệu của *${json.value}* vui lòng chờ trong giây lát...`,
    });
    const isSetAccount = await checkSetAccount(chat_id);
    if (!isSetAccount.status) {
      await editMessage(isSetAccount.message);
      return;
    }
    const browser = await puppeteer.launch(browerConfig);
    const page = await browser.newPage();
    page.on("dialog", async (dialog) => {
      await dialog.dismiss(); // Đóng thông báo
    });
    const isLogin = await loginDKTC(page, {
      username: isSetAccount.username,
      password: isSetAccount.password,
    });
    if (!isLogin) {
      await browser.close();
      await editMessage(isLogin.message);
      return;
    }
    await page.goto(
      "http://220.231.119.171/kcntt/(S(2o2qniiccej3u3x2pewpijla))/StudentMark.aspx", {
        waitUntil: 'domcontentloaded'
      }
    );
    const selectoHocKy = await page.evaluate((index) => {
      const select = document.querySelector("#drpHK");
      if(!select) {
        return
      }
      if (select?.selectedIndex != index) {
        select.selectedIndex = index;
        select.dispatchEvent(new Event("change"));
      }
      return select.selectedIndex;
    }, json.index);
    if (!selectoHocKy) {
      await page.reload()
    }
    await page.waitForNavigation();
    const listDiemThiData = await page.evaluate(() => {
      const table = document.querySelector("#tblStudentMark");
      if (!table) {
        return [];
      }
      const tbody = table.children[0];
      if (!tbody) {
        return [];
      }
      const list = [...tbody.children];
      list.shift();
      list.pop();
      if (list.length === 0) {
        return [];
      }
      const data = list.map((tr) => {
        var _tds$1$textContent,
          _tds$2$textContent,
          _tds$3$textContent,
          _tds$4$textContent,
          _tds$5$textContent,
          _tds$6$textContent,
          _tds$7$textContent,
          _tds$8$textContent,
          _tds$9$textContent,
          _tds$10$textContent,
          _tds$11$textContent,
          _tds$12$textContent,
          _tds$13$textContent;
        const tds = tr.children;
        return {
          // stt: tds[0].textContent,
          course_code:
            ((_tds$1$textContent = tds[1].textContent) === null ||
            _tds$1$textContent === void 0
              ? void 0
              : _tds$1$textContent.trim()) || "Hiện chưa có",
          module:
            ((_tds$2$textContent = tds[2].textContent) === null ||
            _tds$2$textContent === void 0
              ? void 0
              : _tds$2$textContent.trim()) || "Hiện chưa có",
          credit:
            ((_tds$3$textContent = tds[3].textContent) === null ||
            _tds$3$textContent === void 0
              ? void 0
              : _tds$3$textContent.trim()) || "Hiện chưa có",
          number_of_times_retaken:
            ((_tds$4$textContent = tds[4].textContent) === null ||
            _tds$4$textContent === void 0
              ? void 0
              : _tds$4$textContent.trim()) || "Hiện chưa có",
          number_of_exam_attempts:
            ((_tds$5$textContent = tds[5].textContent) === null ||
            _tds$5$textContent === void 0
              ? void 0
              : _tds$5$textContent.trim()) || "Hiện chưa có",
          ordinal_score:
            ((_tds$6$textContent = tds[6].textContent) === null ||
            _tds$6$textContent === void 0
              ? void 0
              : _tds$6$textContent.trim()) || "Hiện chưa có",
          overall_subject_grade:
            ((_tds$7$textContent = tds[7].textContent) === null ||
            _tds$7$textContent === void 0
              ? void 0
              : _tds$7$textContent.trim()) || "Hiện chưa có",
          evaluation:
            ((_tds$8$textContent = tds[8].textContent) === null ||
            _tds$8$textContent === void 0
              ? void 0
              : _tds$8$textContent.trim()) || "Hiện chưa có",
          student_code:
            ((_tds$9$textContent = tds[9].textContent) === null ||
            _tds$9$textContent === void 0
              ? void 0
              : _tds$9$textContent.trim()) || "Hiện chưa có",
          cc:
            ((_tds$10$textContent = tds[10].textContent) === null ||
            _tds$10$textContent === void 0
              ? void 0
              : _tds$10$textContent.trim()) || "Hiện chưa có",
          score:
            ((_tds$11$textContent = tds[11].textContent) === null ||
            _tds$11$textContent === void 0
              ? void 0
              : _tds$11$textContent.trim()) || "Hiện chưa có",
          total:
            ((_tds$12$textContent = tds[12].textContent) === null ||
            _tds$12$textContent === void 0
              ? void 0
              : _tds$12$textContent.trim()) || "Hiện chưa có",
          letter_grades:
            ((_tds$13$textContent = tds[13].textContent) === null ||
            _tds$13$textContent === void 0
              ? void 0
              : _tds$13$textContent.trim()) || "Hiện chưa có",
        };
      });
      return data;
    });
    await browser.close();
    const inline_keyboard = [
      [
        {
          text: "Close",
          callback_data: "CLOSE",
        },
      ],
    ];
    let text = "";
    for (const data of listDiemThiData) {
      text += `Môn: *${data.module}*\nLần học thứ: *${data.number_of_times_retaken}*\nLà điểm tổng kết: *${data.overall_subject_grade}*\nĐánh giá: *${data.evaluation}*\nChuyên cần: ${data.cc}\nĐiểm thi: *${data.score}*\nĐiểm tổng kết học phần: *${data.total}*\nĐiểm chữ: *${data.letter_grades}*\nSố tín chỉ: *${data.credit}*\n\n`;
    }
    await editMessage(`Đây là thông tin điểm thi của bạn:\n\n${text}`, {
      reply_markup: {
        inline_keyboard,
      },
    });
  } catch (error) {
    console.log(error);
    await this.sendMessage(chat_id, `Lỗi rồi thử lại sau ít phút nhé`)
    return
  }
}

export default getDiemThiICTU;
